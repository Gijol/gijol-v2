#!/usr/bin/env python3
"""
2026년 1학기 강의 데이터 업데이트 스크립트

마크다운 파일(2026_01_COURSES.md)의 강의 정보를 파싱하여
JSON 파일(2026_spring_course_info.normalized.json)을 업데이트합니다.

업데이트 내용:
1. 교수 정보 (instructors)
2. 누락된 강의 추가
3. 시간 정보 보충 (시작 시간만 있을 경우 1.5시간 duration 적용)
"""

import json
import re
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

# 경로 설정
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
MD_FILE = PROJECT_ROOT / "features/graduation/docs/2026_01_COURSES.md"
JSON_FILE = PROJECT_ROOT / "DB/timetable/2026_spring_course_info.normalized.json"
OUTPUT_FILE = JSON_FILE  # 동일 파일에 덮어쓰기

# 요일 매핑
DAY_MAP = {
    "월": "MON", "화": "TUE", "수": "WED", "목": "THU", "금": "FRI", "토": "SAT", "일": "SUN"
}

# 학과 매핑
DEPT_MAP = {
    "공통": "GIST대학",
    "도전": "기초교육학부",
    "인문": "인문사회과학부",
    "반도체": "반도체공학과",
    "AI": "AI융합학과",
    "의생명": "의생명공학과",
    "지능로봇": "지능로봇학과",
    "문화기술": "문화기술학과",
}


def parse_time(time_str: str) -> tuple[str, str]:
    """
    시간 문자열을 파싱하여 시작/종료 시간 반환
    예: "09:00" -> ("09:00", "10:30")
    """
    # 시간 포맷 정규화
    time_str = time_str.strip()
    
    # HH:MM 형식 찾기
    match = re.search(r"(\d{1,2}):(\d{2})", time_str)
    if not match:
        return None, None
    
    hour, minute = int(match.group(1)), int(match.group(2))
    start = f"{hour:02d}:{minute:02d}"
    
    # 1.5시간 추가
    start_dt = datetime.strptime(start, "%H:%M")
    end_dt = start_dt + timedelta(hours=1, minutes=30)
    end = end_dt.strftime("%H:%M")
    
    return start, end


def parse_days_and_time(info_str: str) -> list[dict]:
    """
    교수/시간 정보 문자열에서 요일과 시간을 추출
    예: "화/목 10:30" -> [{"day": "TUE", "start": "10:30", "end": "12:00"}, ...]
    """
    meetings = []
    
    # 괄호 안의 시간 정보 추출
    paren_match = re.search(r"\(([^)]+)\)", info_str)
    if not paren_match:
        return meetings
    
    time_info = paren_match.group(1)
    
    # "미지정" 체크
    if "미지정" in time_info:
        return meetings
    
    # 요일 추출
    days = []
    for kr_day, en_day in DAY_MAP.items():
        if kr_day in time_info:
            days.append(en_day)
    
    # 시간 추출
    start, end = parse_time(time_info)
    
    if days and start:
        for day in days:
            meetings.append({
                "day": day,
                "start": start,
                "end": end,
                "room": None
            })
    
    return meetings


def parse_instructor_name(info_str: str) -> str:
    """
    교수 정보 문자열에서 교수명만 추출
    예: "김철수 (화/목 10:30)" -> "김철수"
    """
    # 괄호 전까지의 텍스트
    match = re.match(r"([^\(]+)", info_str)
    if match:
        name = match.group(1).strip()
        # 분반 번호 제거 (01, 02 등)
        name = re.sub(r"^\d+\s*", "", name)
        # 분반 범위 제거 (01~04 등)
        name = re.sub(r"^\d+~\d+\s*", "", name)
        # "-" 만 있는 경우 제거
        if name == "-" or name == "":
            return None
        return name.strip()
    return None


