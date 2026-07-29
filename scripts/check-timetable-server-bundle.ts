import { existsSync, readFileSync } from 'fs';
import path from 'path';

interface TimetableSourceManifestEntry {
  term: string;
  path: string;
}

interface NextFileTrace {
  files?: string[];
}

const rootDir = process.cwd();
const manifestPath = path.join(rootDir, 'features/course-catalog/generated/registration-timetable-sources.json');
const tracePath = path.join(rootDir, '.next/server/pages/api/timetable/[term].js.nft.json');

if (!existsSync(tracePath)) {
  throw new Error(`Missing Next.js file trace for timetable API: ${path.relative(rootDir, tracePath)}`);
}

const sources = JSON.parse(readFileSync(manifestPath, 'utf8')) as TimetableSourceManifestEntry[];
const trace = JSON.parse(readFileSync(tracePath, 'utf8')) as NextFileTrace;
const requiredTerms = ['2026-1', '2026-2'];
const missingTerms = requiredTerms.filter((term) => !sources.some((source) => source.term === term));
const tracedFiles = new Set(
  (trace.files ?? []).map((file) => path.normalize(path.resolve(path.dirname(tracePath), file))),
);

const missingSourceFiles = sources
  .map((source) => path.resolve(rootDir, source.path))
  .filter((sourcePath) => !existsSync(sourcePath));
const missingFromTrace = sources
  .map((source) => path.resolve(rootDir, source.path))
  .filter((sourcePath) => !tracedFiles.has(path.normalize(sourcePath)));

if (missingTerms.length > 0 || missingSourceFiles.length > 0 || missingFromTrace.length > 0) {
  const details = [
    ...missingTerms.map((term) => `missing manifest term: ${term}`),
    ...missingSourceFiles.map((file) => `missing source: ${path.relative(rootDir, file)}`),
    ...missingFromTrace.map((file) => `missing from trace: ${path.relative(rootDir, file)}`),
  ];
  throw new Error(`Timetable API server bundle is incomplete:\n${details.map((detail) => `- ${detail}`).join('\n')}`);
}

console.log(`Verified ${sources.length} timetable JSON files in the timetable API server bundle trace.`);
