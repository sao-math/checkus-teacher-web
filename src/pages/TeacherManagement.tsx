import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Users, Phone, Mail, MoreVertical, Filter, School, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
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
    setTeacherToDelete(null);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {teacher.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(teacher)}>
                          <Eye className="h-4 w-4 mr-2" />
                          상세보기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTeacher(teacher)}>
                          <Edit className="h-4 w-4 mr-2" />
                          정보 수정
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog open={teacherToDelete?.id === teacher.id} onOpenChange={(open) => !open && setTeacherToDelete(null)}>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => {
                                e.preventDefault();
                                setTeacherToDelete(teacher);
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
                                {teacher.name} 선생님의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(teacher)}
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
                  <p className="text-sm text-gray-600">@{teacher.username}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(teacher.status)}>
                  {getStatusText(teacher.status)}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{teacher.phoneNumber}</span>
                </div>
                {teacher.discordId && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{teacher.discordId}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{teacher.classes.length > 0 ? teacher.classes.join(', ') : '담당 반 없음'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선생님 상세 정보 다이얼로그 */}
      <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {selectedTeacher?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedTeacher?.name}</h3>
                <p className="text-sm text-gray-500">@{selectedTeacher?.username}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              <Badge className={selectedTeacher ? getStatusColor(selectedTeacher.status) : ''}>
                {selectedTeacher ? getStatusText(selectedTeacher.status) : ''}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{selectedTeacher.phoneNumber}</span>
                </div>
                {selectedTeacher.discordId && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedTeacher.discordId}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-gray-400" />
                  <span>가입일: {selectedTeacher.createdAt}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">담당 반</h4>
                {selectedTeacher.classes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedTeacher.classes.map((cls, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">담당 반이 없습니다.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredTeachers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어를 시도해보세요</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherManagement;
