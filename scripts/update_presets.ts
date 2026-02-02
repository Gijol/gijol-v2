import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const PRESETS_DIR = path.join(process.cwd(), 'DB', 'roadmap', 'presets');
const COURSE_DB_PATH = path.join(process.cwd(), 'DB', 'course_db.csv');

// Course DB Interface based on CSV columns
interface CourseDBRow {
  course_uid: string;
  display_title_ko: string;
  primary_course_code: string;
}

// Minimal Roadmap Interface
interface RoadmapNode {
  id: string;
  data: {
    label: string;
    courseCode?: string;
    description?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  [key: string]: any;
}

interface RoadmapData {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  [key: string]: any;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuote) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuote = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

function loadCourseMap(): Map<string, string> {
  if (!fs.existsSync(COURSE_DB_PATH)) {
    console.error(`Course DB not found at: ${COURSE_DB_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(COURSE_DB_PATH, 'utf-8');
  // Handle potentially different line endings and BOM
  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  const map = new Map<string, string>();

  // Headers are in lines[0] but we rely on column indices
  // course_uid(0), display_title_ko(1), display_title_en(2), primary_course_code(3)

  // Start from index 1 to skip header
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 4) continue;

    const display_title_ko = cols[1];
    const primary_course_code = cols[3];

    if (display_title_ko && primary_course_code) {
      const key = display_title_ko.replace(/\s+/g, '').toLowerCase();
      map.set(key, primary_course_code);
      map.set(display_title_ko, primary_course_code);

      // Handle "MOOC designated" prefix cases which might appear in labels
      if (display_title_ko.includes('(MOOC 지정)')) {
        map.set(display_title_ko.replace('(MOOC 지정)', '').trim(), primary_course_code);
      }
    }
  }

  console.log(`Loaded ${map.size} course mappings manually.`);
  return map;
}

// Helper to generate a new course code
function generateCourseCode(existingCodes: Set<string>, prefix: string = 'ZZ'): string {
  let counter = 1000;
  while (true) {
    const code = `${prefix}${counter}`;
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      return code;
    }
    counter++;
  }
}

function updatePresets() {
  const courseMap = loadCourseMap();
  const files = fs.readdirSync(PRESETS_DIR).filter((f) => f.endsWith('.json'));

  // Reload content to append
  const dbContent = fs.readFileSync(COURSE_DB_PATH, 'utf-8');
  let newDbLines: string[] = [];
  const existingCodes = new Set(Array.from(courseMap.values())); // Ensure existingCodes is populated from courseMap values

  files.forEach((file) => {
    const filePath = path.join(PRESETS_DIR, file);
    console.log(`Processing ${file}...`);

    // Determine prefix from filename
    let prefix = 'ZZ';
    if (file.includes('DATA_SCIENCE')) prefix = 'DS';
    else if (file.includes('HUMANITIES')) prefix = 'HU';
    else if (file.includes('CHEMISTRY')) prefix = 'CH';
    else if (file.includes('BIO')) prefix = 'BS';
    else if (file.includes('MECHANICAL')) prefix = 'MC';
    else if (file.includes('EECS')) prefix = 'EC';
    else if (file.includes('PHYSICAL')) prefix = 'PS';
    else if (file.includes('EARTH')) prefix = 'EV';
    else if (file.includes('MATERIAL')) prefix = 'MA';
    else if (file.includes('MATH')) prefix = 'MM';

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data: RoadmapData = JSON.parse(content);
      const idMap = new Map<string, string>(); // oldId -> newId

      // 1. Update Nodes
      data.nodes = data.nodes.map((node) => {
        const label = node.data.label;
        if (!label) return node;

        // Try to find course code
        const normalizedLabel = label.replace(/\s+/g, '').toLowerCase();
        const cleanLabel = normalizedLabel.replace(/\(mooc지정\)/g, '').replace(/\(mooc\)/g, '');

        let courseCode = courseMap.get(cleanLabel) || courseMap.get(normalizedLabel) || courseMap.get(label);

        // Fallback: Check if ID itself looks like a course code
        if (!courseCode && /^[A-Z]{2}[0-9]{4}$/.test(node.id)) {
          courseCode = node.id;
        }

        // If still no course code, create one!
        if (!courseCode) {
          courseCode = generateCourseCode(existingCodes, prefix);
          console.log(`  [NEW] Creating course "${label}" with code ${courseCode}`);

          // Add to map so we reuse it for same label
          courseMap.set(cleanLabel, courseCode);
          courseMap.set(label, courseCode);

          // Prepare CSV line
          // course_uid,display_title_ko,display_title_en,primary_course_code,alias,dept,tags,credits,lec,lab,dept_ctx,offered1,offered2,desc,...
          const credits = node.data.credits || 3;
          const desc = '로드맵 프리셋에서 자동 생성된 과목입니다.'; // Automatically created
          // Use simple CSV escaping
          const escape = (s: string) => `"${(s || '').replace(/"/g, '""')}"`;

          const newLine = [
            courseCode, // uid
            escape(label), // title ko
            escape(label), // title en (fallback)
            courseCode, // code
            '', // alias
            '', // dept
            '', // tags
            credits, // credits
            credits, // lec (approx)
            0, // lab
            '', // dept ctx
            'False',
            'False', // offered
            escape(desc), // desc
            '',
            '',
            '',
            '',
          ].join(',');

          newDbLines.push(newLine);
        }

        // Apply update
        if (courseCode) {
          const oldId = node.id;
          const newId = courseCode;

          if (oldId !== newId) {
            idMap.set(oldId, newId);
          }

          const { description, ...restData } = node.data;
          return {
            ...node,
            id: newId,
            data: {
              ...restData,
              courseCode: newId,
            },
          };
        }
        return node;
      });

      // 2. Update Edges
      data.edges = data.edges.map((edge) => {
        let source = edge.source;
        let target = edge.target;
        let id = edge.id;

        if (idMap.has(source)) source = idMap.get(source)!;
        if (idMap.has(target)) target = idMap.get(target)!;

        if (idMap.has(edge.source) || idMap.has(edge.target)) {
          id = `e_${source}_${target}`;
        }

        return {
          ...edge,
          id,
          source,
          target,
        };
      });

      // Write back JSON
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      // console.log(`  Updated ${file}`);
    } catch (error) {
      console.error(`  Error processing ${file}:`, error);
    }
  });

  // Save updated CSV
  if (newDbLines.length > 0) {
    const finalContent = dbContent.trim() + '\n' + newDbLines.join('\n');
    fs.writeFileSync(COURSE_DB_PATH, finalContent);
    console.log(`\nAdded ${newDbLines.length} new courses to ${COURSE_DB_PATH}`);
  } else {
    console.log('\nNo new courses added.');
  }
}

updatePresets();
