
import { Class } from '@/types/class';

export const mockClasses: Class[] = [
  {
    id: 1,
    name: '3-A반',
    teacher: '김선생님',
    schedule: '월,수,금 09:00-10:30',
    status: 'active',
    studentCount: 28,
    maxStudents: 30,
    description: '고등학교 3학년 수학 심화반입니다.'
  },
  {
    id: 2,
    name: '2-B반',
    teacher: '이선생님',
    schedule: '화,목 14:00-15:30',
    status: 'active',
    studentCount: 32,
    maxStudents: 35
  },
  {
    id: 3,
    name: '1-C반',
    teacher: '박선생님',
    schedule: '월,화,수 11:00-12:00',
    status: 'active',
    studentCount: 25,
    maxStudents: 30
  },
  {
    id: 4,
    name: '특별반',
    teacher: '최선생님',
    schedule: '토 10:00-12:00',
    status: 'inactive',
    studentCount: 15,
    maxStudents: 20,
    description: '주말 논술 특별반입니다.'
  }
];
