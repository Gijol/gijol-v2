import fs from 'fs/promises';
import path from 'path';
import { getTimetableSourceByTerm } from '@/features/course-catalog/timetable-sources';
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
      browser = source.load(term).then((sections) => (sections ? createSectionBrowser(sections) : null));
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

export const fileTimetableSectionSource: TimetableSectionSource = {
  async load(term) {
    const manifest = getTimetableSourceByTerm(term);
    if (!manifest) return null;
    const fileContent = await fs.readFile(path.join(process.cwd(), manifest.path), 'utf8');
    const data = JSON.parse(fileContent) as { items?: SectionOffering[] };
    return Array.isArray(data.items) ? data.items : [];
  },
};

let serverCatalog: TimetableSectionCatalog | undefined;

export function getServerTimetableSectionCatalog(): TimetableSectionCatalog {
  serverCatalog ??= createTimetableSectionCatalog(fileTimetableSectionSource);
  return serverCatalog;
}
