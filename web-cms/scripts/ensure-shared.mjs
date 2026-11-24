import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cmsRoot = path.resolve(__dirname, '..');
const cmsSrc = path.join(cmsRoot, 'src');

const REQUIRED_DIRS = ['components', 'config', 'context', 'i18n', 'lib', 'types'];

for (const dir of REQUIRED_DIRS) {
  const dirPath = path.join(cmsSrc, dir);
  if (!fs.existsSync(dirPath)) {
    console.warn(`[ensure-shared] Warning: directory ${dirPath} does not exist.`);
  }
}
