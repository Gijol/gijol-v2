import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

import { GRADUATION_CATALOG_PUBLISH_BUNDLE } from '../../features/graduation/domain/rule-catalog/publish-bundle';
import { renderGraduationCatalogReportHtml } from '../../features/graduation/domain/rule-catalog/report';

function getOutPath(argv: readonly string[]): string | undefined {
  const outIndex = argv.indexOf('--out');
  if (outIndex === -1) return undefined;
  return argv[outIndex + 1];
}

function main(): void {
  const outPath = getOutPath(process.argv.slice(2));
  const html = renderGraduationCatalogReportHtml(GRADUATION_CATALOG_PUBLISH_BUNDLE);

  if (!outPath) {
    process.stdout.write(html);
    return;
  }

  const absoluteOutPath = resolve(process.cwd(), outPath);
  mkdirSync(dirname(absoluteOutPath), { recursive: true });
  writeFileSync(absoluteOutPath, html, 'utf8');
  console.error(`Wrote graduation catalog report to ${absoluteOutPath}`);
}

main();
