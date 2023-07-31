export interface CourseType {
  id: number;
  courseCode: string;
  courseCredit: number;
  courseName: string;
  courseTags: string[];
  prerequisite: string;
  description: string;
}

const minorTypes = {
  BS: 'BS',
  CH: 'CH',
  CT: 'CT',
  EB: 'EB',
  EC: 'EC',
  EV: 'EV',
  FE: 'FE',
  IR: 'IR',
  LH: 'LH',
  MA: 'MA',
  MB: 'MB',
  MC: 'MC',
  MD: 'MD',
  MM: 'MM',
  NONE: 'NONE',
  PP: 'PP',
  PS: 'PS',
  SS: 'SS',
};

export type MinorType = keyof typeof minorTypes;
