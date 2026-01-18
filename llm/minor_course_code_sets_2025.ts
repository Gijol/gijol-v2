// Auto-generated minor course code sets (2025 handbook only)
// Sources:
// - courses_master_from_handbooks_2020_2025.csv
// - course_applicability_2018-2020_vs_2021plus.csv (filtered source_handbook_year=2025)

export const MINOR_COURSE_CODE_SETS_2025 = {
  "q 문화기술 부전공": ["CT2501", "CT2502", "CT2504", "CT2505", "CT2506", "CT2521", "CT2544", "CT2661", "CT2824", "CT2832", "CT4101", "CT4102", "CT4201", "CT4202", "CT4203", "CT4301", "CT4302", "CT4303", "CT4304", "CT4305", "CT4310", "CT4504", "CT4506", "IR2201", "IR2202", "IR3202", "IR3203", "IR4201", "IR4202", "IR4203", "IR4205", "IR4206", "IR4207", "IR4208", "IR4209", "IR4307", "IR4310", "IR4602"],
  "인문사회과학 부전공 q 문학과 역사": ["GS2822", "GS2823", "GS2824", "GS2825", "GS2840", "GS2911", "GS2912", "GS2913", "GS2921", "GS2922", "GS2931", "GS2932", "GS2933", "GS3506", "GS3507", "LH2503", "LH2506", "LH2507", "LH2509", "LH2511", "LH2512", "LH2521", "LH2522", "LH2525", "LH2526", "LH2602", "LH2612", "LH2613", "LH2614", "LH2616", "LH2618", "LH2656", "LH3501", "LH3502", "LH3504", "LH3505", "LH3602", "LH3605", "LH3802"],
} as const;

export type MinorName2025 = keyof typeof MINOR_COURSE_CODE_SETS_2025;

export function isCourseInMinor2025(courseCode: string, minor: MinorName2025): boolean {
  return (MINOR_COURSE_CODE_SETS_2025[minor] as readonly string[]).includes(courseCode);
}

export function findMinorsByCourseCode2025(courseCode: string): MinorName2025[] {
  const hits: MinorName2025[] = [];
  (Object.keys(MINOR_COURSE_CODE_SETS_2025) as MinorName2025[]).forEach((m) => {
    if (isCourseInMinor2025(courseCode, m)) hits.push(m);
  });
  return hits;
}
