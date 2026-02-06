# 복수 인정 과목 (Dual-Credit Courses)

> 졸업요건 검증 시 **다중 영역에 인정되어야 하는 과목들** 전수 조사 결과

## 개요

일부 과목들은 동일한 과목이지만 서로 다른 학수번호(alias)로 개설됩니다. 이 경우:
- **인문사회(HUS)** 학점으로 분류되면서 동시에 **부전공** 과목으로도 인정
- **전공 과목**이 동시에 **다른 전공/부전공**에도 인정
- **기초과학** 과목이 **전공 필수**로도 인정

현재 시스템에서는 **primary_course_code 기준 한 가지 분류로만 처리**되어 부전공/타전공 학점이 누락되는 문제가 발생합니다.

---

## 전수 조사 결과 (51개 과목)

> 데이터 출처: `DB/course_db.csv`의 `alias_course_codes` 컬럼

### 분류 1: 인문사회 ↔ 부전공 (7개)

| Primary Code | Alias Code(s) | 과목명 | 영향 영역 |
|---|---|---|---|
| CT2506 | HS2627 | 신화와 원형상징 | 문화기술 ↔ 인문사회 |
| CT2501 | HS2707 | 오타쿠 대중문화론 | 문화기술 ↔ 인문사회 |
| CT2504 | HS2814 | 유토피아 픽션과 테크놀로지 | 문화기술 ↔ 인문사회 |
| CT2502 | GS2543 | 현대 예술의 이해 | 문화기술 ↔ 기초선택 |
| HS2544 | CT2544 | 문화콘텐츠의 이해 | 인문사회 ↔ 문화기술 |
| AI4311 | IR4201 | 딥러닝 | AI융합 ↔ 지능로봇 |
| AI4601 | CT4301, IR4203 | 인간-컴퓨터 상호작용 | AI ↔ 문화기술 ↔ 지능로봇 |

### 분류 2: 전공 간 공유 (EECS ↔ AI ↔ 반도체) (18개)

| Primary Code | Alias Code(s) | 과목명 |
|---|---|---|
| EC4216 | AI4004 | 컴퓨터 비전 |
| EC4204 | AI3003 | 데이터베이스 시스템 |
| EC2207 | SE2202 | 기초공학수학 II |
| EC3221 | SE2101 | 물리전자 개론 |
| EC2205 | SE2203 | 공학전자기학 II |
| EC2203 | SE2206 | 디지털 설계 |
| AI4021 | EC4213 | 기계학습 및 딥러닝 |
| AI4501 | CT4303 | 게임 인공지능 |
| AI2004 | EC3215 | 시스템 프로그래밍 |
| AI2051 | EC2206 | 알고리즘 개론 |
| AI3001 | EC3216 | 오토마타 이론 |
| AI3004 | EC4205 | 운영체제 |
| EC3206 | SE2105 | 반도체 재료 및 소자 |
| EC4313 | SE3101 | 집적회로 소자 |
| EC4207 | MM4402 | 그래프 이론 |
| EC3207 | PS3202 | 전자회로 |
| AI3501 | CT4201, EC4215 | 컴퓨터 그래픽스 |
| EC2201 | FE2301, IR2201, SE2104 | 회로이론 |

### 분류 3: 기계로봇 ↔ 지능로봇 ↔ EECS (7개)

| Primary Code | Alias Code(s) | 과목명 |
|---|---|---|
| IR2202 | MC2103 | 동역학 |
| EC3219 | IR3202, MC3203 | 시스템 모델링 및 제어 |
| EC3214 | IR3203, MC3205 | 마이크로프로세서 및 응용 |
| IR4207 | MC3216 | 자동제어 |
| MA2101 | MC3206, SE2204 | 재료과학 |
| MA2202 | SE2205 | 현대재료물리 |
| EC3220 | FE3301 | 산업용 회로의 이해 |

### 분류 4: 생명과학 ↔ 화학 ↔ 환경공학 (10개)

| Primary Code | Alias Code(s) | 과목명 |
|---|---|---|
| BS2104 | CH3106, EV3223 | 생화학 I |
| BS3101 | CH4219, EV3216 | 생화학 II |
| BS3201 | EV3217 | 미생물학 |
| CH4205 | EV3214 | 생유기화학과 바이오의약품 |
| CH4213 | EV4223, MA3211 | 기기분석 |
| BS2101 | CH2103, EV2213 | 유기화학 I |
| BS2202 | EV2212 | 유전학 |
| BS3205 | EV3205 | 환경 생태학 |
| EV3219 | PS3107 | 수리물리 I |
| EV2216 | EV4212 | 수화학 기초 |

