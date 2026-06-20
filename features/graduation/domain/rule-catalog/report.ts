import type { RequirementSource } from '../types';
import {
  inspectGraduationCatalogPublishBundle,
  type GraduationCatalogInspection,
} from './inspect';
import type { GraduationCatalogPublishBundle } from './publish-bundle';
import type { AcademicTermRange, RuleCatalogRule } from './schema';

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTerm(term: { year: number; semester: string } | undefined): string {
  if (!term) return '';
  return `${term.year}-${term.semester}`;
}

function formatTermRange(range: AcademicTermRange | undefined): string {
  if (!range) return '';
  if (range.from && range.to) return `${formatTerm(range.from)} to ${formatTerm(range.to)}`;
  if (range.from) return `from ${formatTerm(range.from)}`;
  if (range.to) return `until ${formatTerm(range.to)}`;
  return '';
}

function formatApplicability(rule: RuleCatalogRule): string {
  const appliesTo = rule.appliesTo;
  if (!appliesTo) return 'missing';

  const parts: string[] = [];
  if (appliesTo.allCohorts === true) parts.push('all cohorts');
  if (appliesTo.entryYear?.from !== undefined && appliesTo.entryYear?.to !== undefined) {
    parts.push(`entry ${appliesTo.entryYear.from}-${appliesTo.entryYear.to}`);
  } else if (appliesTo.entryYear?.from !== undefined) {
    parts.push(`entry ${appliesTo.entryYear.from}+`);
  } else if (appliesTo.entryYear?.to !== undefined) {
    parts.push(`entry <=${appliesTo.entryYear.to}`);
  }

  const declarationTerm = formatTermRange(appliesTo.declarationTerm);
  if (declarationTerm) parts.push(`declaration ${declarationTerm}`);
  if (appliesTo.effectiveFrom) parts.push(`effective from ${formatTerm(appliesTo.effectiveFrom)}`);

  return parts.length > 0 ? parts.join('; ') : 'missing';
}

function formatSourceRefs(sourceRefs: readonly RequirementSource[] | undefined): string {
  if (!sourceRefs || sourceRefs.length === 0) return 'missing';

  return sourceRefs
    .map((sourceRef) => `${sourceRef.manualYear} p.${sourceRef.page}`)
    .join(', ');
}

function formatScope(rule: RuleCatalogRule): string {
  if (!rule.scope) return 'missing';
  if (rule.scope.type === 'global') return 'global';
  if (rule.scope.type === 'program-kind') return `${rule.scope.programKind}: all`;
  return `${rule.scope.programKind}: ${rule.scope.programCodes.join(', ')}`;
}

function recordEntries(record: Readonly<Record<string, number>>): readonly [string, number][] {
  return Object.entries(record).sort(([a], [b]) => a.localeCompare(b));
}

function renderCountBars(title: string, record: Readonly<Record<string, number>>): string {
  const entries = recordEntries(record);
  const max = Math.max(...entries.map(([, count]) => count), 1);

  const rows = entries.length > 0
    ? entries.map(([label, count]) => {
        const width = Math.max(4, Math.round((count / max) * 100));
        return `
          <div class="bar-row">
            <span class="bar-label">${escapeHtml(label)}</span>
            <span class="bar-track" aria-hidden="true"><span class="bar-fill" style="width: ${width}%"></span></span>
            <span class="bar-value">${count}</span>
          </div>`;
      }).join('')
    : '<p class="empty">No data</p>';

  return `
    <section class="panel">
      <h2>${escapeHtml(title)}</h2>
      <div class="bar-list">${rows}</div>
    </section>`;
}

