const fs = require('fs');
const path = require('path');

const csvPath = path.join(process.cwd(), 'DB/course_db.csv');
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/)
  .filter((l) => l.trim().length > 0);

const metadata = [];
// Skip header
for (let i = 1; i < lines.length; i++) {
  // Simple CSV parse (handling quotes roughly as needed, but for dept checking simply splitting by clean commas might fail if quotes contain commas.
  // Let's use the regex based split or the same logic as update_presets.ts)

  const cols = parseCSVLine(lines[i]);
  if (cols.length < 6) continue;

  const code = cols[3]; // primary_course_code
  const dept = cols[5]; // participating_departments
  const title = cols[1];

  if (dept && (dept.includes('HUS') || dept.includes('PPE') || dept.includes('인문'))) {
    metadata.push({ code, dept, title });
  }
}

console.log(JSON.stringify(metadata, null, 2));

function parseCSVLine(line) {
  const result = [];
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
