const fs = require('fs');
const path = require('path');

// Mock content of existing sets (I will copy-paste them from the file view if needed, but for now I'll just check if dept implies it)
// Actually better to just output ALL valid humanities codes from CSV.
// And I will verify in the implementation step.

const csvPath = path.join(process.cwd(), 'DB/course_db.csv');
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/)
  .filter((l) => l.trim().length > 0);

const codes = new Set();

for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  if (cols.length < 6) continue;

  const code = cols[3]; // primary_course_code
  const dept = cols[5]; // participating_departments

  if (dept && (dept.includes('HUS') || dept.includes('PPE') || dept.includes('인문'))) {
    codes.add(code);
  }
}

console.log(JSON.stringify(Array.from(codes).sort(), null, 2));

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
