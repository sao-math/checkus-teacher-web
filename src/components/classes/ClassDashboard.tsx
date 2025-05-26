
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Award,
  CheckCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
  studentCount: number;
  teacher: string;
  schedule: string;
  status: 'active' | 'inactive';
  description?: string;
  maxStudents?: number;
}

interface ClassDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClass: Class | null;
}

export const ClassDashboard: React.FC<ClassDashboardProps> = ({
  open,
  onOpenChange,
  selectedClass,
}) => {
  if (!selectedClass) return null;

  // Mock data for demonstration
  const dashboardData = {
    attendance: {
      today: 85,
      thisWeek: 92,
      thisMonth: 88
    },
    assignments: {
      total: 12,
      completed: 8,
      pending: 3,
      overdue: 1
    },
    performance: {
      average: 78,
      highest: 95,
      lowest: 45
    },
    recentActivities: [
      { student: '김민수', activity: '수학 과제 완료', time: '10분 전', type: 'completion' },
      { student: '이지은', activity: '출석 체크', time: '30분 전', type: 'attendance' },
      { student: '박준호', activity: '시험 점수 업데이트', time: '1시간 전', type: 'grade' },
      { student: '최서연', activity: '과제 제출', time: '2시간 전', type: 'submission' }
    ],
    upcomingEvents: [
      { event: '중간고사', date: '2024-01-30', type: 'exam' },
      { event: '수학 과제 마감', date: '2024-01-25', type: 'assignment' },
      { event: '학부모 상담', date: '2024-02-01', type: 'meeting' }
    ]
  };

  const attendanceRate = Math.round((dashboardData.attendance.today / selectedClass.studentCount) * 100);
  const assignmentProgress = Math.round((dashboardData.assignments.completed / dashboardData.assignments.total) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:w-[900px] max-w-[90vw] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl">{selectedClass.name} 대시보드</SheetTitle>
              <SheetDescription className="text-base">
                담당: {selectedClass.teacher}
              </SheetDescription>
            </div>
            <Badge 
              variant={selectedClass.status === 'active' ? 'default' : 'secondary'}
              className={selectedClass.status === 'active' ? 'bg-green-100 text-green-800' : ''}
            >
              {selectedClass.status === 'active' ? '활성' : '비활성'}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* 주요 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 학생</p>
                    <p className="text-xl font-bold">{selectedClass.studentCount}명</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">오늘 출석</p>
                    <p className="text-xl font-bold">{dashboardData.attendance.today}명</p>
                    <p className="text-xs text-green-600">{attendanceRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">과제 완료</p>
                    <p className="text-xl font-bold">{dashboardData.assignments.completed}/{dashboardData.assignments.total}</p>
                    <p className="text-xs text-purple-600">{assignmentProgress}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">평균 점수</p>
                    <p className="text-xl font-bold">{dashboardData.performance.average}점</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 출석률 및 과제 진행률 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  출석 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>이번 주 출석률</span>
                    <span>{dashboardData.attendance.thisWeek}%</span>
                  </div>
                  <Progress value={dashboardData.attendance.thisWeek} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>이번 달 출석률</span>
                    <span>{dashboardData.attendance.thisMonth}%</span>
                  </div>
                  <Progress value={dashboardData.attendance.thisMonth} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  과제 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">완료</span>
                    <Badge className="bg-green-100 text-green-800">
                      {dashboardData.assignments.completed}개
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">진행중</span>
                    <Badge variant="outline">
                      {dashboardData.assignments.pending}개
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">미제출</span>
                    <Badge className="bg-red-100 text-red-800">
                      {dashboardData.assignments.overdue}개
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 최근 활동 및 예정 일정 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  최근 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.student}</p>
                        <p className="text-sm text-gray-600">{activity.activity}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          activity.type === 'completion' ? 'bg-green-50 text-green-700 border-green-200' :
                          activity.type === 'attendance' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          activity.type === 'grade' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {activity.type === 'completion' ? '과제' :
                         activity.type === 'attendance' ? '출석' :
                         activity.type === 'grade' ? '성적' : '제출'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  예정 일정
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          event.type === 'exam' ? 'bg-red-100' :
                          event.type === 'assignment' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          {event.type === 'exam' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                           event.type === 'assignment' ? <BookOpen className="h-4 w-4 text-yellow-600" /> :
                           <Calendar className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{event.event}</p>
                          <p className="text-xs text-gray-500">{event.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
