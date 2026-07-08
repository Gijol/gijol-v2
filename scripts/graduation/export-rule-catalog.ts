import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

import {
  GRADUATION_CATALOG_PUBLISH_BUNDLE,
  stringifyGraduationCatalogPublishBundle,
} from '../../features/graduation/domain/rule-catalog/publish-bundle';

function getOutPath(argv: readonly string[]): string | undefined {
  const outIndex = argv.indexOf('--out');
  if (outIndex === -1) return undefined;
  return argv[outIndex + 1];
}

function main(): void {
  const outPath = getOutPath(process.argv.slice(2));
  const json = `${stringifyGraduationCatalogPublishBundle(GRADUATION_CATALOG_PUBLISH_BUNDLE)}\n`;

  if (!outPath) {
    process.stdout.write(json);
    return;
  }

  const absoluteOutPath = resolve(process.cwd(), outPath);
  mkdirSync(dirname(absoluteOutPath), { recursive: true });
  writeFileSync(absoluteOutPath, json, 'utf8');
  console.error(`Wrote graduation catalog publish bundle to ${absoluteOutPath}`);
}

main();
