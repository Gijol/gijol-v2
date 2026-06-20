import { readFileSync } from 'fs';
import { join } from 'path';

import {
  GRADUATION_CATALOG_PUBLISH_BUNDLE,
  diffGraduationCatalogPublishBundles,
  formatGraduationCatalogSnapshotDiff,
  type GraduationCatalogPublishBundle,
} from '../features/graduation/domain';

const SNAPSHOT_PATH = join(
  process.cwd(),
  'tests/fixtures/graduation-catalog-publish-bundle.snapshot.json',
);

describe('graduation catalog golden snapshot', () => {
  it('matches the checked-in publish bundle fixture', () => {
    const expected = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as GraduationCatalogPublishBundle;
    const diff = diffGraduationCatalogPublishBundles(expected, GRADUATION_CATALOG_PUBLISH_BUNDLE);

    expect(formatGraduationCatalogSnapshotDiff(diff)).toBe('Graduation catalog snapshot matches.\n');
    expect(diff.ok).toBe(true);
  });
});
