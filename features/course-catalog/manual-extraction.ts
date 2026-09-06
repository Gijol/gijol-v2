import type { ExtractedManualListingEntry } from './adapters/manual-listings';

/** Only attach hours to their own course heading, never to a nearby code mention. */
export function extractManualCourseHeadings(
  pages: readonly string[],
  options: { includeTitles?: boolean } = {},
): ExtractedManualListingEntry[] {
  const entries = new Map<string, ExtractedManualListingEntry>();
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const lines = pages[pageIndex].split(/\r?\n/);
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      // Some PDFs contain two facing pages. A row can contain two different courses.
      for (const segment of line.trim().split(/\s+(?=[A-Z]{2}\d{4})/)) {
        const heading = segment.match(
          /^([A-Z]{2}\d{4}(?:\s*[/,]\s*[A-Z]{2}\d{4})*(?:\s*\([A-Z]{2}\d{4}(?:\s*[,/]\s*[A-Z]{2}\d{4})*\))?)\s+([^\n]+)$/,
        );
        if (!heading || !/[가-힣A-Za-z]{2}/.test(heading[2])) continue;
        // Prose and prerequisite references are not course headings.
        if (/^[()]/.test(heading[2]) && !/^\((?:MOOC|신설|폐지)/.test(heading[2])) continue;
        let headingText = heading[2];
        if (!headingText.includes('[') && line.trim().startsWith(heading[1]) && line.length < 180) {
          for (const next of lines.slice(lineIndex + 1, lineIndex + 3)) {
            if (/\b[A-Z]{2}\d{4}\b/.test(next) || !next.trim()) break;
            headingText += ` ${next.trim()}`;
            if (headingText.includes(']')) break;
          }
        }
        const hours = headingText.match(
          /\[\s*(\d+(?:\.\d+)?)\s*[:-]\s*(\d+(?:\.\d+)?)\s*[:-]\s*(\d+(?:\.\d+)?)\s*[\])]/,
        );
        const creditsOnly = headingText.match(/\[\s*(\d+(?:\.\d+)?)\s*\]/);
        const tuple = hours ?? creditsOnly;
        const otherCode = headingText.search(/\b[A-Z]{2}\d{4}\b/);
        if (otherCode >= 0 && (!tuple || otherCode < tuple.index!)) continue;
        // Without the hours tuple, accept only explicit MOOC headings as code-only evidence.
        if (!tuple && !/^\(MOOC/.test(heading[2])) continue;
        for (const courseCode of heading[1].match(/[A-Z]{2}\d{4}/g) ?? []) {
          const entry: ExtractedManualListingEntry = {
            courseCode,
            ...(options.includeTitles
              ? { titleKo: (tuple ? headingText.slice(0, tuple.index) : heading[2]).trim() }
              : {}),
            page: pageIndex + 1,
            ...(hours
              ? { lectureHours: Number(hours[1]), labHours: Number(hours[2]), credits: Number(hours[3]) }
              : creditsOnly
                ? { credits: Number(creditsOnly[1]) }
                : {}),
          };
          const existing = entries.get(entry.courseCode);
          if (!existing || (existing.credits === undefined && entry.credits !== undefined))
            entries.set(entry.courseCode, entry);
        }
      }
    }
  }
  return Array.from(entries.values()).sort((a, b) => a.courseCode.localeCompare(b.courseCode));
}