### 분류 5: 수학과 공유 (4개)

| Primary Code | Alias Code(s) | 과목명 |
|---|---|---|
| CT4504 | MM3601 | 과학계산 프로그래밍 |
| CT4506 | MM4603 | 몬테카를로 방법론과 응용 |
| EC4207 | MM4402 | 그래프 이론 |
| EV3219 | PS3107 | 수리물리 I |

### 분류 6: 에너지 대학원 공유 (5개)

| Primary Code | Alias Code(s) | 과목명 |
|---|---|---|
| EC4314 | FE4302 | 스마트그리드와 전력전자 응용 |
| EC4315 | FE4303 | 전력경제와 경영과학 |
| EC4316 | FE4308 | 전력변환시스템의 기초 |
| EC4306 | FE4306 | 전력시스템공학 |
| CH4222 | FE4201 | 에너지 변환과 저장 |

### 분류 7: 학사논문연구 (전 학과 공통)

| Primary Code | Alias Codes |
|---|---|
| AI9102 | BS9102, CH9102, EC9102, EV9102, MA9102, MC9102, PS9102 |
| AI9103 | BS9103, CH9103, EC9103, EV9103, MA9103, MC9103, PS9103 |

---

## 문제 분석

### 현재 검증 로직의 문제점

`VERIFICATION_LOGIC.md` 2단계 "1차 과목 분류"에서:
```
수강한 과목을 과목 코드를 기준으로 1차 분류
```

**문제**: `primary_course_code`만 확인하므로 `alias_course_codes`에 해당하는 영역은 인정되지 않음

### 실제 발생 사례
1. 학생이 **HS2544 (문화콘텐츠의 이해)** 수강
2. 인문사회 6학점으로만 분류됨
3. **CT2544**로도 인정받아야 하지만 문화기술 부전공 학점에 미반영
4. 부전공 이수 요건 미충족으로 잘못 판정

---

## 해결 방안

### Option A: Alias 확장 분류 (권장)

**1차 분류** 단계에서 alias 코드를 확장하여 **다중 영역에 동시 분류**:

```python
def classify_course(course_code, course_db):
    # 1. 직접 매칭
    course = find_course_by_code(course_code, course_db)
    
    # 2. Alias 확장: 모든 alias_course_codes에 대해 영역 탐색
    all_codes = [course.primary_code] + course.alias_codes
    
    eligible_areas = []
    for code in all_codes:
        areas = get_areas_for_code(code)  # 전공, 부전공, 인문사회 등
        eligible_areas.extend(areas)
    
    return unique(eligible_areas)
```

### Option B: 부전공 검증 시 Alias 매핑 적용

**영역별 세부 검증** 단계에서 부전공 과목 확인 시:

```python
def verify_minor(taken_courses, minor_requirements):
    for req_code in minor_requirements:
        # 직접 수강 확인
        if req_code in taken_courses:
            continue
        
        # Alias로 수강했는지 확인
        aliases = get_aliases_for_code(req_code)
        if any(alias in taken_courses for alias in aliases):
            continue  # Alias로 수강함 → 인정
        
        return False  # 미충족
    return True
```

### 구현 우선순위

| 단계 | 작업 | 영향 범위 |
|---|---|---|
| 1 | course_db.csv의 alias_course_codes 로드 | 데이터 계층 |
| 2 | 1차 분류 시 alias 확장 | Classification 단계 |
| 3 | 부전공 검증 시 alias 매핑 | Fine-Grained Check 단계 |
| 4 | 테스트: HS2544 → 문화기술 부전공 인정 확인 | 검증 |

---

## 필요 작업 체크리스트

- [x] 복수 인정 과목 전수 조사 완료 (51개 과목)
- [ ] 졸업요건 검증 로직에 alias 매핑 반영
- [ ] 부전공 학점 계산 시 alias 코드 고려
- [ ] 테스트: 문화콘텐츠의 이해(HS2544) 수강 시 문화기술 부전공 학점 인정 확인

---

*마지막 업데이트: 2026-02-06*
