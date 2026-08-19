import fs from 'fs';
import path from 'path';

const targetServicePath = process.argv[2];

if (!targetServicePath) {
  console.error("❌ Please provide a service path. Example:\n  node tools/extract-facts.mjs backend/java-services/dashboard-service");
  process.exit(1);
}

const fullPath = path.join(process.cwd(), targetServicePath);
const docsFactsDir = path.join(fullPath, 'docs', 'facts');

if (!fs.existsSync(fullPath)) {
  console.error(`❌ Path does not exist: ${fullPath}`);
  process.exit(1);
}

fs.mkdirSync(docsFactsDir, { recursive: true });

// 1. Detect Stack Type
let stackType = 'UNKNOWN';
if (fs.existsSync(path.join(fullPath, 'pom.xml')) || targetServicePath.includes('java-services')) {
  stackType = 'JAVA_SPRING_BOOT';
} else if (fs.existsSync(path.join(fullPath, 'package.json')) || targetServicePath.includes('node-services')) {
  stackType = 'NODE_NESTJS';
} else if (fs.readdirSync(fullPath).some(f => f.endsWith('.csproj')) || targetServicePath.includes('dotnet-services') || targetServicePath.includes('api-gateway')) {
  stackType = 'DOTNET';
}

console.log(`🔍 Detected Stack: [${stackType}] for ${targetServicePath}`);

function getAllFiles(dirPath, extensions, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', 'bin', 'obj', 'target', '.git', 'docs'].includes(file)) {
        arrayOfFiles = getAllFiles(filePath, extensions, arrayOfFiles);
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      arrayOfFiles.push(filePath);
    }
  });
  return arrayOfFiles;
}

let routes = [];
let configs = [];
let models = [];
let dependencies = [];

// 2. Stack-Specific Deep Extraction
if (stackType === 'NODE_NESTJS') {
  const tsFiles = getAllFiles(fullPath, ['.ts', '.js']);
  tsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    // Routes & Configs
    const routeMatches = content.match(/@(Get|Post|Put|Delete|Patch)\s*\(\s*['"`](.*?)['"`]\s*\)/g);
    if (routeMatches) routes.push(...routeMatches.map(m => `${m} in ${path.relative(fullPath, file)}`));
    const envMatches = content.match(/process\.env\.[A-Z0-9_]+/g);
    if (envMatches) configs.push(...envMatches);
    
    // Dependencies (Axios, HttpService, Fetch)
    if (content.includes('HttpService') || content.includes('axios.') || content.includes('fetch(')) {
      dependencies.push(`External HTTP Call detected in ${path.relative(fullPath, file)}`);
    }
  });

  // Prisma Database Models
  const prismaFiles = getAllFiles(fullPath, ['.prisma']);
  prismaFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const modelMatches = content.match(/model\s+(\w+)\s*\{/g);
    if (modelMatches) models.push(...modelMatches.map(m => m.replace('model ', '').replace('{', '').trim()));
  });
} 
else if (stackType === 'JAVA_SPRING_BOOT') {
  const files = getAllFiles(fullPath, ['.java', '.yml', '.properties']);
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    // Routes & Configs
    const routeMatches = content.match(/@(Get|Post|Put|Delete|Request)Mapping\s*\(\s*(value\s*=\s*)?["'](.*?)["']/g);
    if (routeMatches) routes.push(...routeMatches.map(m => `${m} in ${path.relative(fullPath, file)}`));
    const envMatches = content.match(/@Value\s*\(\s*["']\${(.*?)}["']\s*\)/g);
    if (envMatches) configs.push(...envMatches);

    // JPA Entities
    if (content.includes('@Entity')) {
      const className = content.match(/public\s+class\s+(\w+)/);
      if (className) models.push(className[1]);
    }

    // Dependencies (RestTemplate, WebClient, Feign)
    if (content.includes('RestTemplate') || content.includes('WebClient') || content.includes('@FeignClient')) {
      dependencies.push(`External HTTP Call detected in ${path.relative(fullPath, file)}`);
    }
  });
} 
else if (stackType === 'DOTNET') {
  const files = getAllFiles(fullPath, ['.cs', '.json']);
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    // Routes & Configs
    const routeMatches = content.match(/\[Http(Get\vert{}Post\vert{}Put\vert{}Delete\vert{}Patch)\s*\(\s*["'](.*?)["']\s*\)\]/g);
    if (routeMatches) routes.push(...routeMatches.map(m => `${m} in ${path.relative(fullPath, file)}`));
    const configMatches = content.match(/Configuration\[["'](.*?)["']\]/g);
    if (configMatches) configs.push(...configMatches);

    // EF Core DbSets
    const dbSetMatches = content.match(/DbSet<(\w+)>/g);
    if (dbSetMatches) models.push(...dbSetMatches.map(m => m.replace('DbSet<', '').replace('>', '')));

    // Dependencies
    if (content.includes('HttpClient ') || content.includes('AddHttpClient')) {
      dependencies.push(`External HTTP Call detected in ${path.relative(fullPath, file)}`);
    }
  });
}

// Deduplicate arrays
models = [...new Set(models)];
dependencies = [...new Set(dependencies)];
configs = [...new Set(configs)];

// 3. Generate Mermaid Blocks for FACTS.md
const serviceName = path.basename(targetServicePath);

let mermaidERD = 'No database entities detected.';
if (models.length > 0) {
  mermaidERD = '```mermaid\nerDiagram\n';
  models.forEach(model => {
    mermaidERD += `    ${model} {\n        string detected\n    }\n`;
  });
  mermaidERD += '```';
}

let mermaidArch = '```mermaid\nflowchart TD\n    Client --> ' + serviceName + '\n';
if (models.length > 0) mermaidArch += `    ${serviceName} --> [(Database)]\n`;
if (dependencies.length > 0) mermaidArch += `    ${serviceName} --> ExternalServices\n`;
mermaidArch += '```';

// 4. Write FACTS.md
const factsContent = `# FACTS PACK FOR ${serviceName.toUpperCase()}

## Stack Meta
- **Detected Stack:** ${stackType}
- **Service Path:** \`${targetServicePath}\`

## Extracted Architecture Indicators
${mermaidArch}

## Database Models
${mermaidERD}

## Extracted API Routes
${routes.length > 0 ? routes.map(r => `- \`${r}\``).join('\n') : '_No explicit HTTP annotations detected._'}

## Extracted Environment / Config Keys
${configs.length > 0 ? configs.map(c => `- \`${c}\``).join('\n') : '_No explicit environment variables detected._'}

## Outbound Dependencies
${dependencies.length > 0 ? dependencies.map(d => `- ${d}`).join('\n') : '_No outbound HTTP calls detected._'}
`;

const factsPath = path.join(docsFactsDir, 'FACTS.md');
fs.writeFileSync(factsPath, factsContent);
console.log(`✅ FACTS.md generated at: ${factsPath}`);