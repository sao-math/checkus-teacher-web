import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Users, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRoleResponse } from '@/types/admin';
import { TeacherListResponse } from '@/types/teacher';
import { adminApi } from '@/services/adminApi';
import { teacherApi } from '@/services/teacherApi';
import ManagementList from '@/components/ui/ManagementList';

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'all'>('all');
  const [teachers, setTeachers] = useState<TeacherListResponse[]>([]);
  const [pendingTeachers, setPendingTeachers] = useState<UserRoleResponse[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingTeachers();
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [filterStatus]);

  const fetchTeachers = async () => {
    try {
      setTeachersLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const data = await teacherApi.getTeachers(params);
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "오류",
        description: "교사 목록을 불러오는데 실패했습니다: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    } finally {
      setTeachersLoading(false);
    }
  };

  const fetchPendingTeachers = async () => {
    try {
      setPendingLoading(true);
      const data = await adminApi.getRoleRequests('TEACHER');
      setPendingTeachers(data);
    } catch (error) {
      console.error('Error fetching pending teachers:', error);
      toast({
        title: "오류",
        description: "대기중인 교사 목록을 불러오는데 실패했습니다: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    } finally {
      setPendingLoading(false);
    }
  };

  const handleApproveTeacher = async (userId: number, name: string) => {
    try {
      await adminApi.approveRole(userId, 'TEACHER');
      setPendingTeachers(prev => prev.filter(teacher => teacher.userId !== userId));
      // Refresh the active teachers list
      fetchTeachers();
      toast({
        title: "선생님 승인 완료",
        description: `${name} 선생님의 계정이 승인되었습니다.`,
      });
    } catch (error) {
      console.error('Error approving teacher:', error);
      toast({
        title: "오류",
        description: "교사 승인에 실패했습니다: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    }
  };

  const handleRejectTeacher = async (userId: number, name: string) => {
    try {
      await adminApi.suspendRole(userId, 'TEACHER');
      setPendingTeachers(prev => prev.filter(teacher => teacher.userId !== userId));
      toast({
        title: "선생님 계정 거절",
        description: `${name} 선생님의 계정이 거절되었습니다.`,
      });
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      toast({
        title: "오류",
        description: "교사 거절에 실패했습니다: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '재직중';
      case 'SUSPENDED': return '정지됨';
      default: return '알 수 없음';
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    (teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phoneNumber.includes(searchTerm))
  );

  const filteredPendingTeachers = pendingTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (teacher: TeacherListResponse) => {
    navigate(`/teachers/${teacher.id}`);
  };

  const handleEditTeacher = (teacher: TeacherListResponse) => {
    navigate(`/teachers/${teacher.id}/edit`);
  };

  const handleDelete = async (teacher: TeacherListResponse) => {
    try {
      await teacherApi.deleteTeacher(teacher.id);
      await fetchTeachers(); // Refresh the list
      toast({
        title: "선생님 삭제",
        description: `${teacher.name} 선생님이 삭제되었습니다.`,
      });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "오류",
        description: "교사 삭제에 실패했습니다: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: 'name',
      label: '선생님명',
      render: (value: string, teacher: TeacherListResponse) => (
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
      render: (value: { id: number; name: string }[]) => (
        value.length > 0 ? value.map(cls => cls.name).join(', ') : '담당반 없음'
      )
    },
    {
      key: 'discordId',
      label: 'Discord',
      render: (value: string) => value || '-'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">선생님 관리</h1>
        </div>
      </div>

      {/* 계정 승인 대기 섹션 - 미승인 계정이 있을 때만 표시 */}
      {pendingTeachers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">계정 승인 대기</h2>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                {filteredPendingTeachers.length}명
              </Badge>
            </div>
            {pendingLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPendingTeachers.map((teacher) => (
                  <div key={teacher.userId} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                          {teacher.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-gray-500">@{teacher.username}</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        {teacher.statusDescription}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                        onClick={() => handleApproveTeacher(teacher.userId, teacher.name)}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        onClick={() => handleRejectTeacher(teacher.userId, teacher.name)}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                onChange={(e) => setFilterStatus(e.target.value as 'ACTIVE' | 'SUSPENDED' | 'all')}
                className="h-8 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="ACTIVE">재직중</option>
                <option value="SUSPENDED">정지됨</option>
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
        getDeleteConfirmation={(teacher: TeacherListResponse) => ({
          title: '정말 삭제하시겠습니까?',
          description: `${teacher.name} 선생님의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`
        })}
        emptyMessage="검색 결과가 없습니다. 다른 검색어를 시도해보세요."
      />
    </div>
  );
};

export default TeacherManagement;
