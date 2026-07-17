import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

import { buildCourseCatalogSnapshotFromWorkspace } from '../../features/course-catalog/node';
import { validateCourseCatalogSnapshot } from '../../features/course-catalog/inspect';
import { stringifyCourseCatalogSnapshot } from '../../features/course-catalog/serialization';

function getOutPath(argv: readonly string[]): string | undefined {
  const outIndex = argv.indexOf('--out');
  if (outIndex === -1) return undefined;
  return argv[outIndex + 1];
}

function main(): void {
  const outPath = getOutPath(process.argv.slice(2));
  const { snapshot } = buildCourseCatalogSnapshotFromWorkspace();
  const issues = validateCourseCatalogSnapshot(snapshot);

  if (issues.length > 0) {
    console.error('Invalid course catalog snapshot:');
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
    return;
  }

  const json = `${stringifyCourseCatalogSnapshot(snapshot)}\n`;

  if (!outPath) {
    process.stdout.write(json);
    return;
  }

  const absoluteOutPath = resolve(process.cwd(), outPath);
  mkdirSync(dirname(absoluteOutPath), { recursive: true });
  writeFileSync(absoluteOutPath, json, 'utf8');
  console.error(`Wrote course catalog snapshot to ${absoluteOutPath}`);
}

main();
