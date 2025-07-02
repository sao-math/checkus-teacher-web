import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Class } from '@/types/class';
import { classApi } from '@/services/classApi';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import ClassManagementHeader from '@/components/classes/ClassManagementHeader';
import ClassFilters from '@/components/classes/ClassFilters';
import ManagementList from '@/components/ui/ManagementList';

const ClassManagement = () => {
  // useCrudOperations 훅으로 모든 CRUD 로직 통합
  const crud = useCrudOperations<Class>({
    endpoints: {
      list: classApi.getClasses,
      create: classApi.createClass,
      update: classApi.updateClass,
      delete: classApi.deleteClass,
    },
    routes: {
      detail: (cls) => `/classes/${cls.id}`,
      edit: (cls) => `/classes/${cls.id}/edit`,
      create: '/classes/new',
    },
    searchFields: ['name', 'teacher', 'schedule'],
    statusField: 'status',
    statusOptions: [
      { value: 'all', label: '전체' },
      { value: 'active', label: '활성' },
      { value: 'inactive', label: '비활성' },
    ],
    messages: {
      deleteSuccess: (cls) => `${cls.name} 클래스가 삭제되었습니다.`,
      deleteError: '클래스 삭제에 실패했습니다. 다시 시도해주세요.',
      fetchError: '클래스 목록을 불러오는데 실패했습니다.',
    },
    initialFilter: 'all',
  });

  // 컬럼 정의
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
      <ClassManagementHeader onCreateClick={crud.handleCreate} />

      <ClassFilters
        searchTerm={crud.searchTerm}
        onSearchChange={crud.setSearchTerm}
        filterStatus={crud.filterStatus as 'all' | 'active' | 'inactive'}
        onFilterChange={crud.setFilterStatus}
      />

      <ManagementList
        items={crud.filteredItems}
        columns={columns}
        onView={crud.handleView}
        onEdit={crud.handleEdit}
        onDelete={crud.deleteItem}
        getDeleteConfirmation={crud.getDeleteConfirmation}
        emptyMessage="검색 결과가 없습니다. 다른 검색어를 시도해보세요."
      />
    </div>
  );
};

export default ClassManagement;
