import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import type { ManualListingExtractionSnapshot } from '../../features/course-catalog/adapters/manual-listings';

interface ExtractedEntry {
  courseCode: string;
  page: number;
  credits?: number;
  lectureHours?: number;
  labHours?: number;
}

const MANUAL_SOURCES = [
  { academicYear: 2020, sourcePath: 'docs/bachelor_manual/2020_manual.pdf' },
  { academicYear: 2021, sourcePath: 'docs/bachelor_manual/2021_manual.pdf' },
  { academicYear: 2022, sourcePath: 'docs/bachelor_manual/2022_manual.pdf' },
  { academicYear: 2023, sourcePath: 'docs/bachelor_manual/2023_manual.pdf' },
  { academicYear: 2024, sourcePath: 'docs/bachelor_manual/2024_manual.pdf' },
  { academicYear: 2025, sourcePath: 'docs/bachelor_manual/2025_manual.pdf' },
  { academicYear: 2026, sourcePath: 'docs/bachelor_manual/2026_manual.pdf' },
] as const;

const CODE_PATTERN = /\b([A-Z]{2}\d{4})\b/g;
const CREDIT_PATTERN = /\[\s*(\d+(?:\.\d+)?)\s*[:-]\s*(\d+(?:\.\d+)?)\s*[:-]\s*(\d+(?:\.\d+)?)\s*\]/;
const MIN_TEXT_EXTRACTION_ENTRIES = 100;

function readPdfTextPages(sourcePath: string): string[] {
  const text = execFileSync('pdftotext', ['-layout', sourcePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return text.split('\f');
}

function renderOcrTextPages(rootDir: string, sourcePath: string, academicYear: number): string[] {
  const cacheDir = path.join(rootDir, 'tmp', 'pdfs', 'manual-listings-ocr', String(academicYear));
  mkdirSync(cacheDir, { recursive: true });

  const existingTextPages = readdirSync(cacheDir)
    .filter((filename) => filename.endsWith('.txt'))
    .sort();
  if (existingTextPages.length === 0) {
    const imagePrefix = path.join(cacheDir, 'page');
    execFileSync('pdftoppm', ['-r', '140', '-png', sourcePath, imagePrefix], { stdio: 'inherit' });
    const images = readdirSync(cacheDir)
      .filter((filename) => filename.endsWith('.png'))
      .sort();

    images.forEach((image) => {
      const imagePath = path.join(cacheDir, image);
      const text = execFileSync('tesseract', [imagePath, 'stdout', '--psm', '6', '-l', 'eng'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      writeFileSync(path.join(cacheDir, image.replace(/\.png$/, '.txt')), text);
    });
  }

  return readdirSync(cacheDir)
    .filter((filename) => filename.endsWith('.txt'))
    .sort()
    .map((filename) => readFileSync(path.join(cacheDir, filename), 'utf8'));
}

function extractEntriesFromPages(pages: readonly string[]): ExtractedEntry[] {
  const firstByCode = new Map<string, ExtractedEntry>();

  pages.forEach((page, pageIndex) => {
    const lines = page.split(/\r?\n/);

    lines.forEach((line, lineIndex) => {
      const snippet = lines.slice(lineIndex, lineIndex + 3).join(' ');
      const creditMatch = snippet.match(CREDIT_PATTERN);
      if (!creditMatch) return;

      CODE_PATTERN.lastIndex = 0;
      let codeMatch = CODE_PATTERN.exec(line);
      while (codeMatch) {
        const courseCode = codeMatch[1];
        if (firstByCode.has(courseCode)) {
          codeMatch = CODE_PATTERN.exec(line);
          continue;
        }

        firstByCode.set(courseCode, {
          courseCode,
          page: pageIndex + 1,
          lectureHours: Number(creditMatch[1]),
          labHours: Number(creditMatch[2]),
          credits: Number(creditMatch[3]),
        });
        codeMatch = CODE_PATTERN.exec(line);
      }
    });
  });

  return Array.from(firstByCode.values()).sort((a, b) => a.courseCode.localeCompare(b.courseCode));
}

function extractSource(rootDir: string, source: typeof MANUAL_SOURCES[number]) {
  const absoluteSourcePath = path.join(rootDir, source.sourcePath);
  if (!existsSync(absoluteSourcePath)) {
    throw new Error(`Missing manual PDF: ${source.sourcePath}`);
  }

  const textEntries = extractEntriesFromPages(readPdfTextPages(absoluteSourcePath));
  const useOcr = textEntries.length < MIN_TEXT_EXTRACTION_ENTRIES;
  const entries = useOcr
    ? extractEntriesFromPages(renderOcrTextPages(rootDir, absoluteSourcePath, source.academicYear))
    : textEntries;

  return {
    academicYear: source.academicYear,
    sourcePath: source.sourcePath,
    extractionMethod: useOcr ? 'ocr' as const : 'pdftotext' as const,
    entries,
  };
}

function stableJson(snapshot: ManualListingExtractionSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

function main(): void {
  const rootDir = process.cwd();
  const snapshot: ManualListingExtractionSnapshot = {
    schemaVersion: 1,
    sources: MANUAL_SOURCES.map((source) => extractSource(rootDir, source)),
  };
  const outputPath = path.join(
    rootDir,
    'features',
    'course-catalog',
    'generated',
    'manual-listings.extracted.json',
  );

  writeFileSync(outputPath, stableJson(snapshot));
  snapshot.sources.forEach((source) => {
    console.log(`${source.academicYear}: ${source.entries.length} entries via ${source.extractionMethod}`);
  });
}

main();