def parse_markdown_table(md_content: str) -> list[dict]:
    """
    마크다운 테이블을 파싱하여 강의 정보 리스트 반환
    """
    courses = []
    current_section = None
    table_has_category = False  # 구분(category) 열이 있는지 여부
    
    lines = md_content.split("\n")
    
    for line in lines:
        # 섹션 헤더 확인
        if line.startswith("### "):
            current_section = line.strip()
            table_has_category = False  # 새 섹션에서 리셋
            continue
        
        # 테이블 행 확인 (| 로 시작)
        if not line.startswith("|"):
            continue
        
        # 구분선 스킵
        if "---" in line:
            continue
        
        # 헤더 행에서 테이블 구조 파악
        if "학수번호" in line:
            # "구분" 열이 있는지 확인
            table_has_category = "구분" in line
            continue
        
        # 셀 분리
        cells = [c.strip() for c in line.split("|")]
        cells = [c for c in cells if c]  # 빈 셀 제거
        
        if len(cells) < 4:
            continue
        
        course = None
        
        # 테이블에 구분(category) 열이 있는 경우: 5열 구조
        # 구분 | 학수번호 | 과목명 | 학점 | 담당교수
        if table_has_category and len(cells) >= 5:
            category = cells[0]
            course_code = cells[1]
            title = cells[2]
            credits = cells[3]
            instructor_info = cells[4] if len(cells) > 4 else ""
            
            # 학과 결정
            if current_section and "인문사회" in current_section:
                dept = "인문사회과학부"
            elif category in DEPT_MAP:
                dept = DEPT_MAP[category]
            else:
                dept = "GIST대학"
            
            course = {
                "department": dept,
                "course_code": course_code,
                "title": title,
                "credits": int(credits) if credits.isdigit() else 0,
                "instructor_info": instructor_info,
                "instructors": [],
                "meetings": []
            }
        
        # 테이블에 구분 열이 없는 경우: 4열 구조
        # 학수번호 | 과목명 | 학점 | 담당교수
        elif not table_has_category and len(cells) >= 4:
            course_code = cells[0]
            title = cells[1]
            credits = cells[2]
            instructor_info = cells[3] if len(cells) > 3 else ""
            
            # 섹션에서 학과명 추출
            dept = "기타"
            if current_section:
                if "전기전자컴퓨터" in current_section:
                    dept = "전기전자컴퓨터공학부"
                elif "신소재" in current_section:
                    dept = "신소재공학과"
                elif "기계로봇" in current_section:
                    dept = "기계로봇공학부"
                elif "환경에너지" in current_section:
                    dept = "환경에너지공학부"
                elif "생명과학" in current_section:
                    dept = "생명과학과"
                elif "물리광과학" in current_section:
                    dept = "물리·광과학과"
                elif "화학" in current_section:
                    dept = "화학과"
                elif "수리과학" in current_section:
                    dept = "수리과학과"
            
            course = {
                "department": dept,
                "course_code": course_code,
                "title": title,
                "credits": int(credits) if credits.isdigit() else 0,
                "instructor_info": instructor_info,
                "instructors": [],
                "meetings": []
            }
        
        if course:
            # 교수명 추출
            instructor_name = parse_instructor_name(course["instructor_info"])
            if instructor_name:
                # 슬래시로 구분된 복수 교수 처리
                for name in re.split(r"[/,]", instructor_name):
                    name = name.strip()
                    if name and name != "-":
                        course["instructors"].append({"name": name, "staff_id": None})
            
            # 시간 정보 추출
            course["meetings"] = parse_days_and_time(course["instructor_info"])
            
            courses.append(course)
    
    return courses


def create_new_course_entry(md_course: dict, next_no: int) -> dict:
    """
    마크다운 강의 정보로 새로운 JSON 항목 생성
    """
    return {
        "no": next_no,
        "department": md_course["department"],
        "course_code": md_course["course_code"],
        "section": "01",
        "title": md_course["title"],
        "category": "선택",
        "subcategory": None,
        "research_area": "교과",
        "program": "학사",
        "hours": {
            "lecture_hours": md_course["credits"],
            "lab_hours": 0,
            "credits": md_course["credits"]
        },
        "meetings": md_course["meetings"],
        "capacity": 0,
        "syllabus": "view",
        "video": None,
        "language": "Korean",
        "instructors": md_course["instructors"]
    }


