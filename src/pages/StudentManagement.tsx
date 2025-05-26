import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, Phone, Mail, MoreVertical, Filter, School } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/student';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2 } from 'lucide-react';

const mockStudents: Student[] = [
  {
    id: 1,
    username: 'minsu123',
    name: '김민수',
    phoneNumber: '010-1234-5678',
    discordId: 'minsu#1234',
    createdAt: '2024-01-01',
    status: '재원',
    schoolId: 1,
    schoolName: '리플랜고등학교',
    grade: 3,
    gender: 'male',
    completionRate: 85
  },
  {
    id: 2,
    username: 'jiwon456',
    name: '박지원',
    phoneNumber: '010-2345-6789',
    discordId: 'jiwon#5678',
    createdAt: '2024-01-01',
    status: '상담예약',
    schoolId: 2,
    schoolName: '사오중학교',
    grade: 2,
    gender: 'female',
    completionRate: 92
  },
  {
    id: 3,
    username: 'soyoung789',
    name: '이소영',
    phoneNumber: '010-3456-7890',
    createdAt: '2024-01-01',
    status: '문의',
    schoolId: 1,
    schoolName: '리플랜고등학교',
    grade: 1,
    gender: 'female',
    completionRate: 78
  },
  {
    id: 4,
    username: 'hyunwoo012',
    name: '최현우',
    phoneNumber: '010-4567-8901',
    createdAt: '2024-01-01',
    status: '대기',
    schoolId: 1,
    schoolName: '리플랜고등학교',
    grade: 3,
    gender: 'male',
    completionRate: 45
  }
];

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'문의' | '상담예약' | '재원' | '대기' | '퇴원' | '미등록' | 'all'>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case '문의': return 'bg-yellow-100 text-yellow-800';
      case '상담예약': return 'bg-blue-100 text-blue-800';
      case '재원': return 'bg-green-100 text-green-800';
      case '대기': return 'bg-gray-100 text-gray-800';
      case '퇴원': return 'bg-red-100 text-red-800';
      case '미등록': return 'bg-gray-200 text-gray-500';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case '문의': return '문의';
      case '상담예약': return '상담예약';
      case '재원': return '재원';
      case '대기': return '대기';
      case '퇴원': return '퇴원';
      case '미등록': return '미등록';
      default: return '알 수 없음';
    }
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStudentClick = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  const handleEditStudent = (student: Student) => {
    navigate(`/students/${student.id}/edit`);
  };

  const handleDeleteStudent = (student: Student) => {
    setStudents(prev => prev.filter(s => s.id !== student.id));
    toast({
      title: "학생 삭제",
      description: `${student.name} 학생이 삭제되었습니다.`,
    });
    setStudentToDelete(null);
  };

  const filteredStudents = students.filter(student =>
    (filterStatus === 'all' || student.status === filterStatus) &&
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phoneNumber.includes(searchTerm))
  );

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
                placeholder="학생 이름, 사용자명, 학교, 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as '문의' | '상담예약' | '재원' | '대기' | '퇴원' | '미등록' | 'all')}
                className="h-8 px-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="문의">문의</option>
                <option value="상담예약">상담예약</option>
                <option value="재원">재원</option>
                <option value="대기">대기</option>
                <option value="퇴원">퇴원</option>
                <option value="미등록">미등록</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 학생 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleStudentClick(student)}>
                          <Eye className="h-4 w-4 mr-2" />
                          상세보기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                          <Edit className="h-4 w-4 mr-2" />
                          정보 수정
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog open={studentToDelete?.id === student.id} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => {
                                e.preventDefault();
                                setStudentToDelete(student);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {student.name} 학생의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteStudent(student)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-gray-600">{student.grade}학년 · @{student.username}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(student.status)}>
                  {getStatusText(student.status)}
                </Badge>
                <span className={`text-sm font-medium ${getCompletionRateColor(student.completionRate)}`}>
                  완료율 {student.completionRate}%
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  <span>{student.schoolName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{student.phoneNumber}</span>
                </div>
                {student.discordId && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{student.discordId}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentManagement;
