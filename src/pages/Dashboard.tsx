
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, CheckSquare, TrendingUp, Calendar, Clock } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: '총 반 수',
      value: '12',
      icon: Users,
      change: '+2',
      changeType: 'positive'
    },
    {
      title: '총 학생 수',
      value: '324',
      icon: BookOpen,
      change: '+15',
      changeType: 'positive'
    },
    {
      title: '활성 할일',
      value: '1,247',
      icon: CheckSquare,
      change: '+89',
      changeType: 'positive'
    },
    {
      title: '완료율',
      value: '78%',
      icon: TrendingUp,
      change: '+5%',
      changeType: 'positive'
    }
  ];

  const recentActivities = [
    { time: '09:30', activity: '김민수 학생이 수학 과제를 완료했습니다', type: 'completion' },
    { time: '10:15', activity: '3-A반에 새로운 영어 과제가 배정되었습니다', type: 'assignment' },
    { time: '11:00', activity: '박지원 학생의 주간 학습 시간이 목표에 도달했습니다', type: 'achievement' },
    { time: '14:20', activity: '2-B반 수학 시험 결과가 업데이트되었습니다', type: 'update' },
    { time: '15:45', activity: '이소영 학생이 과학 실험 보고서를 제출했습니다', type: 'submission' }
  ];

  const upcomingTasks = [
    { subject: '수학', task: '이차함수 개념 정리', dueDate: '2024-01-25', students: 28 },
    { subject: '영어', task: '문법 연습 문제', dueDate: '2024-01-26', students: 32 },
    { subject: '과학', task: '실험 보고서 작성', dueDate: '2024-01-27', students: 25 },
    { subject: '국어', task: '문학 작품 분석', dueDate: '2024-01-28', students: 30 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-1">학생 관리 시스템 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {stat.change} 지난 주 대비
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {activity.time}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{activity.activity}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs mt-1 ${
                        activity.type === 'completion' ? 'bg-green-50 text-green-700 border-green-200' :
                        activity.type === 'assignment' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        activity.type === 'achievement' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {activity.type === 'completion' ? '완료' :
                       activity.type === 'assignment' ? '배정' :
                       activity.type === 'achievement' ? '달성' : '업데이트'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 다가오는 과제 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              다가오는 과제 마감일
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {task.subject}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">{task.task}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>마감일: {task.dueDate}</span>
                      <span>대상: {task.students}명</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    확인
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white">
              <div className="text-center">
                <Users className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">새 반 만들기</span>
              </div>
            </Button>
            <Button className="h-16 bg-green-600 hover:bg-green-700 text-white">
              <div className="text-center">
                <BookOpen className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">학생 추가</span>
              </div>
            </Button>
            <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white">
              <div className="text-center">
                <CheckSquare className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">할일 배정</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
