import { BASIC_REQUIREMENT_CATALOG_RULES } from '../../features/graduation/domain/rule-catalog/basic-requirements';
import {
  CATALOG_SOURCE_LAYERS,
  createCatalogSourceLayerPublishSnapshot,
  validateCatalogSourceLayers,
  type CatalogSourceLayerValidationIssue,
} from '../../features/graduation/domain/rule-catalog/catalog-source-layers';
import { compileRuleCatalog } from '../../features/graduation/domain/rule-catalog/compiler';
import {
  COURSE_EQUIVALENCY_CATALOG,
  createCourseEquivalencyPublishSnapshot,
  validateCourseEquivalencyCatalog,
  type CourseEquivalencyValidationIssue,
} from '../../features/graduation/domain/rule-catalog/course-equivalencies';
import { MAJOR_MINOR_REQUIREMENT_CATALOG_RULES } from '../../features/graduation/domain/rule-catalog/major-minor-requirements';
import {
  createGraduationCatalogPublishBundle,
  validateGraduationCatalogPublishBundle,
  type GraduationCatalogPublishBundleValidationIssue,
} from '../../features/graduation/domain/rule-catalog/publish-bundle';
import { RULE_EVALUATOR_REGISTRY } from '../../features/graduation/domain/rule-catalog/rule-evaluator-registry';
import {
  validateRuleCatalog,
  type RuleCatalogRule,
  type RuleCatalogValidationIssue,
} from '../../features/graduation/domain/rule-catalog/schema';
import {
  createRuleCatalogPublishSnapshot,
  validateJsonSerializableRuleCatalog,
  type RuleCatalogSerializationIssue,
} from '../../features/graduation/domain/rule-catalog/serialization';

function printValidationIssues(issues: readonly RuleCatalogValidationIssue[]): void {
  issues.forEach((issue) => {
    console.error(`  - [${issue.code}] ${issue.ruleId}: ${issue.message}`);
  });
}

function printSerializationIssues(issues: readonly RuleCatalogSerializationIssue[]): void {
  issues.forEach((issue) => {
    console.error(`  - [${issue.code}] ${issue.path}: ${issue.message}`);
  });
}

function printCourseEquivalencyIssues(issues: readonly CourseEquivalencyValidationIssue[]): void {
  issues.forEach((issue) => {
    console.error(`  - [${issue.code}] ${issue.equivalencyId}: ${issue.message}`);
  });
}

function printSourceLayerIssues(issues: readonly CatalogSourceLayerValidationIssue[]): void {
  issues.forEach((issue) => {
    console.error(`  - [${issue.code}] ${issue.layerId}: ${issue.message}`);
  });
}

function printBundleIssues(issues: readonly GraduationCatalogPublishBundleValidationIssue[]): void {
  issues.forEach((issue) => {
    console.error(`  - [${issue.code}] ${issue.path}: ${issue.message}`);
  });
}

function main(): void {
  const rules: readonly RuleCatalogRule[] = [
    ...BASIC_REQUIREMENT_CATALOG_RULES,
    ...MAJOR_MINOR_REQUIREMENT_CATALOG_RULES,
  ];

  console.log('Graduation rule catalog check');
  console.log(`- rules: ${rules.length}`);
  console.log(`- evaluatorIds: ${Object.keys(RULE_EVALUATOR_REGISTRY).join(', ') || '(none)'}`);

  const validation = validateRuleCatalog(rules, { publishable: true });
  if (!validation.ok) {
    console.error('\nCatalog validation failed.');
    printValidationIssues(validation.issues);
    process.exitCode = 1;
    return;
  }
  console.log('- publishable validator: ok');

  const serialization = validateJsonSerializableRuleCatalog(rules);
  if (!serialization.ok) {
    console.error('\nJSON serialization validation failed.');
    printSerializationIssues(serialization.issues);
    process.exitCode = 1;
    return;
  }
  console.log('- JSON serialization: ok');

  const compiled = compileRuleCatalog(rules);
  console.log(`- compiler: ok (${compiled.byId.size} ids, ${compiled.byKind.size} kinds)`);

  const snapshot = createRuleCatalogPublishSnapshot(rules);
  console.log(`- publish snapshot: ok (schemaVersion ${snapshot.schemaVersion})`);

  const courseEquivalencyValidation = validateCourseEquivalencyCatalog(COURSE_EQUIVALENCY_CATALOG);
  if (!courseEquivalencyValidation.ok) {
    console.error('\nCourse equivalency catalog validation failed.');
    printCourseEquivalencyIssues(courseEquivalencyValidation.issues);
    process.exitCode = 1;
    return;
  }

  const courseEquivalencySnapshot = createCourseEquivalencyPublishSnapshot(COURSE_EQUIVALENCY_CATALOG);
  console.log(
    [
      '- course equivalencies: ok',
      `(${courseEquivalencySnapshot.equivalencies.length} entries,`,
      `schemaVersion ${courseEquivalencySnapshot.schemaVersion})`,
    ].join(' '),
  );

  const sourceLayerValidation = validateCatalogSourceLayers(
    CATALOG_SOURCE_LAYERS,
    rules,
    COURSE_EQUIVALENCY_CATALOG,
  );
  if (!sourceLayerValidation.ok) {
    console.error('\nCatalog source layer validation failed.');
    printSourceLayerIssues(sourceLayerValidation.issues);
    process.exitCode = 1;
    return;
  }

  const sourceLayerSnapshot = createCatalogSourceLayerPublishSnapshot(CATALOG_SOURCE_LAYERS);
  console.log(
    [
      '- source layers: ok',
      `(${sourceLayerSnapshot.layers.length} layers,`,
      `schemaVersion ${sourceLayerSnapshot.schemaVersion})`,
    ].join(' '),
  );

  const bundleCandidate = {
    schemaVersion: 1,
    sourceLayers: sourceLayerSnapshot,
    ruleCatalog: snapshot,
    courseEquivalencies: courseEquivalencySnapshot,
  } as const;
  const bundleValidation = validateGraduationCatalogPublishBundle(bundleCandidate);
  if (!bundleValidation.ok) {
    console.error('\nGraduation catalog publish bundle validation failed.');
    printBundleIssues(bundleValidation.issues);
    process.exitCode = 1;
    return;
  }

  const bundle = createGraduationCatalogPublishBundle(
    sourceLayerSnapshot,
    snapshot,
    courseEquivalencySnapshot,
  );
  console.log(`- publish bundle: ok (schemaVersion ${bundle.schemaVersion})`);
}

main();
