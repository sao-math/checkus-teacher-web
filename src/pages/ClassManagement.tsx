import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Class } from '@/types/class';
import { mockClasses } from '@/data/mockClasses';
import { useClassFilters } from '@/hooks/useClassFilters';
import ClassManagementHeader from '@/components/classes/ClassManagementHeader';
import ClassFilters from '@/components/classes/ClassFilters';
import ClassGrid from '@/components/classes/ClassGrid';

const ClassManagement = () => {
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredClasses
  } = useClassFilters(classes);

  const handleCreateClass = () => {
    navigate('/classes/new');
  };

  const handleClassClick = (cls: Class) => {
    navigate(`/classes/${cls.id}`);
  };

  const handleEditClass = (cls: Class) => {
    navigate(`/classes/${cls.id}/edit`);
  };

  const handleDeleteClass = (cls: Class) => {
    setClasses(prev => prev.filter(c => c.id !== cls.id));
    toast({
      title: "클래스 삭제",
      description: `${cls.name} 클래스가 삭제되었습니다.`,
    });
  };

  return (
    <div className="space-y-6">
      <ClassManagementHeader onCreateClick={handleCreateClass} />

      <ClassFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      <ClassGrid
        classes={filteredClasses}
        onClassClick={handleClassClick}
        onEdit={handleEditClass}
        onDelete={handleDeleteClass}
      />
    </div>
  );
};

export default ClassManagement;
