import {
  GRADUATION_CATALOG_PUBLISH_BUNDLE,
  renderGraduationCatalogReportHtml,
} from '../features/graduation/domain';

describe('graduation catalog report', () => {
  it('renders a static read-only HTML report', () => {
    const html = renderGraduationCatalogReportHtml(GRADUATION_CATALOG_PUBLISH_BUNDLE);

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<title>Graduation Catalog Report</title>');
    expect(html).toContain('Read-only visualization of the publish bundle');
    expect(html).toContain('This report does not edit, draft, or publish rules.');
    expect(html).not.toContain('<script');
  });

  it('shows source layer coverage and rule inventory columns', () => {
    const html = renderGraduationCatalogReportHtml(GRADUATION_CATALOG_PUBLISH_BUNDLE);

    expect(html).toContain('Source Layer Coverage');
    expect(html).toContain('Manual Page Audit');
    expect(html).toContain('gist-bachelor-manual-2026');
    expect(html).toContain('sourceRefs.manualYear');
    expect(html).toContain('appliesTo');
    expect(html).toContain('Rule Inventory');
  });

  it('shows why tracked 2026 manual pages are not all sourceRefs yet', () => {
    const html = renderGraduationCatalogReportHtml(GRADUATION_CATALOG_PUBLISH_BUNDLE);

    expect(html).toContain('화학, 수리과학 전공필수 및 대체/중복수강 제한');
    expect(html).toContain('partial');
    expect(html).toContain('CH/MM 전공필수와 주요 대체/동일과목은 source-backed rule/equivalency로 분리');
    expect(html).toContain('BS/EV 전공필수와 주요 대체 조건은 source-backed rule/equivalency로 분리');
    expect(html).toContain('학사논문연구 수강자격과 이수 절차');
    expect(html).toContain('deferred');
    expect(html).toContain('예체능 수업 운영과 편성 현황');
    expect(html).toContain('out-of-scope');
    expect(html).toContain('p.32를 보조 sourceRef로 추가했다');
    expect(html).toContain('복수전공/심화전공 program kind와 program-kind별 선언 학기 컨텍스트');
  });

  it('shows evaluator and context-dependent review signals', () => {
    const html = renderGraduationCatalogReportHtml(GRADUATION_CATALOG_PUBLISH_BUNDLE);

    expect(html).toContain('Review Signals');
    expect(html).toContain('Evaluator-backed rules');
    expect(html).toContain('Context-dependent rules');
    expect(html).toContain('ir-ai-code-course-limit');
    expect(html).toContain('minor-declaration-term-AI');
    expect(html).toContain('minor.ai.mandatory.a');
  });

  it('escapes rule data before inserting it into the report', () => {
    const html = renderGraduationCatalogReportHtml({
      ...GRADUATION_CATALOG_PUBLISH_BUNDLE,
      ruleCatalog: {
        ...GRADUATION_CATALOG_PUBLISH_BUNDLE.ruleCatalog,
        rules: [
          {
            id: '<unsafe-rule>',
            kind: 'credit-minimum',
            scope: { type: 'global' },
            parameters: { requiredCredits: 1, unit: 'credits' },
            sourceRefs: [
              {
                manualYear: 2026,
                page: 33,
                path: 'docs/bachelor_manual/2026_manual.pdf',
              },
            ],
            appliesTo: { allCohorts: true },
          },
        ],
      },
    });

    expect(html).toContain('&lt;unsafe-rule&gt;');
    expect(html).not.toContain('<unsafe-rule>');
  });
});
