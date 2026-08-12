// tools/extract-facts.mjs
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';

const traverse = _traverse.default ?? _traverse;

// Find all JS/TS files in the src folder
const files = globSync('src/**/*.{js,ts}', { absolute: true });

const extractedFacts = {
    routes: [],
    envVars: new Set()
};

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);

// 1. Traverse each file
for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    
    try {
        const ast = parse(code, {
            sourceType: 'unambiguous',
            plugins: ['typescript', 'decorators-legacy', 'optionalChaining'],
            errorRecovery: true,
        });

        traverse(ast, {
            // Extract Environment Variables (process.env.VAR_NAME)
            MemberExpression(path) {
                if (
                    path.node.object.type === 'MemberExpression' &&
                    path.node.object.object.name === 'process' &&
                    path.node.object.property.name === 'env'
                ) {
                    extractedFacts.envVars.add(path.node.property.name || path.node.property.value);
                }
            },
            
            // Extract Routes (e.g., router.get('/users', ...), app.post('/login', ...))
            CallExpression(path) {
                const callee = path.node.callee;
                if (callee.type === 'MemberExpression' && HTTP_METHODS.has(callee.property.name)) {
                    const args = path.node.arguments;
                    if (args.length > 0 && args[0].type === 'StringLiteral') {
                        const relativeFile = file.split('identity-service/')[1] || file;
                        extractedFacts.routes.push({
                            method: callee.property.name.toUpperCase(),
                            path: args[0].value,
                            file: `${relativeFile}:${path.node.loc.start.line}`
                        });
                    }
                }
            }
        });
    } catch (e) {
        console.warn(`Could not parse ${file}: ${e.message}`);
    }
}

// 2. Generate the FACTS.md file
let markdown = `# Identity Service - Ground Truth Facts\n\n`;
markdown += `> **GENERATED FILE**: Do not edit manually. Copilot must use these exact values.\n\n`;

// Write Env Vars Table
markdown += `## Environment Variables\n`;
markdown += `| Variable Name | Found In Code |\n|---|---|\n`;
for (const env of Array.from(extractedFacts.envVars).sort()) {
    markdown += `| \`${env}\` | ✅ |\n`;
}

// Write Routes Table
markdown += `\n## API Routes\n`;
markdown += `| Method | Path | Source Location |\n|---|---|---|\n`;
for (const route of extractedFacts.routes) {
    markdown += `| \`${route.method}\` | \`${route.path}\` | [src: ${route.file}] |\n`;
}

// Save to docs/facts/FACTS.md
const outDir = path.join(process.cwd(), 'docs', 'facts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'FACTS.md');
fs.writeFileSync(outPath, markdown);

console.log(`✅ Extracted ${extractedFacts.routes.length} routes and ${extractedFacts.envVars.size} env vars.`);
console.log(`✅ Saved to ${outPath}`);