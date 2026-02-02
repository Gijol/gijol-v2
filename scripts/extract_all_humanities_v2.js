const fs = require('fs');
const path = require('path');

const csvPath = path.join(process.cwd(), 'DB/course_db.csv');
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/)
  .filter((l) => l.trim().length > 0);

const codes = new Set();
// Existing HUS/PPE from constants might be useful to compare, but I'll trust the CSV for now.

for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  if (cols.length < 11) continue; // Need at least up to department_context

  const code = cols[3]; // primary_course_code
  const participating_departments = cols[5];
  const department_context = cols[10];

  const isHumanities =
    (participating_departments &&
      (participating_departments.includes('HUS') ||
        participating_departments.includes('PPE') ||
        participating_departments.includes('인문'))) ||
    (department_context &&
      (department_context.includes('HUS') ||
        department_context.includes('PPE') ||
        department_context.includes('인문')));

  if (isHumanities) {
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
