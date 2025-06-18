import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/student';
import { studentApi } from '@/services/studentApi';
import ManagementList from '@/components/ui/ManagementList';

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'INQUIRY' | 'CONSULTATION' | 'ENROLLED' | 'WAITING' | 'WITHDRAWN' | 'UNREGISTERED' | 'all'>('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students...');
      const data = await studentApi.getStudents();
      console.log('Received student data:', data);
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INQUIRY': return 'bg-yellow-100 text-yellow-800';
      case 'CONSULTATION': return 'bg-orange-100 text-orange-800';
      case 'ENROLLED': return 'bg-green-100 text-green-800';
      case 'WAITING': return 'bg-purple-100 text-purple-800';
      case 'WITHDRAWN': return 'bg-red-100 text-red-800';
      case 'UNREGISTERED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'INQUIRY': return '문의';
      case 'CONSULTATION': return '상담';
      case 'ENROLLED': return '재원';
      case 'WAITING': return '대기';
      case 'WITHDRAWN': return '퇴원';
      case 'UNREGISTERED': return '미등록';
      default: return '알 수 없음';
    }
  };

  const getGradeText = (grade: number) => {
    if (grade >= 1 && grade <= 6) {
      return `초등학교 ${grade}학년`;
    } else if (grade >= 7 && grade <= 9) {
      return `중학교 ${grade - 6}학년`;
    } else if (grade >= 10 && grade <= 12) {
      return `고등학교 ${grade - 9}학년`;
    } else if (grade === 13) {
      return 'N수';
    } else {
      return `${grade}학년`;
    }
  };

  const getRelationshipText = (relationship: string) => {
    switch (relationship) {
      case 'father': return '아버지';
      case 'mother': return '어머니';
      case 'guardian': return '보호자';
      default: return relationship;
    }
  };

  const handleViewDetails = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  const handleEdit = (student: Student) => {
    navigate(`/students/${student.id}/edit`);
  };

  const handleDeleteStudent = async (student: Student) => {
    try {
      // TODO: Implement delete API call
      setStudents(prev => prev.filter(s => s.id !== student.id));
      toast({
        title: "학생 삭제",
        description: `${student.name} 학생이 삭제되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(student =>
    (filterStatus === 'all' || student.status === filterStatus) &&
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentPhoneNumber && student.studentPhoneNumber.includes(searchTerm)))
  );

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
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {getStatusText(value)}
        </Badge>
      )
    },
    {
      key: 'school',
      label: '학교',
      render: (value: string, student: Student) => (
        <span>{value}</span>
      )
    },
    {
      key: 'grade',
      label: '학년',
      render: (value: number, student: Student) => (
        <span>{getGradeText(value)}</span>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학생 관리</h1>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="학생 이름, 학교, 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'INQUIRY' | 'CONSULTATION' | 'ENROLLED' | 'WAITING' | 'WITHDRAWN' | 'UNREGISTERED' | 'all')}
                className="h-8 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="INQUIRY">문의</option>
                <option value="CONSULTATION">상담</option>
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
        items={filteredStudents}
        columns={columns}
        onView={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDeleteStudent}
        getDeleteConfirmation={(student: Student) => ({
          title: '학생 삭제',
          description: `${student.name} 학생을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
        })}
        emptyMessage="검색 결과가 없습니다. 다른 검색어를 시도해보세요."
      />
    </div>
  );
};

export default StudentManagement;
