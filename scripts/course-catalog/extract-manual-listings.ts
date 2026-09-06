import reviewedCorrections from './reviewed-manual-corrections.json';
import { createHash } from 'crypto';
import { extractManualCourseHeadings } from '../../features/course-catalog/manual-extraction';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import type { ManualListingExtractionSnapshot } from '../../features/course-catalog/adapters/manual-listings';

const MANUAL_SOURCES = [
  { academicYear: 2020, sourcePath: 'docs/bachelor_manual/2020_manual.pdf' },
  { academicYear: 2021, sourcePath: 'docs/bachelor_manual/2021_manual.pdf' },
  { academicYear: 2022, sourcePath: 'docs/bachelor_manual/2022_manual.pdf' },
  { academicYear: 2023, sourcePath: 'docs/bachelor_manual/2023_manual.pdf' },
  { academicYear: 2024, sourcePath: 'docs/bachelor_manual/2024_manual.pdf' },
  { academicYear: 2025, sourcePath: 'docs/bachelor_manual/2025_manual.pdf' },
  { academicYear: 2026, sourcePath: 'docs/bachelor_manual/2026_manual.pdf' },
] as const;

const MIN_TEXT_EXTRACTION_ENTRIES = 100;

function readPdfTextPages(sourcePath: string): string[] {
  const text = execFileSync('pdftotext', ['-layout', sourcePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return text.split('\f');
}

function renderOcrTextPages(rootDir: string, sourcePath: string, academicYear: number): string[] {
  const cacheFlag = process.argv.indexOf('--ocr-cache-root');
  const cacheDir =
    cacheFlag >= 0
      ? path.join(process.argv[cacheFlag + 1], String(academicYear))
      : path.join(rootDir, 'tmp', 'pdfs', 'manual-listings-ocr', String(academicYear));
  mkdirSync(cacheDir, { recursive: true });

  const pdfHash = createHash('sha256').update(readFileSync(sourcePath)).digest('hex');
  const pageCount = Number(execFileSync('pdfinfo', [sourcePath], { encoding: 'utf8' }).match(/^Pages:\s+(\d+)/m)?.[1]);
  if (!pageCount) throw new Error(`Cannot read page count: ${sourcePath}`);
  const manifestPath = path.join(cacheDir, 'manifest.json');
  const existingTextPages = readdirSync(cacheDir)
    .filter((filename) => filename.endsWith('.txt'))
    .sort();
  if (existingTextPages.length > 0) {
    if (!existsSync(manifestPath))
      throw new Error(`OCR cache requires manifest.json with sourceSha256 and pageCount: ${cacheDir}`);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (manifest.sourceSha256 !== pdfHash || manifest.pageCount !== pageCount)
      throw new Error(`Stale OCR cache: ${cacheDir}`);
  }
  if (existingTextPages.length === 0) {
    const imagePrefix = path.join(cacheDir, 'page');
    execFileSync('pdftoppm', ['-r', '140', '-png', sourcePath, imagePrefix], { stdio: 'inherit' });
    const images = readdirSync(cacheDir)
      .filter((filename) => filename.endsWith('.png'))
      .sort();

    images.forEach((image) => {
      const imagePath = path.join(cacheDir, image);
      const text = execFileSync('tesseract', [imagePath, 'stdout', '--psm', '6', '-l', 'kor+eng'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      writeFileSync(path.join(cacheDir, image.replace(/\.png$/, '.txt')), text);
    });
    writeFileSync(
      manifestPath,
      JSON.stringify({ sourceSha256: pdfHash, pageCount, engine: 'tesseract-kor+eng' }, null, 2),
    );
  }
  const textFiles = readdirSync(cacheDir)
    .filter((name) => /^page-\d+\.txt$/.test(name))
    .sort();
  if (textFiles.length !== pageCount || textFiles.some((name, index) => Number(name.match(/\d+/)?.[0]) !== index + 1)) {
    throw new Error(`Incomplete OCR cache: ${cacheDir} (expected ${pageCount} consecutive pages)`);
  }

  return textFiles.map((filename) => readFileSync(path.join(cacheDir, filename), 'utf8'));
}

function extractSource(rootDir: string, source: (typeof MANUAL_SOURCES)[number]) {
  const absoluteSourcePath = path.join(rootDir, source.sourcePath);
  if (!existsSync(absoluteSourcePath)) {
    throw new Error(`Missing manual PDF: ${source.sourcePath}`);
  }

  const textEntries = extractManualCourseHeadings(readPdfTextPages(absoluteSourcePath), { includeTitles: true });
  const useOcr = textEntries.length < MIN_TEXT_EXTRACTION_ENTRIES;
  let entries = useOcr
    ? extractManualCourseHeadings(renderOcrTextPages(rootDir, absoluteSourcePath, source.academicYear), {
        includeTitles: true,
      })
    : textEntries;

  const sourceSha256 = createHash('sha256').update(readFileSync(absoluteSourcePath)).digest('hex');
  for (const correction of reviewedCorrections.filter((item) => item.academicYear === source.academicYear)) {
    if (correction.sourceSha256 !== sourceSha256)
      throw new Error(`Reviewed corrections require revalidation: ${source.academicYear}`);
    const byCode = new Map(
      entries
        .filter((entry) => !correction.removeCodes.includes(entry.courseCode))
        .map((entry) => [entry.courseCode, entry]),
    );
    correction.entries.forEach((entry) => byCode.set(entry.courseCode, entry));
    entries = Array.from(byCode.values()).sort((a, b) => a.courseCode.localeCompare(b.courseCode));
  }
  return {
    academicYear: source.academicYear,
    sourcePath: source.sourcePath,
    sourceSha256,
    extractionMethod: useOcr ? ('ocr' as const) : ('pdftotext' as const),
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
  const outputPath = path.join(rootDir, 'features', 'course-catalog', 'generated', 'manual-listings.extracted.json');

  writeFileSync(outputPath, stableJson(snapshot));
  snapshot.sources.forEach((source) => {
    console.log(`${source.academicYear}: ${source.entries.length} entries via ${source.extractionMethod}`);
  });
}

main();
