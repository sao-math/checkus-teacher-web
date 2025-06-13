import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Class } from '@/types/class';
import { mockClasses } from '@/data/mockClasses';
import { useClassFilters } from '@/hooks/useClassFilters';
import ClassManagementHeader from '@/components/classes/ClassManagementHeader';
import ClassFilters from '@/components/classes/ClassFilters';
import ManagementList from '@/components/ui/ManagementList';

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

  const columns = [
    {
      key: 'name',
      label: '반 이름',
      render: (value: string, cls: Class) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
              {cls.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: '상태',
      render: (value: string) => (
        <Badge 
          variant={value === 'active' ? 'default' : 'secondary'}
          className={value === 'active' ? 'bg-green-100 text-green-800' : ''}
        >
          {value === 'active' ? '활성' : '비활성'}
        </Badge>
      )
    },
    {
      key: 'teacher',
      label: '담당 선생님'
    },
    {
      key: 'studentCount',
      label: '학생 수',
      render: (value: number, cls: Class) => (
        <span>
          {value}명{cls.maxStudents && ` / ${cls.maxStudents}명`}
        </span>
      )
    },
    {
      key: 'schedule',
      label: '수업 일정'
    }
  ];

  return (
    <div className="space-y-6">
      <ClassManagementHeader onCreateClick={handleCreateClass} />

      <ClassFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      <ManagementList
        items={filteredClasses}
        columns={columns}
        onView={handleClassClick}
        onEdit={handleEditClass}
        onDelete={handleDeleteClass}
        getDeleteConfirmation={(cls: Class) => ({
          title: '정말 삭제하시겠습니까?',
          description: `${cls.name} 반의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`
        })}
        emptyMessage="검색 결과가 없습니다. 다른 검색어를 시도해보세요."
      />
    </div>
  );
};

export default ClassManagement;
