
import { Person, Gender } from './types';

export const INITIAL_PEOPLE: Person[] = [
  {
    id: '1',
    firstName: 'Rajesh',
    lastName: 'Sharma',
    gender: Gender.MALE,
    dob: '1955-06-15',
    currentLocation: 'New Delhi, India',
    placeOfBirth: 'Varanasi, UP',
    ancestralHome: 'Varanasi, UP',
    profession: 'Civil Engineer (Retd.)',
    bio: 'Avid traveler and history enthusiast. Loves discussing family roots.',
    isLiving: true,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: '2',
    firstName: 'Sunita',
    lastName: 'Sharma',
    gender: Gender.FEMALE,
    dob: '1960-03-20',
    currentLocation: 'New Delhi, India',
    placeOfBirth: 'Lucknow, UP',
    ancestralHome: 'Lucknow, UP',
    profession: 'Educationist',
    isLiving: true,
    spouseId: '1',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: '3',
    firstName: 'Amit',
    lastName: 'Sharma',
    gender: Gender.MALE,
    dob: '1985-11-10',
    currentLocation: 'Bangalore, KA',
    placeOfBirth: 'New Delhi, India',
    ancestralHome: 'Varanasi, UP',
    profession: 'Software Architect',
    bio: 'Passionate about building technologies that bring people together.',
    isLiving: true,
    fatherId: '1',
    motherId: '2',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: '4',
    firstName: 'Deepak',
    lastName: 'Sharma',
    gender: Gender.MALE,
    dob: '1962-01-05',
    currentLocation: 'Lucknow, UP',
    placeOfBirth: 'Lucknow, UP',
    ancestralHome: 'Varanasi, UP',
    profession: 'Business Owner',
    isLiving: true,
    fatherId: '10',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: '10',
    firstName: 'Harish',
    lastName: 'Sharma',
    gender: Gender.MALE,
    dob: '1930-05-12',
    currentLocation: 'Haridwar, UK',
    placeOfBirth: 'Rawalpindi',
    ancestralHome: 'Rawalpindi (Pre-partition)',
    profession: 'Community Leader',
    isLiving: false,
    photo: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&q=80&w=200'
  }
];

export const getFullName = (p: Partial<Person>) => {
  if (!p) return '';
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
};
