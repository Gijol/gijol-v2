import { loadBundledTimetable } from './server-bundled-data';
import type { SectionOffering } from '@/lib/types/timetable';
import {
  createSectionBrowser,
  type SectionBrowser,
  type SectionBrowsingPage,
  type SectionBrowsingQuery,
} from './section-browsing';

export interface TimetableSectionSource {
  load(term: string): Promise<readonly SectionOffering[] | null>;
}

export interface TimetableSectionCatalog {
  browse(term: string, query?: SectionBrowsingQuery): Promise<SectionBrowsingPage | null>;
}

export function createTimetableSectionCatalog(source: TimetableSectionSource): TimetableSectionCatalog {
  const browsersByTerm = new Map<string, Promise<SectionBrowser | null>>();

  const loadBrowser = (term: string) => {
    let browser = browsersByTerm.get(term);
    if (!browser) {
      browser = source
        .load(term)
        .then((sections) => (sections ? createSectionBrowser(sections) : null))
        .catch((error) => {
          browsersByTerm.delete(term);
          throw error;
        });
      browsersByTerm.set(term, browser);
    }
    return browser;
  };

  return {
    async browse(term, query) {
      const browser = await loadBrowser(term);
      return browser?.browse(query) ?? null;
    },
  };
}

export const bundledTimetableSectionSource: TimetableSectionSource = { load: loadBundledTimetable };

let serverCatalog: TimetableSectionCatalog | undefined;

export function getServerTimetableSectionCatalog(): TimetableSectionCatalog {
  serverCatalog ??= createTimetableSectionCatalog(bundledTimetableSectionSource);
  return serverCatalog;
}
