#!/usr/bin/env python3
"""
과목명이 동일하지만 과목코드가 다른 과목들을 찾아서 alias_course_codes를 업데이트합니다.

사용법:
  python3 scripts/find_and_update_aliases.py

출력:
  1. 동일 과목명 다중 코드 목록 출력
  2. DB/course_db.csv 업데이트
"""

import csv
import re
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
COURSE_DB_PATH = PROJECT_ROOT / 'DB' / 'course_db.csv'
COURSES_MD_PATH = PROJECT_ROOT / 'features' / 'graduation' / 'docs' / '2026_01_COURSES.md'

def parse_courses_md():
    """2026_01_COURSES.md에서 과목 정보를 파싱합니다."""
    courses = []
    
    with open(COURSES_MD_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line.startswith('|'):
                continue
            
            parts = [p.strip() for p in line.split('|')]
            if len(parts) < 4:
                continue
            
            # Skip header and separator rows
            if any(x in line.lower() for x in ['---', '학수번호', '과목코드', '과목명']):
                continue
            
            # Find course code (pattern: XX####) in any column
            code = None
            name = None
            for i, part in enumerate(parts):
                if re.match(r'^[A-Z]{2}\d{4}', part):
                    code = part.split('/')[0]  # Handle "MC9102/3" format
                    # Name is usually the next column
                    if i + 1 < len(parts) and parts[i + 1] and not re.match(r'^[\d.]+$', parts[i + 1]):
                        name = parts[i + 1]
                    break
            
            if code and name:
                courses.append({'code': code, 'name': name})
    
    return courses


def find_aliases():
    """동일 과목명에 다른 코드를 가진 과목들을 찾습니다."""
    courses = parse_courses_md()
    
    # Group by name
    by_name = defaultdict(set)
    for c in courses:
        by_name[c['name']].add(c['code'])
    
    # Find names with multiple codes
    aliases = {}
    for name, codes in by_name.items():
        if len(codes) > 1:
            sorted_codes = sorted(codes)
            aliases[name] = sorted_codes
            # Create bidirectional mappings
            for code in sorted_codes:
                other_codes = [c for c in sorted_codes if c != code]
                if other_codes:
                    aliases[code] = other_codes
    
    return aliases


def update_course_db(aliases_by_name):
    """course_db.csv의 alias_course_codes를 업데이트합니다."""
    
    # Read existing CSV
    with open(COURSE_DB_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)
    
    # Create code -> aliases mapping
    code_to_aliases = {}
    for name, codes in aliases_by_name.items():
        for code in codes:
            other_codes = [c for c in codes if c != code]
            if code not in code_to_aliases:
                code_to_aliases[code] = set()
            code_to_aliases[code].update(other_codes)
    
    # Update rows
    updated_count = 0
    for row in rows:
        primary = row.get('primary_course_code', '')
        if primary in code_to_aliases:
            new_aliases = code_to_aliases[primary]
            existing = set(row.get('alias_course_codes', '').split('|')) if row.get('alias_course_codes') else set()
            existing.discard('')
            combined = existing | new_aliases
            combined.discard(primary)  # Remove self
            
            if combined != existing:
                row['alias_course_codes'] = '|'.join(sorted(combined))
                updated_count += 1
    
    # Write back
    with open(COURSE_DB_PATH, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    return updated_count


def main():
    print("=== 동일 과목명 다중 코드 과목 검색 ===\n")
    
    aliases = find_aliases()
    
    # Filter to only name-based aliases (not code keys)
    name_aliases = {k: v for k, v in aliases.items() if not re.match(r'^[A-Z]{2}\d{4}', k)}
    
    print(f"발견된 복수 코드 과목: {len(name_aliases)}개\n")
    
    for name, codes in sorted(name_aliases.items()):
        print(f"  {name}")
        print(f"    → {', '.join(codes)}")
    
    print("\n=== course_db.csv 업데이트 ===\n")
    
    updated = update_course_db(name_aliases)
    print(f"업데이트된 레코드: {updated}개")
    
    print("\n완료!")


if __name__ == '__main__':
    main()
