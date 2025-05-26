
import { useState, useMemo } from 'react';
import { Class } from '@/types/class';

export const useClassFilters = (classes: Class[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.teacher.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || cls.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [classes, searchTerm, filterStatus]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredClasses
  };
};
