import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  diffGraduationCatalogPublishBundles,
  formatGraduationCatalogSnapshotDiff,
} from '../../features/graduation/domain/rule-catalog/diff';
import {
  GRADUATION_CATALOG_PUBLISH_BUNDLE,
  validateGraduationCatalogPublishBundle,
  type GraduationCatalogPublishBundle,
  type GraduationCatalogPublishBundleValidationIssue,
} from '../../features/graduation/domain/rule-catalog/publish-bundle';

const DEFAULT_FIXTURE_PATH = 'tests/fixtures/graduation-catalog-publish-bundle.snapshot.json';

function getFixturePath(argv: readonly string[]): string {
  const fixtureIndex = argv.indexOf('--fixture');
  if (fixtureIndex === -1) return DEFAULT_FIXTURE_PATH;
  return argv[fixtureIndex + 1] ?? DEFAULT_FIXTURE_PATH;
}

function printBundleIssues(issues: readonly GraduationCatalogPublishBundleValidationIssue[]): void {
  issues.forEach((issue) => {
    console.error(`  - [${issue.code}] ${issue.path}: ${issue.message}`);
  });
}

function readExpectedBundle(path: string): GraduationCatalogPublishBundle {
  const json = readFileSync(path, 'utf8');
  return JSON.parse(json) as GraduationCatalogPublishBundle;
}

function main(): void {
  const fixturePath = resolve(process.cwd(), getFixturePath(process.argv.slice(2)));
  const expected = readExpectedBundle(fixturePath);
  const expectedValidation = validateGraduationCatalogPublishBundle(expected);
  if (!expectedValidation.ok) {
    console.error(`Graduation catalog snapshot fixture is invalid: ${fixturePath}`);
    printBundleIssues(expectedValidation.issues);
    process.exitCode = 1;
    return;
  }

  const diff = diffGraduationCatalogPublishBundles(expected, GRADUATION_CATALOG_PUBLISH_BUNDLE);
  process.stdout.write(formatGraduationCatalogSnapshotDiff(diff));

  if (!diff.ok) {
    console.error(
      [
        'Review the catalog changes before updating the golden snapshot.',
        `To accept the new publish bundle, run: yarn graduation:catalog:export --out ${fixturePath}`,
      ].join('\n'),
    );
    process.exitCode = 1;
  }
}

main();
