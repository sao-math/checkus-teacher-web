import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Mail, Users, School, Edit } from 'lucide-react';

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

// Mock data - 실제로는 API에서 가져와야 함
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

const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isProfile = id === 'profile';

  // 실제로는 API에서 가져와야 함
  const teacher = mockTeachers.find(t => t.id === Number(id)) || mockTeachers[0];

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

  const handleBack = () => {
    navigate('/teachers');
  };

  const handleEdit = () => {
    navigate(`/teachers/${id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isProfile ? '내 계정 관리' : '선생님 정보'}
                </h1>
                <p className="text-sm text-gray-500">
                  {teacher.name}의 정보를 확인하고 관리할 수 있습니다
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              정보 수정
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 기본 정보 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {teacher.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{teacher.name}</h2>
                  <p className="text-sm text-gray-500">@{teacher.username}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(teacher.status)}>
                  {getStatusText(teacher.status)}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{teacher.phoneNumber}</span>
                </div>
                {teacher.discordId && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{teacher.discordId}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <School className="h-4 w-4" />
                  <span>가입일: {teacher.createdAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 담당 반 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                담당 반
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.classes.length > 0 ? (
                <div className="space-y-2">
                  {teacher.classes.map((cls, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate(`/classes/${index + 1}`)}
                    >
                      <p className="font-medium text-gray-900">{cls}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">담당 반이 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails; 