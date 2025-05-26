import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Phone, 
  Mail, 
  School,
  GraduationCap,
  BookOpen,
  UserCircle
} from 'lucide-react';
import { Student } from '@/types/student';

interface StudentBasicInfoProps {
  student: Student;
  classes?: { id: number; name: string }[];
  guardians?: { id: number; name: string; phoneNumber: string; relationship: string }[];
}

export const StudentBasicInfo: React.FC<StudentBasicInfoProps> = ({ 
  student,
  classes = [],
  guardians = []
}) => {
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

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male': return '남성';
      case 'female': return '여성';
      default: return '미설정';
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Users className="h-5 w-5" />
            학생 기본 정보
          </CardTitle>
          <Badge className={getStatusColor(student.status)}>
            {getStatusText(student.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">기본 정보</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">사용자명</p>
                  <p className="font-medium">{student.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="font-medium">{student.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">전화번호</p>
                  <p className="font-medium">{student.phoneNumber}</p>
                </div>
              </div>
              {student.discordId && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Discord ID</p>
                    <p className="font-medium">{student.discordId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 학교 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">학교 정보</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <School className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">학교명</p>
                  <p className="font-medium">{student.schoolName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">학년</p>
                  <p className="font-medium">{student.grade}학년</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">성별</p>
                  <p className="font-medium">{getGenderText(student.gender)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 반 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">반 정보</h3>
            <div className="space-y-3">
              {classes.length > 0 ? (
                classes.map((classInfo) => (
                  <div key={classInfo.id} className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">반</p>
                      <p className="font-medium">{classInfo.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">할당된 반이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 학부모 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">학부모 정보</h3>
            <div className="space-y-3">
              {guardians.length > 0 ? (
                guardians.map((guardian) => (
                  <div key={guardian.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">관계</p>
                        <p className="font-medium">{getRelationshipText(guardian.relationship)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-7">
                      <div>
                        <p className="text-sm text-gray-500">이름</p>
                        <p className="font-medium">{guardian.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-7">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">전화번호</p>
                        <p className="font-medium">{guardian.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">등록된 학부모 정보가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
