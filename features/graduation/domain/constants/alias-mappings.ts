/**
 * Course Alias Mappings - Generated from course_db.csv
 *
 * Maps course codes to their aliases (same course with different codes).
 * Used for dual-credit course verification in graduation requirements.
 *
 * 동일 과목이 여러 학수번호로 개설되는 경우의 매핑 데이터.
 * 예: 문화콘텐츠의 이해 → GS2544 = HS2544 (인문사회) = CT2544 (문화기술 부전공)
 */

// Bidirectional alias mappings: code → [aliases]
// Note: GS↔HS mappings with same suffix are auto-generated in getAliases()
export const COURSE_ALIAS_MAP: Record<string, readonly string[]> = {
  // 문화콘텐츠의 이해 - GS/HS/CT 모두 매핑
  GS2544: ['HS2544', 'CT2544'],
  CT2544: ['GS2544', 'HS2544'],
  HS2544: ['GS2544', 'CT2544'],

  // 컴퓨터 그래픽스
  AI3501: ['CT4201', 'EC4215'],
  CT4201: ['AI3501', 'EC4215'],
  EC4215: ['AI3501', 'CT4201'],

  // 회로이론
  EC2201: ['IR2201', 'SE2104'],
  IR2201: ['EC2201', 'SE2104'],
  SE2104: ['EC2201', 'IR2201'],

  // 생화학 I
  BS2104: ['CH3106', 'EV3223', 'MA2203'],
  CH3106: ['BS2104', 'EV3223', 'MA2203'],
  EV3223: ['BS2104', 'CH3106', 'MA2203'],
  MA2203: ['BS2104', 'CH3106', 'EV3223'],

  // 유기화학 I
  BS2101: ['CH2103', 'EV2213'],
  CH2103: ['BS2101', 'EV2213'],
  EV2213: ['BS2101', 'CH2103'],

  // 전자회로
  EC3207: ['PS3202', 'SE3201'],
  PS3202: ['EC3207', 'SE3201'],
  SE3201: ['EC3207', 'PS3202'],

  // 재료과학
  MA2101: ['MC3206', 'SE2204'],
  MC3206: ['MA2101', 'SE2204'],
  SE2204: ['MA2101', 'MC3206'],

  // 오토마타 이론
  AI3001: ['EC3216', 'MM3450'],
  EC3216: ['AI3001', 'MM3450'],
  MM3450: ['AI3001', 'EC3216'],

  // 물리전자 개론
  EC3221: ['MA2204', 'SE2101'],
  MA2204: ['EC3221', 'SE2101'],
  SE2101: ['EC3221', 'MA2204'],

  // 랜덤 프로세스
  EC4210: ['MM4750'],
  MM4750: ['EC4210'],

  // 운영체제
  AI3004: ['EC4205'],
  EC4205: ['AI3004'],

  // 디지털 설계
  EC2203: ['SE2206'],
  SE2206: ['EC2203'],

  // 데이터베이스 시스템
  AI3003: ['EC4204'],
  EC4204: ['AI3003'],

  // 기계학습
  AI4100: ['EC4224'],
  EC4224: ['AI4100'],

  // 공학전자기학 I
  EC2105: ['SE2103'],
  SE2103: ['EC2105'],

  // 기초공학수학 I
  EC2107: ['SE2102'],
  SE2102: ['EC2107'],

  // 딥 러닝
  IR4201: ['MA4228'],
  MA4228: ['IR4201'],

  // 로봇공학 및 비전
  AI4600: ['MC4237'],
  MC4237: ['AI4600'],

  // 다변수해석학과 응용
  GS2001: ['MM2001'],
  MM2001: ['GS2001'],

  // 미분방정식과 응용
  GS2002: ['MM2002'],
  MM2002: ['GS2002'],

  // 선형대수학과 응용 1
  GS2004: ['MM2004'],
  MM2004: ['GS2004'],

  // 분석화학 및 실험
  CH2101: ['EV2208'],
  EV2208: ['CH2101'],

  // 생유기화학과 바이오의약품
  CH4205: ['EV3214'],
  EV3214: ['CH4205'],

  // 수리물리 II
  MM3650: ['PS3206'],
  PS3206: ['MM3650'],

  // 양자물리 및 연습 I
  PS3103: ['SE3202'],
  SE3202: ['PS3103'],

  // 유한요소해석
  MC4202: ['MM4652'],
  MM4652: ['MC4202'],

  // 전산유체역학
  MC4210: ['MM4650'],
  MM4650: ['MC4210'],

  // 집적회로 소자
  EC4313: ['SE3101'],
  SE3101: ['EC4313'],

  // 현대재료물리
  MA2202: ['SE2205'],
  SE2205: ['MA2202'],

  // 학사논문연구 I
  EC9102: ['MM9102'],
  MM9102: ['EC9102'],

  // 학사논문연구 I/II (전 학과 공통)
  AI9102: ['BS9102', 'CH9102', 'EC9102', 'EV9102', 'MA9102', 'MC9102', 'PS9102'],
  BS9102: ['AI9102', 'CH9102', 'EC9102', 'EV9102', 'MA9102', 'MC9102', 'PS9102'],
  CH9102: ['AI9102', 'BS9102', 'EC9102', 'EV9102', 'MA9102', 'MC9102', 'PS9102'],
  EV9102: ['AI9102', 'BS9102', 'CH9102', 'EC9102', 'MA9102', 'MC9102', 'PS9102'],
  MA9102: ['AI9102', 'BS9102', 'CH9102', 'EC9102', 'EV9102', 'MC9102', 'PS9102'],
  MC9102: ['AI9102', 'BS9102', 'CH9102', 'EC9102', 'EV9102', 'MA9102', 'PS9102'],
  PS9102: ['AI9102', 'BS9102', 'CH9102', 'EC9102', 'EV9102', 'MA9102', 'MC9102'],
} as const;

