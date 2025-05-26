import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  grade: number;
  class: string;
  school: string;
  phone: string;
  email: string;
  status: '문의' | '상담예약' | '재원' | '대기' | '퇴원' | '미등록';
  completionRate: number;
  lastActivity: string;
}

interface StudentDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent: Student | null;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentDetailsSheet: React.FC<StudentDetailsSheetProps> = ({
  open,
  onOpenChange,
  selectedStudent,
  onEdit,
  onDelete,
}) => {
  if (!selectedStudent) return null;

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

  // Mock data for student performance
  const performanceData = {
    assignments: {
      total: 15,
      completed: Math.floor(selectedStudent.completionRate * 15 / 100),
      pending: 3,
      overdue: 1
    },
    recentActivities: [
      { activity: '수학 과제 완료', date: '2024-01-24', type: 'completion' },
      { activity: '출석 체크', date: '2024-01-24', type: 'attendance' },
      { activity: '과제 제출', date: '2024-01-23', type: 'submission' }
    ]
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">{selectedStudent.name}</SheetTitle>
            <Badge className={getStatusColor(selectedStudent.status)}>
              {getStatusText(selectedStudent.status)}
            </Badge>
          </div>
          <SheetDescription>
            {selectedStudent.grade}학년 · {selectedStudent.class} · {selectedStudent.school}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">전화번호</p>
                  <p className="font-medium">{selectedStudent.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">이메일</p>
                  <p className="font-medium">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">마지막 활동</p>
                  <p className="font-medium">{selectedStudent.lastActivity}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 학습 현황 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">학습 현황</h3>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">전체 완료율</span>
                  <span className="text-lg font-bold text-blue-600">
                    {selectedStudent.completionRate}%
                  </span>
                </div>
                <Progress value={selectedStudent.completionRate} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">
                    {performanceData.assignments.completed}
                  </p>
                  <p className="text-xs text-green-600">완료</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-lg font-bold text-yellow-600">
                    {performanceData.assignments.pending}
                  </p>
                  <p className="text-xs text-yellow-600">진행중</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-600">
                    {performanceData.assignments.overdue}
                  </p>
                  <p className="text-xs text-red-600">미제출</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 최근 활동 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">최근 활동</h3>
            <div className="space-y-3">
              {performanceData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.activity}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      activity.type === 'completion' ? 'bg-green-50 text-green-700 border-green-200' :
                      activity.type === 'attendance' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {activity.type === 'completion' ? '과제' :
                     activity.type === 'attendance' ? '출석' : '제출'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">관리</h3>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                onEdit(selectedStudent);
                onOpenChange(false);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              학생 정보 수정
            </Button>

            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={() => {
                onDelete(selectedStudent);
                onOpenChange(false);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              학생 삭제
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
