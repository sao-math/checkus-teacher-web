import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/student';
import { UserRoleResponse } from '@/types/admin';
import { studentApi } from '@/services/studentApi';
import { schoolApi, School } from '@/services/schoolApi';
import { adminApi } from '@/services/adminApi';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import ManagementList from '@/components/ui/ManagementList';
import StatusBadge from '@/components/ui/StatusBadge';
import InlineEditSelect from '@/components/ui/InlineEditSelect';
import { getGradeText } from '@/utils/gradeUtils';
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner';

const StudentManagement = () => {
  const { toast } = useToast();
  
  // 승인 대기 학생 관리 (별도 관리)
  const [pendingStudents, setPendingStudents] = useState<UserRoleResponse[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 학교 목록 상태 추가
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolsInitialLoaded, setSchoolsInitialLoaded] = useState(false);

  // 주요 학생 관리 (useCrudOperations)
  const crud = useCrudOperations<Student>({
    endpoints: {
      list: studentApi.getStudents,
      update: studentApi.updateStudent,
      delete: studentApi.deleteStudent,
    },
    routes: {
      detail: (student) => `/students/${student.id}`,
      edit: (student) => `/students/${student.id}/edit`,
    },
    searchFields: ['name', 'school', 'studentPhoneNumber'],
    statusField: 'status',
    statusOptions: [
      { value: 'all', label: '전체' },
      { value: 'INQUIRY', label: '문의' },
      { value: 'COUNSELING_SCHEDULED', label: '상담' },
      { value: 'ENROLLED', label: '재원' },
      { value: 'WAITING', label: '대기' },
      { value: 'WITHDRAWN', label: '퇴원' },
      { value: 'UNREGISTERED', label: '미등록' },
    ],
    messages: {
      deleteSuccess: (student) => `${student.name} 학생이 삭제되었습니다.`,
      deleteError: '학생 삭제에 실패했습니다. 다시 시도해주세요.',
      fetchError: '학생 목록을 불러오는데 실패했습니다.',
    },
    initialFilter: 'all',
  });

  // 승인 대기 학생 조회
  useEffect(() => {
    fetchPendingStudents();
    fetchSchools(); // 초기 로딩
  }, []);

  const fetchPendingStudents = async () => {
    try {
      setPendingLoading(true);
      const data = await adminApi.getRoleRequests('STUDENT');
      setPendingStudents(data);
    } catch (error) {
      console.error('Error fetching pending students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending students: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchSchools = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setSchoolsLoading(true);
      }
      console.log('Fetching schools...', { isRefresh });
      const schoolData = await schoolApi.getSchools();
      console.log('Schools fetched:', schoolData);
      setSchools(schoolData);
      if (!schoolsInitialLoaded) {
        setSchoolsInitialLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: "Error",
        description: "Failed to fetch schools: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    } finally {
      if (!isRefresh) {
        setSchoolsLoading(false);
      }
    }
  };

  const handleApproveStudent = async (userId: number, name: string) => {
    try {
      await adminApi.approveRole(userId, 'STUDENT');
      setPendingStudents(prev => prev.filter(student => student.userId !== userId));
      toast({
        title: "학생 승인 완료",
        description: `${name} 학생의 계정이 승인되었습니다.`,
      });
      // 승인 후 학생 목록 새로고침
      crud.refreshItems();
    } catch (error) {
      console.error('Error approving student:', error);
      toast({
        title: "Error",
        description: "Failed to approve student: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    }
  };

  const handleRejectStudent = async (userId: number, name: string) => {
    try {
      await adminApi.suspendRole(userId, 'STUDENT');
      setPendingStudents(prev => prev.filter(student => student.userId !== userId));
      toast({
        title: "학생 계정 거절",
        description: `${name} 학생의 계정이 거절되었습니다.`,
      });
    } catch (error) {
      console.error('Error rejecting student:', error);
      toast({
        title: "Error",
        description: "Failed to reject student: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    }
  };

  // 인라인 편집을 위한 업데이트 함수들
  const handleStatusUpdate = async (studentId: number, newStatus: string | number): Promise<void> => {
    try {
      console.log('Updating student status:', { studentId, newStatus });
      
      const updateRequest: any = {
        profile: {
          status: newStatus as 'INQUIRY' | 'COUNSELING_SCHEDULED' | 'ENROLLED' | 'WAITING' | 'WITHDRAWN' | 'UNREGISTERED'
        }
      };
      
      console.log('Update request:', updateRequest);
      
      // 낙관적 업데이트 + API 호출
      await crud.updateItemOptimisticWithApi!(
        studentId,
        { status: newStatus as any },
        () => studentApi.updateStudent(studentId, updateRequest)
      );
      
      toast({
        title: "상태 변경 완료",
        description: "학생 상태가 성공적으로 변경되었습니다.",
      });
    } catch (error) {
      console.error('Error updating student status:', {
        studentId,
        newStatus,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      toast({
        title: "상태 변경 실패",
        description: "상태 변경에 실패했습니다: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSchoolUpdate = async (studentId: number, newSchoolId: string | number): Promise<void> => {
    try {
      console.log('Updating student school:', { studentId, newSchoolId });
      
      const updateRequest: any = {
        profile: {
          schoolId: Number(newSchoolId)
        }
      };
      
      console.log('Update request:', updateRequest);
      
      // 선택된 학교 정보 찾기
      const selectedSchool = schools.find(school => school.id === Number(newSchoolId));
      const schoolName = selectedSchool?.name || '알 수 없는 학교';
      
      // 낙관적 업데이트 + API 호출
      await crud.updateItemOptimisticWithApi!(
        studentId,
        { 
          schoolId: Number(newSchoolId),
          school: schoolName 
        },
        () => studentApi.updateStudent(studentId, updateRequest)
      );
      
      toast({
        title: "학교 변경 완료",
        description: "학생 학교가 성공적으로 변경되었습니다.",
      });
    } catch (error) {
      console.error('Error updating student school:', {
        studentId,
        newSchoolId,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      toast({
        title: "학교 변경 실패",
        description: "학교 변경에 실패했습니다: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleGradeUpdate = async (studentId: number, newGrade: string | number): Promise<void> => {
    try {
      console.log('Updating student grade:', { studentId, newGrade });
      
      const updateRequest: any = {
        profile: {
          grade: Number(newGrade)
        }
      };
      
      console.log('Update request:', updateRequest);
      
      // 낙관적 업데이트 + API 호출
      await crud.updateItemOptimisticWithApi!(
        studentId,
        { grade: Number(newGrade) },
        () => studentApi.updateStudent(studentId, updateRequest)
      );
      
      toast({
        title: "학년 변경 완료",
        description: "학생 학년이 성공적으로 변경되었습니다.",
      });
    } catch (error) {
      console.error('Error updating student grade:', {
        studentId,
        newGrade,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      toast({
        title: "학년 변경 실패",
        description: "학년 변경에 실패했습니다: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
      throw error;
    }
  };

  // 유틸리티 함수들
  const getRelationshipText = (relationship: string) => {
    switch (relationship) {
      case 'father': return '아버지';
      case 'mother': return '어머니';
      case 'guardian': return '보호자';
      default: return relationship;
    }
  };

  // 승인 대기 학생 필터링
  const filteredPendingStudents = pendingStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 컬럼 정의
  const columns = [
    {
      key: 'name',
      label: '학생명',
      render: (value: string, student: Student) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
              {student.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: '상태',
      render: (value: string, student: Student) => (
        <InlineEditSelect
          options={[
            { value: 'INQUIRY', label: '문의', color: 'text-yellow-800' },
            { value: 'COUNSELING_SCHEDULED', label: '상담', color: 'text-orange-800' },
            { value: 'ENROLLED', label: '재원', color: 'text-green-800' },
            { value: 'WAITING', label: '대기', color: 'text-purple-800' },
            { value: 'WITHDRAWN', label: '퇴원', color: 'text-red-800' },
            { value: 'UNREGISTERED', label: '미등록', color: 'text-gray-800' },
          ]}
          value={value}
          displayValue={<StatusBadge status={value} type="student" />}
          onSave={(newValue) => handleStatusUpdate(student.id, newValue)}
          className="w-24"
        />
      )
    },
    {
      key: 'school',
      label: '학교',
      render: (value: string, student: Student) => {
        console.log('School column render:', { 
          value, 
          studentSchoolId: student.schoolId, 
          schoolsCount: schools.length,
          schoolsLoading,
          schools: schools.slice(0, 3) // 처음 3개만 로그에 표시
        });
        
        if (schoolsLoading && !schoolsInitialLoaded) {
          return <span className="text-gray-500">학교 목록 로딩 중...</span>;
        }
        
        if (schools.length === 0) {
          return <span className="text-red-500">학교 목록 없음</span>;
        }
        
        return (
          <InlineEditSelect
            options={schools.map(school => ({ 
              value: school.id, 
              label: school.name 
            }))}
            value={student.schoolId}
            displayValue={value || '학교 미설정'}
            onSave={(newValue) => handleSchoolUpdate(student.id, newValue)}
            onOpen={async () => {
              console.log('학교 드롭다운 열림 - 최신 학교 목록 가져오는 중...');
              await fetchSchools(true); // refresh 모드로 호출
            }}
            className="w-32"
            disabled={schoolsLoading && !schoolsInitialLoaded}
          />
        );
      }
    },
    {
      key: 'grade',
      label: '학년',
      render: (value: number, student: Student) => (
        <InlineEditSelect
          options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getGradeText(i + 1) }))}
          value={value}
          onSave={(newValue) => handleGradeUpdate(student.id, newValue)}
          className="w-16"
        />
      )
    },
    {
      key: 'studentPhoneNumber',
      label: '학생 번호',
      render: (value: string) => value || '-'
    },
    {
      key: 'guardians',
      label: '학부모 정보',
      render: (guardians: any[], student: Student) => {
        if (!guardians || guardians.length === 0) {
          return <span className="text-gray-500">-</span>;
        }

        const firstGuardian = guardians[0];
        const additionalCount = guardians.length - 1;
        
        return (
          <div className="text-sm">
            <div className="font-medium">
              {firstGuardian.name} ({getRelationshipText(firstGuardian.relationship)})
            </div>
            <div className="text-gray-600">
              {firstGuardian.phoneNumber}
              {additionalCount > 0 && (
                <span className="text-blue-600 ml-1">+{additionalCount}명</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'classes',
      label: '반',
      render: (value: string[]) => (
        value.length > 0 ? value.join(', ') : '-'
      )
    }
  ];

  if (crud.loading || (schoolsLoading && !schoolsInitialLoaded)) {
    return <PageLoadingSpinner text="데이터를 불러오는 중..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학생 관리</h1>
        </div>
        {schools.length === 0 && !schoolsLoading && schoolsInitialLoaded && (
          <Button 
            onClick={() => fetchSchools()}
            variant="outline" 
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            학교 목록 다시 로드
          </Button>
        )}
      </div>

      {/* 학교 목록 로딩 실패 경고 */}
      {schools.length === 0 && !schoolsLoading && schoolsInitialLoaded && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                학교 목록을 불러오지 못했습니다. 학교 편집 기능이 제한될 수 있습니다.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 계정 승인 대기 섹션 - 미승인 계정이 있을 때만 표시 */}
      {pendingStudents.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">계정 승인 대기</h2>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                {filteredPendingStudents.length}명
              </Badge>
            </div>
            {pendingLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPendingStudents.map((student) => (
                  <div key={student.userId} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          @{student.username}
                          {student.schoolName && student.grade ? (
                            <span className="text-gray-600"> - {student.schoolName} {getGradeText(student.grade)}</span>
                          ) : student.schoolName ? (
                            <span className="text-gray-600"> - {student.schoolName}</span>
                          ) : (
                            <span className="text-gray-600"> - 학교 정보 없음</span>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        {student.statusDescription}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                        onClick={() => handleApproveStudent(student.userId, student.name)}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        onClick={() => handleRejectStudent(student.userId, student.name)}
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
                placeholder="학생 이름, 학교, 전화번호로 검색..."
                value={crud.searchTerm}
                onChange={(e) => {
                  crud.setSearchTerm(e.target.value);
                  setSearchTerm(e.target.value); // 승인 대기 학생용
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={crud.filterStatus}
                onChange={(e) => crud.setFilterStatus(e.target.value)}
                className="h-8 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="INQUIRY">문의</option>
                <option value="COUNSELING_SCHEDULED">상담</option>
                <option value="ENROLLED">재원</option>
                <option value="WAITING">대기</option>
                <option value="WITHDRAWN">퇴원</option>
                <option value="UNREGISTERED">미등록</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 학생 목록 */}
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

export default StudentManagement;
