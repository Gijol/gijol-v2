import {
  formatGraduationCatalogInspection,
  inspectGraduationCatalogPublishBundle,
} from '../../features/graduation/domain/rule-catalog/inspect';
import { GRADUATION_CATALOG_PUBLISH_BUNDLE } from '../../features/graduation/domain/rule-catalog/publish-bundle';

function main(): void {
  const inspection = inspectGraduationCatalogPublishBundle(GRADUATION_CATALOG_PUBLISH_BUNDLE);
  process.stdout.write(formatGraduationCatalogInspection(inspection));
}

main();
