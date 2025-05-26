
import { useState, useMemo } from 'react';
import { Student } from '@/types/student';

export const useStudentFilters = (students: Student[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'graduated'>('all');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (student.discordId && student.discordId.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, filterStatus]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredStudents
  };
};
