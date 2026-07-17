import { BASIC_REQUIREMENT_CATALOG_RULES } from './basic-requirements';
import { compileRuleCatalog } from './compiler';
import { MAJOR_MINOR_REQUIREMENT_CATALOG_RULES } from './major-minor-requirements';
import { defineRuleCatalog } from './schema';
import { createRuleCatalogPublishSnapshot } from './serialization';

export const GRADUATION_RULE_CATALOG = defineRuleCatalog(
  [...BASIC_REQUIREMENT_CATALOG_RULES, ...MAJOR_MINOR_REQUIREMENT_CATALOG_RULES] as const,
  { publishable: true },
);

export const COMPILED_GRADUATION_RULE_CATALOG = compileRuleCatalog(GRADUATION_RULE_CATALOG);

export const GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT =
  createRuleCatalogPublishSnapshot(GRADUATION_RULE_CATALOG);
