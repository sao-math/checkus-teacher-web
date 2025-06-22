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
import { getGradeText } from '@/utils/gradeUtils';

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
      case '문의':
      case 'INQUIRY':
        return 'bg-yellow-100 text-yellow-800';
      case '상담예약':
      case 'CONSULTATION':
        return 'bg-blue-100 text-blue-800';
      case '재원':
      case 'ENROLLED':
        return 'bg-green-100 text-green-800';
      case '대기':
      case 'WAITING':
        return 'bg-gray-100 text-gray-800';
      case '퇴원':
      case 'WITHDRAWN':
        return 'bg-red-100 text-red-800';
      case '미등록':
      case 'UNREGISTERED':
        return 'bg-gray-200 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case '문의':
      case 'INQUIRY':
        return '문의';
      case '상담예약':
      case 'CONSULTATION':
        return '상담예약';
      case '재원':
      case 'ENROLLED':
        return '재원';
      case '대기':
      case 'WAITING':
        return '대기';
      case '퇴원':
      case 'WITHDRAWN':
        return '퇴원';
      case '미등록':
      case 'UNREGISTERED':
        return '미등록';
      default:
        return '알 수 없음';
    }
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male':
      case 'MALE':
        return '남성';
      case 'female':
      case 'FEMALE':
        return '여성';
      default:
        return '미설정';
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 기본 정보 + 학부모 정보 */}
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">기본 정보</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">사용자명</p>
                    <p className="font-medium text-gray-900">{student.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">이름</p>
                    <p className="font-medium text-gray-900">{student.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">성별</p>
                    <p className="font-medium text-gray-900">{getGenderText(student.gender)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <p className="font-medium text-gray-900">{student.phoneNumber}</p>
                  </div>
                </div>
                
                {student.discordId && (
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Discord ID</p>
                      <p className="font-medium text-gray-900">{student.discordId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 학부모 정보 */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">학부모 정보</h3>
              <div className="space-y-3">
                {guardians.length > 0 ? (
                  guardians.map((guardian) => (
                    <div key={guardian.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 rounded-full p-2">
                            <UserCircle className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{guardian.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {getRelationshipText(guardian.relationship)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <p className="text-sm text-gray-600">{guardian.phoneNumber}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                    <UserCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">등록된 학부모 정보가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 학교정보 + 반정보 */}
          <div className="space-y-6">
            {/* 학교 정보 */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">학교 정보</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <School className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">학교명</p>
                    <p className="font-medium text-gray-900">{student.school}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <GraduationCap className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">학년</p>
                    <p className="font-medium text-gray-900">{getGradeText(student.grade)}</p>
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
                    <div key={classInfo.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 rounded-full p-2">
                          <BookOpen className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{classInfo.name}</p>
                          <p className="text-sm text-gray-600">소속 반</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">할당된 반이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
