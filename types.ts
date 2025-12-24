
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export interface Person {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: Gender;
  dob?: string;
  currentLocation?: string;
  placeOfBirth?: string;
  ancestralHome?: string;
  gotra?: string;
  profession?: string;
  bio?: string;
  photo?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  isLiving: boolean;
  education?: string;
  hobbies?: string;
  achievements?: string;
}

export interface KinshipPath {
  path: string[];
  term: string;
}

export interface SearchResult {
  person: Person;
  confidence: number;
}