/**
 * GS/HS 접미사 기반 자동 매핑
 * GS2544와 HS2544는 같은 과목이므로 자동으로 alias 생성
 */
function getGsHsAlias(code: string): string | null {
  const match = code.match(/^(GS|HS)(\d{4})$/);
  if (!match) return null;

  const [, prefix, suffix] = match;
  return prefix === 'GS' ? `HS${suffix}` : `GS${suffix}`;
}

/**
 * Returns all aliases for a given course code.
 * @param code - Course code (e.g., 'HS2544')
 * @returns Array of alias codes, empty array if no aliases
 */
export function getAliases(code: string): readonly string[] {
  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Check explicit mappings first
  const explicit = COURSE_ALIAS_MAP[normalized];
  if (explicit) {
    // Also add GS/HS auto-mapping if applicable
    const gsHs = getGsHsAlias(normalized);
    if (gsHs && !explicit.includes(gsHs)) {
      return [...explicit, gsHs];
    }
    return explicit;
  }

  // Auto-generate GS↔HS mapping
  const gsHs = getGsHsAlias(normalized);
  if (gsHs) {
    // Check if the HS/GS counterpart has explicit mappings, cascade them
    const counterpartAliases = COURSE_ALIAS_MAP[gsHs];
    if (counterpartAliases) {
      return [gsHs, ...counterpartAliases.filter((a) => a !== normalized)];
    }
    return [gsHs];
  }

  return [];
}

/**
 * Returns all equivalent codes for a course (including the original).
 * @param code - Course code (e.g., 'HS2544')
 * @returns Array including original code and all aliases
 */
export function getAllEquivalentCodes(code: string): string[] {
  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const aliases = getAliases(normalized);
  return [normalized, ...aliases];
}

/**
 * Checks if two course codes are aliases of each other.
 * @param code1 - First course code
 * @param code2 - Second course code
 * @returns true if codes are aliases
 */
export function areAliases(code1: string, code2: string): boolean {
  const norm1 = code1.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const norm2 = code2.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (norm1 === norm2) return true;

  const aliases = getAliases(norm1);
  return aliases.includes(norm2);
}
