import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';

type BuildManifest = {
  pages?: Record<string, string[]>;
};

const root = process.cwd();
const manifestPath = path.join(root, '.next', 'build-manifest.json');

if (!fs.existsSync(manifestPath)) {
  throw new Error('Missing .next/build-manifest.json. Run next build first.');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as BuildManifest;
const declaredPublicFiles = [
  ...(manifest.pages?.['/_app'] ?? [
    'static/chunks/webpack.js',
    'static/chunks/main.js',
    'static/chunks/pages/_app.js',
  ]),
  ...(manifest.pages?.['/'] ?? ['static/chunks/pages/index.js']),
  'static/chunks/framework.js',
].filter((file) => file.endsWith('.js'));

function resolveBuiltFile(file: string): string {
  const absolutePath = path.join(root, '.next', file);
  if (fs.existsSync(absolutePath)) return file;

  const directory = path.dirname(absolutePath);
  const basename = path.basename(file, '.js');
  const hashed = fs
    .readdirSync(directory)
    .filter((candidate) => candidate.startsWith(`${basename}-`) && candidate.endsWith('.js'))
    .sort()
    .at(-1);
  if (!hashed) throw new Error(`Cannot resolve built chunk for ${file}.`);
  return path.relative(path.join(root, '.next'), path.join(directory, hashed));
}

const publicFiles = Array.from(new Set(declaredPublicFiles.map(resolveBuiltFile)));

if (publicFiles.length === 0) throw new Error('Public route chunks were not found in the build manifest.');

const forbiddenTokens = [
  'gijol_graduation_metadata_state',
  'timetable-section-browser',
  'ReactQueryDevtools',
  'QueryClientProvider',
  'ToastProvider',
  '모바일 내비게이션',
];
let totalBytes = 0;
let totalGzipBytes = 0;

publicFiles.forEach((file) => {
  const absolutePath = path.join(root, '.next', file);
  const source = fs.readFileSync(absolutePath);
  totalBytes += source.byteLength;
  totalGzipBytes += gzipSync(source).byteLength;
  const text = source.toString('utf8');

  forbiddenTokens.forEach((token) => {
    if (text.includes(token)) throw new Error(`Public route chunk ${file} contains dashboard token ${token}.`);
  });
});

// Includes every JavaScript chunk reachable from both /_app and the public index route.
const maxGzipBytes = 152 * 1024;
if (totalGzipBytes > maxGzipBytes) {
  throw new Error(`Public route JS is ${totalGzipBytes} gzip bytes, above the ${maxGzipBytes}-byte budget.`);
}

console.log(
  `Public route boundary verified across ${publicFiles.length} chunks (${totalBytes} raw / ${totalGzipBytes} gzip bytes).`,
);