function renderSourceLayers(inspection: GraduationCatalogInspection): string {
  const rows = inspection.sourceLayers.map((layer) => `
    <tr>
      <td><code>${escapeHtml(layer.id)}</code></td>
      <td>${layer.manualYear}</td>
      <td>${escapeHtml(layer.sourcePath)}</td>
      <td class="number">${layer.ruleCount}</td>
      <td class="number">${layer.courseEquivalencyCount}</td>
      <td>${layer.pages.length > 0 ? layer.pages.join(', ') : 'none'}</td>
    </tr>`).join('');

  return `
    <section class="panel wide">
      <div class="section-title">
        <h2>Source Layer Coverage</h2>
        <p>Source layers are evidence provenance. Applicability still comes from each rule's appliesTo condition.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Layer</th>
              <th>manualYear</th>
              <th>Source path</th>
              <th>Rules</th>
              <th>Equivalencies</th>
              <th>Referenced pages</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

function renderSourcePageAudit(inspection: GraduationCatalogInspection): string {
  const rows = inspection.sourcePageAudits.map((audit) => `
    <tr>
      <td><code>${escapeHtml(audit.layerId)}</code></td>
      <td class="number">${audit.page}</td>
      <td><span class="status status-${escapeHtml(audit.status)}">${escapeHtml(audit.status)}</span></td>
      <td>${audit.referenced ? 'yes' : 'no'}</td>
      <td class="number">${audit.ruleCount}</td>
      <td class="number">${audit.courseEquivalencyCount}</td>
      <td>${escapeHtml(audit.title)}</td>
      <td>${escapeHtml(audit.reason)}</td>
      <td>${audit.nextAction ? escapeHtml(audit.nextAction) : ''}</td>
    </tr>`).join('');

  return `
    <section class="panel wide">
      <div class="section-title">
        <h2>Manual Page Audit</h2>
        <p>Tracked 2026 manual pages include cited pages and known gaps. The status explains why a page is or is not represented by sourceRefs today.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Layer</th>
              <th>Page</th>
              <th>Status</th>
              <th>Referenced</th>
              <th>Rules</th>
              <th>Equivalencies</th>
              <th>Manual content</th>
              <th>Reason</th>
              <th>Next action</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

function renderRiskSignals(bundle: GraduationCatalogPublishBundle, inspection: GraduationCatalogInspection): string {
  const evaluatorRules = bundle.ruleCatalog.rules.filter((rule) => rule.evaluatorId);
  const contextRules = bundle.ruleCatalog.rules.filter(
    (rule) => rule.appliesTo?.declarationTerm || rule.appliesTo?.effectiveFrom,
  );

  const evaluatorRows = evaluatorRules.map((rule) => `
    <tr>
      <td><code>${escapeHtml(rule.id)}</code></td>
      <td>${escapeHtml(rule.kind)}</td>
      <td><code>${escapeHtml(rule.evaluatorId)}</code></td>
      <td>${escapeHtml(formatScope(rule))}</td>
      <td>${escapeHtml(formatApplicability(rule))}</td>
      <td>${escapeHtml(formatSourceRefs(rule.sourceRefs))}</td>
    </tr>`).join('');

  const contextRows = contextRules.map((rule) => `
    <tr>
      <td><code>${escapeHtml(rule.id)}</code></td>
      <td>${escapeHtml(rule.kind)}</td>
      <td>${escapeHtml(formatScope(rule))}</td>
      <td>${escapeHtml(formatApplicability(rule))}</td>
      <td>${escapeHtml(formatSourceRefs(rule.sourceRefs))}</td>
    </tr>`).join('');

  return `
    <section class="panel wide">
      <div class="section-title">
        <h2>Review Signals</h2>
        <p>These are read-only inspection signals, not editable Admin drafts.</p>
      </div>
      <div class="signal-grid">
        <div class="signal">
          <strong>${inspection.unreferencedSourceLayerIds.length}</strong>
          <span>unreferenced source layers</span>
        </div>
        <div class="signal">
          <strong>${contextRules.length}</strong>
          <span>context-dependent rules</span>
        </div>
        <div class="signal">
          <strong>${evaluatorRules.length}</strong>
          <span>evaluator-backed rules</span>
        </div>
        <div class="signal">
          <strong>${bundle.courseEquivalencies.equivalencies.length}</strong>
          <span>course equivalencies</span>
        </div>
      </div>

      <h3>Evaluator-backed rules</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rule</th>
              <th>Kind</th>
              <th>evaluatorId</th>
              <th>Scope</th>
              <th>appliesTo</th>
              <th>sourceRefs.manualYear</th>
            </tr>
          </thead>
          <tbody>${evaluatorRows || '<tr><td colspan="6">No evaluator-backed rules</td></tr>'}</tbody>
        </table>
      </div>

      <h3>Context-dependent rules</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rule</th>
              <th>Kind</th>
              <th>Scope</th>
              <th>appliesTo</th>
              <th>sourceRefs.manualYear</th>
            </tr>
          </thead>
          <tbody>${contextRows || '<tr><td colspan="5">No context-dependent rules</td></tr>'}</tbody>
        </table>
      </div>
    </section>`;
}

function renderRuleInventory(bundle: GraduationCatalogPublishBundle): string {
  const rows = bundle.ruleCatalog.rules.map((rule) => `
    <tr>
      <td><code>${escapeHtml(rule.id)}</code></td>
      <td>${escapeHtml(rule.kind)}</td>
      <td>${escapeHtml(formatScope(rule))}</td>
      <td>${escapeHtml(formatApplicability(rule))}</td>
      <td>${escapeHtml(formatSourceRefs(rule.sourceRefs))}</td>
      <td>${rule.evaluatorId ? `<code>${escapeHtml(rule.evaluatorId)}</code>` : ''}</td>
    </tr>`).join('');

  return `
    <section class="panel wide">
      <details open>
        <summary>
          <span>Rule Inventory</span>
          <small>${bundle.ruleCatalog.rules.length} rules</small>
        </summary>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rule</th>
                <th>Kind</th>
                <th>Scope</th>
                <th>appliesTo</th>
                <th>sourceRefs.manualYear</th>
                <th>evaluatorId</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </details>
    </section>`;
}

function renderStyles(): string {
  return `
    :root {
      color-scheme: light;
      --bg: #f7f8fa;
      --panel: #ffffff;
      --text: #17202a;
      --muted: #687385;
      --line: #d9dee7;
      --primary: #2364aa;
      --accent: #228b72;
      --warn: #b46a1f;
      --soft-primary: #dbeafe;
      --soft-accent: #dff3ed;
      --soft-warn: #f7ead8;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }

    main {
      width: min(1180px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 28px 0 48px;
    }

    header {
      display: grid;
      gap: 12px;
      margin-bottom: 20px;
    }

    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 28px; line-height: 1.2; }
    h2 { font-size: 18px; }
    h3 { margin-top: 22px; font-size: 15px; }
    p { color: var(--muted); }

    code {
      font-family: "SFMono-Regular", Consolas, monospace;
      font-size: 12px;
      color: #0f3b63;
    }

    .kpis {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin: 18px 0;
    }

    .kpi, .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .kpi {
      padding: 14px 16px;
    }

    .kpi strong {
      display: block;
      font-size: 26px;
      line-height: 1.1;
    }

    .kpi span {
      color: var(--muted);
      font-size: 13px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .panel {
      padding: 18px;
      overflow: hidden;
    }

    .wide {
      grid-column: 1 / -1;
    }

    .section-title {
      display: grid;
      gap: 4px;
      margin-bottom: 14px;
    }

    .bar-list {
      display: grid;
      gap: 10px;
      margin-top: 14px;
    }

    .bar-row {
      display: grid;
      grid-template-columns: minmax(150px, 1fr) minmax(120px, 2fr) 44px;
      gap: 10px;
      align-items: center;
      min-height: 26px;
    }

    .bar-label {
      overflow-wrap: anywhere;
      font-size: 13px;
    }

    .bar-track {
      height: 10px;
      background: #edf1f7;
      border-radius: 999px;
      overflow: hidden;
    }

    .bar-fill {
      display: block;
      height: 100%;
      background: var(--primary);
      border-radius: inherit;
    }

    .bar-row:nth-child(3n + 2) .bar-fill { background: var(--accent); }
    .bar-row:nth-child(3n) .bar-fill { background: var(--warn); }

    .bar-value {
      color: var(--muted);
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    .signal-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    .signal {
      display: grid;
      gap: 2px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfe;
    }

    .signal strong {
      font-size: 22px;
    }

    .signal span {
      color: var(--muted);
      font-size: 12px;
    }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--line);
      border-radius: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
      background: #fff;
    }

    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
      font-size: 13px;
    }

    th {
      position: sticky;
      top: 0;
      background: #f1f4f8;
      color: #2f3b4a;
      font-size: 12px;
      letter-spacing: 0;
    }

    tr:last-child td {
      border-bottom: 0;
    }

    .number {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .status {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: #eef2f7;
      color: #334155;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-covered {
      background: var(--soft-accent);
      border-color: #b7ded3;
      color: #165f4e;
    }

    .status-partial {
      background: var(--soft-primary);
      border-color: #bfd5f7;
      color: #174f89;
    }

    .status-catalog-gap,
    .status-deferred {
      background: var(--soft-warn);
      border-color: #e5c99f;
      color: #7c4816;
    }

    .status-out-of-scope {
      background: #f0f2f5;
      color: #566174;
    }

    details summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-weight: 700;
      margin-bottom: 14px;
    }

    details summary small {
      color: var(--muted);
      font-weight: 500;
    }

    .empty {
      padding: 10px 0;
    }

    @media (max-width: 760px) {
      main {
        width: min(100vw - 20px, 1180px);
        padding-top: 18px;
      }

      h1 {
        font-size: 23px;
      }

      .kpis,
      .grid,
      .signal-grid {
        grid-template-columns: 1fr;
      }

      .bar-row {
        grid-template-columns: 1fr 44px;
      }

      .bar-track {
        grid-column: 1 / -1;
        grid-row: 2;
      }
    }
  `;
}

export function renderGraduationCatalogReportHtml(
  bundle: GraduationCatalogPublishBundle,
): string {
  const inspection = inspectGraduationCatalogPublishBundle(bundle);

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Graduation Catalog Report</title>
  <style>${renderStyles()}</style>
</head>
<body>
  <main>
    <header>
      <h1>Graduation Catalog Report</h1>
      <p>Read-only visualization of the publish bundle. This report does not edit, draft, or publish rules.</p>
    </header>

    <section class="kpis" aria-label="Catalog totals">
      <div class="kpi"><strong>${inspection.totals.sourceLayers}</strong><span>source layers</span></div>
      <div class="kpi"><strong>${inspection.totals.rules}</strong><span>rules</span></div>
      <div class="kpi"><strong>${inspection.totals.evaluatorBackedRules}</strong><span>evaluator-backed rules</span></div>
      <div class="kpi"><strong>${inspection.totals.courseEquivalencies}</strong><span>course equivalencies</span></div>
    </section>

    <section class="grid">
      ${renderSourceLayers(inspection)}
      ${renderSourcePageAudit(inspection)}
      ${renderCountBars('Rules by Kind', inspection.rulesByKind)}
      ${renderCountBars('Rules by Scope', inspection.rulesByScope)}
      ${renderCountBars('Applicability Signals', inspection.rulesByApplicabilitySignal)}
      ${renderCountBars('Rules by evaluatorId', inspection.rulesByEvaluatorId)}
      ${renderRiskSignals(bundle, inspection)}
      ${renderRuleInventory(bundle)}
    </section>
  </main>
</body>
</html>
`;
}
