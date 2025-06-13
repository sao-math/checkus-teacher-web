import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ManagementList from '@/components/ui/ManagementList';

interface Teacher {
  id: number;
  username: string;
  name: string;
  phoneNumber: string;
  discordId?: string;
  createdAt: string;
  status: 'active' | 'pending' | 'resigned';
  classes: string[];
}

const mockTeachers: Teacher[] = [
  {
    id: 1,
    username: 'teacher1',
    name: '김선생님',
    phoneNumber: '010-1234-5678',
    discordId: 'teacher1#1234',
    createdAt: '2024-01-01',
    status: 'active',
    classes: ['고1 수학', '고2 수학']
  },
  {
    id: 2,
    username: 'teacher2',
    name: '이선생님',
    phoneNumber: '010-2345-6789',
    discordId: 'teacher2#5678',
    createdAt: '2024-01-02',
    status: 'active',
    classes: ['중2 수학', '중3 수학']
  }
];

const mockPendingTeachers: Teacher[] = [
  {
    id: 3,
    username: 'teacher3',
    name: '박선생님',
    phoneNumber: '010-3456-7890',
    createdAt: '2024-01-03',
    status: 'pending',
    classes: []
  }
];

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'pending' | 'resigned' | 'all'>('all');
  const [teachers, setTeachers] = useState<Teacher[]>([...mockTeachers, ...mockPendingTeachers]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resigned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '재직중';
      case 'pending': return '승인대기';
      case 'resigned': return '퇴직';
      default: return '알 수 없음';
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    (filterStatus === 'all' || teacher.status === filterStatus) &&
    (teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phoneNumber.includes(searchTerm))
  );

  const handleViewDetails = (teacher: Teacher) => {
    navigate(`/teachers/${teacher.id}`);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    navigate(`/teachers/${teacher.id}/edit`);
  };

  const handleDelete = (teacher: Teacher) => {
    setTeachers(prev => prev.filter(t => t.id !== teacher.id));
    toast({
      title: "선생님 삭제",
      description: `${teacher.name} 선생님이 삭제되었습니다.`,
    });
  };

  const columns = [
    {
      key: 'name',
      label: '선생님명',
      render: (value: string, teacher: Teacher) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
              {teacher.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">@{teacher.username}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: '상태',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {getStatusText(value)}
        </Badge>
      )
    },
    {
      key: 'phoneNumber',
      label: '전화번호'
    },
    {
      key: 'classes',
      label: '담당반',
      render: (value: string[]) => (
        value.length > 0 ? value.join(', ') : '담당반 없음'
      )
    },
    {
      key: 'discordId',
      label: 'Discord',
      render: (value: string) => value || '-'
    },
    {
      key: 'createdAt',
      label: '가입일',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">선생님 관리</h1>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="선생님 이름, 사용자명, 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'active' | 'pending' | 'resigned' | 'all')}
                className="h-8 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="active">재직중</option>
                <option value="pending">승인대기</option>
                <option value="resigned">퇴직</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 선생님 목록 */}
      <ManagementList
        items={filteredTeachers}
        columns={columns}
        onView={handleViewDetails}
        onEdit={handleEditTeacher}
        onDelete={handleDelete}
        getDeleteConfirmation={(teacher: Teacher) => ({
          title: '정말 삭제하시겠습니까?',
          description: `${teacher.name} 선생님의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`
        })}
        emptyMessage="검색 결과가 없습니다. 다른 검색어를 시도해보세요."
      />
    </div>
  );
};

export default TeacherManagement;
