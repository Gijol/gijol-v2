"""Rebuild course titles/credits/provenance from local handbook extracts. Requires pdftotext."""
import json,re,subprocess
from pathlib import Path
sources=json.loads(Path('features/course-catalog/generated/manual-listings.extracted.json').read_text())['sources']
meta={}
for source in sources:
 for entry in source['entries']:
  if entry.get('credits') is None: continue
  code=entry['courseCode']
  meta[code]={'credits':entry['credits'],'year':source['academicYear'],'page':entry['page'], **{k:entry[k] for k in ('lectureHours','labHours') if k in entry}}
pages=subprocess.check_output(['pdftotext','-layout','docs/bachelor_manual/2026_manual.pdf','-'],text=True).split('\f')
for page in range(36,72):
 for line in pages[page-1].splitlines():
  m=re.search(r'\b([A-Z]{2}\d{4})\s+(.+?)\s+(\d+):(\d+):(\d+)',line)
  if m: meta[m[1]]={'credits':int(m[5]),'lectureHours':int(m[3]),'labHours':int(m[4]),'year':2026,'page':page,'title':m[2].strip()}
Path('features/graduation/domain/rule-catalog/manual-course-metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
