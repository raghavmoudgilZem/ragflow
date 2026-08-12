import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';
import { services } from './api-services.config.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const generatedDir = path.resolve(scriptDir, '../src/shared/api/generated');

const toNamespace = (name) =>
  name.replace(/[-_](\w)/g, (_, character) => character.toUpperCase());

const toSpecInput = (spec) =>
  /^https?:\/\//i.test(spec) ? new URL(spec) : pathToFileURL(path.resolve(spec));

const resolveTargets = () => {
  const [name, spec] = process.argv.slice(2);
  if (name && spec) {
    return [{ name, spec }];
  }
  if (name && !spec) {
    throw new Error(
      'Usage: npm run generate-api -- <name> <specUrlOrFile> (or configure scripts/api-services.config.mjs)',
    );
  }
  return services;
};

const generateService = async ({ name, spec }) => {
  const ast = await openapiTS(toSpecInput(spec));
  const contents = astToString(ast);
  const outputPath = path.join(generatedDir, `${name}.ts`);
  await writeFile(
    outputPath,
    contents.endsWith('\n') ? contents : `${contents}\n`,
  );
};

const writeBarrel = async () => {
  const files = (await readdir(generatedDir))
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .sort();
  if (files.length === 0) {
    return;
  }
  const lines = files.map((file) => {
    const base = file.replace(/\.ts$/, '');
    return `export * as ${toNamespace(base)} from './${base}';`;
  });
  await writeFile(path.join(generatedDir, 'index.ts'), `${lines.join('\n')}\n`);
};

const run = async () => {
  let targets;
  try {
    targets = resolveTargets();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (targets.length === 0) {
    console.log('No services configured; nothing to generate.');
    return;
  }

  await mkdir(generatedDir, { recursive: true });

  let failed = false;
  for (const service of targets) {
    try {
      await generateService(service);
      console.log(`✓ ${service.name}`);
    } catch (error) {
      failed = true;
      console.error(`✗ ${service.name}: ${error.message}`);
    }
  }

  await writeBarrel();

  if (failed) {
    process.exit(1);
  }
};

run();
