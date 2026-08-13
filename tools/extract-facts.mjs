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
if (fs.existsSync(path.join(fullPath), 'pom.xml') || targetServicePath.includes('java-services')) {
  stackType = 'JAVA_SPRING_BOOT';
} else if (fs.existsSync(path.join(fullPath), 'package.json') || targetServicePath.includes('node-services')) {
  stackType = 'NODE_NESTJS';
} else if (fs.readdirSync(fullPath).some(f => f.endsWith('.csproj')) || targetServicePath.includes('dotnet-services') || targetServicePath.includes('api-gateway')) {
  stackType = 'DOTNET';
}

console.log(`🔍 Detected Stack: [${stackType}] for ${targetServicePath}`);

// Helper function to recursively read files
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

// 2. Stack-Specific Extraction Logic
if (stackType === 'NODE_NESTJS') {
  const files = getAllFiles(fullPath, ['.ts', '.js']);
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const routeMatches = content.match(/@(Get|Post|Put|Delete|Patch)\s*\(\s*['"`](.*?)['"`]\s*\)/g);
    if (routeMatches) routes.push(...routeMatches.map(m => `${m} in ${path.relative(fullPath, file)}`));
    
    const envMatches = content.match(/process\.env\.[A-Z0-9_]+/g);
    if (envMatches) configs.push(...envMatches);
  });
} 
else if (stackType === 'JAVA_SPRING_BOOT') {
  const files = getAllFiles(fullPath, ['.java', '.yml', '.properties']);
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    // Spring Annotations: @GetMapping("/api/v1/...")
    const routeMatches = content.match(/@(Get|Post|Put|Delete|Request)Mapping\s*\(\s*(value\s*=\s*)?["'](.*?)["']/g);
    if (routeMatches) routes.push(...routeMatches.map(m => `${m} in ${path.relative(fullPath, file)}`));

    // Spring Configs: @Value("${CONFIG_KEY}") or yml properties
    const envMatches = content.match(/@Value\s*\(\s*["']\${(.*?)}["']\s*\)/g);
    if (envMatches) configs.push(...envMatches);
  });
} 
else if (stackType === 'DOTNET') {
  const files = getAllFiles(fullPath, ['.cs', '.json']);
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    // C# Attributes: [HttpGet("route")]
    const routeMatches = content.match(/\[Http(Get|Post|Put|Delete|Patch)\s*\(\s*["'](.*?)["']\s*\)\]/g);
    if (routeMatches) routes.push(...routeMatches.map(m => `${m} in ${path.relative(fullPath, file)}`));

    // C# Configuration: builder.Configuration["KEY"] or appsettings
    const configMatches = content.match(/Configuration\[["'](.*?)["']\]/g);
    if (configMatches) configs.push(...configMatches);
  });
}

// 3. Write FACTS.md
const factsContent = `# FACTS PACK FOR ${path.basename(targetServicePath).toUpperCase()}

## Stack Meta
- **Detected Stack:** ${stackType}
- **Service Path:** \`${targetServicePath}\`

## Extracted API Routes
${routes.length > 0 ? routes.map(r => `- \`${r}\``).join('\n') : '_No explicit HTTP annotations detected._'}

## Extracted Environment / Config Keys
${configs.length > 0 ? [...new Set(configs)].map(c => `- \`${c}\``).join('\n') : '_No explicit environment variables detected._'}
`;

const factsPath = path.join(docsFactsDir, 'FACTS.md');
fs.writeFileSync(factsPath, factsContent);
console.log(`✅ FACTS.md generated at: ${factsPath}`);