def update_json_with_markdown(json_data: dict, md_courses: list[dict]) -> tuple[dict, dict]:
    """
    마크다운 정보로 JSON 데이터 업데이트
    - 기존 강의: 교수/시간 정보 업데이트
    - 누락된 강의: 새로 추가
    
    Returns:
        updated_json, stats (업데이트 통계)
    """
    stats = {
        "instructors_updated": 0,
        "meetings_added": 0,
        "courses_added": 0,
        "courses_not_found": [],
        "total_md_courses": len(md_courses)
    }
    
    # course_code로 JSON 항목 인덱싱
    json_by_code = {}
    for item in json_data["items"]:
        code = item["course_code"]
        if code not in json_by_code:
            json_by_code[code] = []
        json_by_code[code].append(item)
    
    # 다음 no 계산
    next_no = max(item["no"] for item in json_data["items"]) + 1
    
    for md_course in md_courses:
        code = md_course["course_code"]
        
        # JSON에서 해당 강의 찾기
        if code in json_by_code:
            items = json_by_code[code]
            
            for item in items:
                # 교수 정보 업데이트 (비어있거나 없는 경우)
                if md_course["instructors"] and (not item.get("instructors") or len(item["instructors"]) == 0):
                    item["instructors"] = md_course["instructors"]
                    stats["instructors_updated"] += 1
                
                # 시간 정보 보충 (없는 경우)
                if md_course["meetings"] and (not item.get("meetings") or len(item["meetings"]) == 0):
                    item["meetings"] = md_course["meetings"]
                    stats["meetings_added"] += 1
        else:
            # JSON에 없는 강의 -> 새로 추가
            new_entry = create_new_course_entry(md_course, next_no)
            json_data["items"].append(new_entry)
            json_by_code[code] = [new_entry]  # 인덱스에도 추가
            stats["courses_added"] += 1
            stats["courses_not_found"].append({
                "code": code,
                "title": md_course["title"],
                "department": md_course["department"]
            })
            next_no += 1
    
    # count 업데이트
    json_data["count"] = len(json_data["items"])
    
    return json_data, stats


def main():
    print("=" * 60)
    print("2026년 1학기 강의 데이터 업데이트")
    print("=" * 60)
    
    # 마크다운 파일 읽기
    print(f"\n📖 마크다운 파일 읽는 중: {MD_FILE}")
    with open(MD_FILE, "r", encoding="utf-8") as f:
        md_content = f.read()
    
    # 마크다운 파싱
    print("📝 마크다운 테이블 파싱 중...")
    md_courses = parse_markdown_table(md_content)
    print(f"   → {len(md_courses)}개 강의 파싱 완료")
    
    # JSON 파일 읽기
    print(f"\n📖 JSON 파일 읽는 중: {JSON_FILE}")
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        json_data = json.load(f)
    print(f"   → {json_data['count']}개 강의 로드 완료")
    
    # 업데이트 수행
    print("\n🔄 데이터 업데이트 중...")
    updated_json, stats = update_json_with_markdown(json_data, md_courses)
    
    # 결과 저장
    print(f"\n💾 결과 저장 중: {OUTPUT_FILE}")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(updated_json, f, ensure_ascii=False, indent=2)
    
    # 통계 출력
    print("\n" + "=" * 60)
    print("📊 업데이트 통계")
    print("=" * 60)
    print(f"  마크다운 강의 수: {stats['total_md_courses']}")
    print(f"  교수 정보 업데이트: {stats['instructors_updated']}건")
    print(f"  시간 정보 추가: {stats['meetings_added']}건")
    print(f"  신규 강의 추가: {stats['courses_added']}건")
    
    if stats["courses_not_found"]:
        print(f"\n📌 추가된 강의 목록 ({len(stats['courses_not_found'])}건):")
        for c in stats["courses_not_found"][:10]:  # 최대 10개만 출력
            print(f"     + {c['code']}: {c['title']} ({c['department']})")
        if len(stats["courses_not_found"]) > 10:
            print(f"     ... 외 {len(stats['courses_not_found']) - 10}건")
    
    print("\n✅ 완료!")


if __name__ == "__main__":
    main()
