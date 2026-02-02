export type MandatoryRule = {
  label: string;
  requiredCount: number;
  courses: string[];
};

export const MAJOR_MANDATORY_RULES: Record<string, MandatoryRule[]> = {
  EC: [
    {
      label: '전공필수 택1 (EC3101, EC3102)',
      requiredCount: 1,
      courses: ['EC3101', 'EC3102'],
    },
  ],
  MC: [
    {
      label: '전공필수 택3 (MC2100, MC2101, MC2102, MC2103, MC3106)',
      requiredCount: 3,
      courses: ['MC2100', 'MC2101', 'MC2102', 'MC2103', 'MC3106'],
    },
  ],
};
