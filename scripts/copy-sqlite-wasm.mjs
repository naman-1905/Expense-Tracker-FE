import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(projectRoot, 'node_modules/sql.js/dist/sql-wasm.wasm');
const destination = resolve(projectRoot, 'public/assets/sql-wasm.wasm');

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
