import registrationTimetableSources from './generated/registration-timetable-sources.json';

export interface TimetableSourceManifestEntry {
  term: string;
  path: string;
  label: string;
  count: number;
  defaultForTimetable?: boolean;
}

export const TIMETABLE_SOURCES = registrationTimetableSources as readonly TimetableSourceManifestEntry[];

export function getDefaultTimetableSource(): TimetableSourceManifestEntry {
  return TIMETABLE_SOURCES.find((source) => source.defaultForTimetable) ?? TIMETABLE_SOURCES[0];
}

export function getTimetableSourceByTerm(term: string): TimetableSourceManifestEntry | undefined {
  return TIMETABLE_SOURCES.find((source) => source.term === term);
}
