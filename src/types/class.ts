
export interface Class {
  id: number;
  name: string;
  teacher: string;
  schedule: string;
  status: ClassStatus;
  studentCount: number;
  maxStudents?: number;
  description?: string;
}

export type ClassStatus = 'active' | 'inactive';
