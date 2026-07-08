import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

import { buildCourseCatalogSnapshotFromWorkspace } from '../../features/course-catalog/node';
import {
  buildCourseCatalogSourceDiffReport,
  renderCourseCatalogSourceDiffReportMarkdown,
} from '../../features/course-catalog/report';

function getOutPath(argv: readonly string[]): string | undefined {
  const outIndex = argv.indexOf('--out');
  if (outIndex === -1) return undefined;
  return argv[outIndex + 1];
}

function main(): void {
  const outPath = getOutPath(process.argv.slice(2));
  const { snapshot } = buildCourseCatalogSnapshotFromWorkspace();
  const report = buildCourseCatalogSourceDiffReport(snapshot);
  const markdown = renderCourseCatalogSourceDiffReportMarkdown(report);

  if (!outPath) {
    process.stdout.write(markdown);
    return;
  }

  const absoluteOutPath = resolve(process.cwd(), outPath);
  mkdirSync(dirname(absoluteOutPath), { recursive: true });
  writeFileSync(absoluteOutPath, markdown, 'utf8');
  console.error(`Wrote course catalog source diff report to ${absoluteOutPath}`);
}

main();
