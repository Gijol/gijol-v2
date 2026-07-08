import { createHash } from 'crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import type { Instructor, Meeting, SectionOffering } from '../../lib/types/timetable';

import * as XLSX from 'xlsx';

const RAW_SOURCE_DIR = 'llm/course_info_from_registration_system';
const OUTPUT_DIR = 'DB/timetable/registration-system';
const GENERATED_MANIFEST_PATH = 'features/course-catalog/generated/registration-timetable-sources.json';

const DAY_MAP: Record<string, Meeting['day']> = {
  월: 'MON',
  화: 'TUE',
  수: 'WED',
  목: 'THU',
  금: 'FRI',
  토: 'SAT',
  일: 'SUN',
};

type RawRegistrationRow = Record<string, unknown>;

interface TermInfo {
  year: number;
  semester: '1' | '2';
  term: string;
  label: string;
  outputFilename: string;
}

interface NormalizedRegistrationSource {
  version: '1.0';
  source: 'registration-system';
  sourceFile: string;
  sourceSha256: string;
  count: number;
  items: SectionOffering[];
}

interface TimetableSourceManifestEntry {
  term: string;
  path: string;
  label: string;
  count: number;
  defaultForTimetable?: boolean;
}

function text(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function nullableText(value: unknown): string | null {
  const valueText = text(value);
  return valueText ? valueText : null;
}

function splitLines(value: unknown): string[] {
  return text(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const normalized = text(value).replace(/,/g, '');
  if (!normalized) return fallback;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function column(row: RawRegistrationRow, key: string): unknown {
  return row[key] ?? row[key.replace(/\n/g, '')];
}

function parseTermInfo(filename: string): TermInfo | null {
  const match = filename.match(/^(\d{4})_(\d{2})_/);
  if (!match) return null;

  const year = Number(match[1]);
  const semester = String(Number(match[2]));
  if (!Number.isFinite(year) || (semester !== '1' && semester !== '2')) return null;

  return {
    year,
    semester,
    term: `${year}-${semester}`,
    label: `${year} ${semester}학기`,
    outputFilename: `${year}_${match[2]}_course_info.normalized.json`,
  };
}

function parseCourseSection(value: unknown): { courseCode: string; section: string } | null {
  const raw = text(value);
  const separatorIndex = raw.lastIndexOf('-');
  if (separatorIndex <= 0 || separatorIndex === raw.length - 1) return null;

  return {
    courseCode: raw.slice(0, separatorIndex).trim().toUpperCase(),
    section: raw.slice(separatorIndex + 1).trim(),
  };
}

function parseHours(value: unknown): SectionOffering['hours'] {
  const [lectureHours, labHours, credits] = text(value).split('/').map((part) => numberValue(part));

  return {
    lecture_hours: lectureHours ?? 0,
    lab_hours: labHours ?? 0,
    credits: credits ?? 0,
  };
}

function formatTime(value: string): string {
  const [hours, minutes] = value.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

function parseMeetings(timetableValue: unknown, roomValue: unknown): Meeting[] {
  const timetableLines = splitLines(timetableValue);
  const roomLines = splitLines(roomValue);
  const singleRoom = roomLines.length === 1 ? roomLines[0] : null;
  const allRooms = roomLines.length > 1 ? roomLines.join('\n') : null;

  return timetableLines.flatMap((line, index) => {
    const match = line.match(/^([월화수목금토일])\s*(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})$/);
    if (!match) return [];

    return [{
      day: DAY_MAP[match[1]],
      start: formatTime(match[2]),
      end: formatTime(match[3]),
      room: roomLines.length === timetableLines.length
        ? roomLines[index] ?? null
        : singleRoom ?? allRooms,
    }];
  });
}

function parseInstructors(value: unknown): Instructor[] {
  return splitLines(value).map((line) => {
    const match = line.match(/^(.*?)\s*(?:\[([^\]]+)])?$/);
    return {
      name: text(match?.[1] ?? line),
      staff_id: text(match?.[2] ?? ''),
    };
  }).filter((instructor) => instructor.name);
}

function normalizeRow(row: RawRegistrationRow, rowIndex: number): SectionOffering | null {
  const courseSection = parseCourseSection(column(row, '교과목-분반'));
  if (!courseSection) return null;

  return {
    no: numberValue(column(row, 'NO'), rowIndex + 1),
    department: text(column(row, '개설부서')),
    course_code: courseSection.courseCode,
    section: courseSection.section,
    title: text(column(row, '교과목명')),
    category: text(column(row, '이수구분')),
    subcategory: nullableText(column(row, '세부분류')),
    research_area: nullableText(column(row, '교과연구')) ?? undefined,
    program: text(column(row, '과정\n구분')),
    hours: parseHours(column(row, '강/실/학')),
    meetings: parseMeetings(column(row, '시간표'), column(row, '강의실')),
    capacity: numberValue(column(row, '수강\n정원')),
    syllabus: nullableText(column(row, '강의\n계획서')) ?? undefined,
    video: nullableText(column(row, '설명\n영상')),
    language: nullableText(column(row, '강의언어')),
    instructors: parseInstructors(column(row, '담당교수')),
  };
}

function sourceHash(absolutePath: string): string {
  return createHash('sha256').update(readFileSync(absolutePath)).digest('hex');
}

function readRegistrationRows(absolutePath: string): RawRegistrationRow[] {
  const workbook = XLSX.readFile(absolutePath, { cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  return XLSX.utils.sheet_to_json<RawRegistrationRow>(workbook.Sheets[firstSheetName], {
    defval: null,
  });
}

function compareTerms(left: string, right: string): number {
  const [leftYear, leftSemester] = left.split('-').map(Number);
  const [rightYear, rightSemester] = right.split('-').map(Number);
  return leftYear - rightYear || leftSemester - rightSemester;
}

function main(): void {
  const rootDir = process.cwd();
  const absoluteRawDir = path.join(rootDir, RAW_SOURCE_DIR);
  const absoluteOutputDir = path.join(rootDir, OUTPUT_DIR);
  const absoluteManifestPath = path.join(rootDir, GENERATED_MANIFEST_PATH);
  mkdirSync(absoluteOutputDir, { recursive: true });
  mkdirSync(path.dirname(absoluteManifestPath), { recursive: true });

  const sources = readdirSync(absoluteRawDir)
    .filter((filename) => filename.endsWith('.xls'))
    .map((filename) => ({ filename, termInfo: parseTermInfo(filename) }))
    .filter((entry): entry is { filename: string; termInfo: TermInfo } => entry.termInfo !== null)
    .sort((a, b) => compareTerms(a.termInfo.term, b.termInfo.term));

  const manifestEntries: TimetableSourceManifestEntry[] = sources.map(({ filename, termInfo }) => {
    const sourcePath = path.join(RAW_SOURCE_DIR, filename);
    const absoluteSourcePath = path.join(rootDir, sourcePath);
    const rows = readRegistrationRows(absoluteSourcePath);
    const items = rows
      .map((row, rowIndex) => normalizeRow(row, rowIndex))
      .filter((item): item is SectionOffering => item !== null);
    const outputPath = path.join(OUTPUT_DIR, termInfo.outputFilename);
    const output: NormalizedRegistrationSource = {
      version: '1.0',
      source: 'registration-system',
      sourceFile: sourcePath,
      sourceSha256: sourceHash(absoluteSourcePath),
      count: items.length,
      items,
    };

    writeFileSync(path.join(rootDir, outputPath), `${JSON.stringify(output, null, 2)}\n`, 'utf8');

    return {
      term: termInfo.term,
      path: outputPath,
      label: termInfo.label,
      count: items.length,
    };
  });

  const latestTerm = manifestEntries.reduce<string | null>((latest, entry) =>
    latest === null || compareTerms(entry.term, latest) > 0 ? entry.term : latest, null);
  const manifest = manifestEntries.map((entry) => ({
    ...entry,
    ...(entry.term === latestTerm ? { defaultForTimetable: true } : {}),
  }));

  writeFileSync(absoluteManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Imported ${manifestEntries.length} registration timetable sources.`);
}

main();
