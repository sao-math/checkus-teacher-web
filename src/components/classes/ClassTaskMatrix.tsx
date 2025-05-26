import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths,
  getDaysInMonth,
  isSameMonth
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface Student {
  id: number;
  name: string;
}

interface TaskCompletion {
  studentId: number;
  date: string;
  completionRate: number;
  tasks: {
    id: number;
    title: string;
    completed: boolean;
  }[];
}

interface ClassTaskMatrixProps {
  classId: number;
}

const ClassTaskMatrix = ({ classId }: ClassTaskMatrixProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock 데이터 생성
  const mockStudents: Student[] = [
    { id: 1, name: '김민수' },
    { id: 2, name: '이지은' },
    { id: 3, name: '박준호' },
    { id: 4, name: '최서연' },
    { id: 5, name: '정은우' },
    { id: 6, name: '홍길동' },
    { id: 7, name: '신짱구' },
    { id: 8, name: '조조' },
    { id: 9, name: '김철수' },
    { id: 10, name: '이영희' },
  ];

  // 월별 날짜 생성 로직
  const getDateRange = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    let startDate: Date;
    let totalDays: number;

    if (daysInMonth === 30) {
      // 30일 월: 앞 2일, 뒤 3일
      startDate = addDays(startOfMonth(date), -2);
      totalDays = 35; // 30 + 2 + 3
    } else if (daysInMonth === 31) {
      // 31일 월: 앞 2일, 뒤 2일
      startDate = addDays(startOfMonth(date), -2);
      totalDays = 35; // 31 + 2 + 2
    } else {
      // 28일 월: 앞 3일, 뒤 3일
      startDate = addDays(startOfMonth(date), -3);
      totalDays = 34; // 28 + 3 + 3
    }

    return {
      startDate,
      dates: Array.from(
        { length: totalDays },
        (_, i) => addDays(startDate, i)
      )
    };
  };

  const { dates } = getDateRange(currentMonth);

  // Mock 할일 완료 데이터 생성
  const generateMockTaskCompletion = (studentId: number, date: string): TaskCompletion => {
    const tasks = [
      { id: 1, title: '수학 문제 풀기', completed: Math.random() > 0.3 },
      { id: 2, title: '영어 단어 암기', completed: Math.random() > 0.2 },
      { id: 3, title: '과학 실험 보고서', completed: Math.random() > 0.4 },
      { id: 4, title: '독서 감상문', completed: Math.random() > 0.5 },
    ];
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = Math.round((completedTasks / tasks.length) * 100);

    return {
      studentId,
      date,
      completionRate,
      tasks
    };
  };

  const getCompletionColor = (rate: number) => {
    if (rate === 100) return 'bg-green-500';  // 다 했을 때
    if (rate > 0) return 'bg-yellow-500';     // 일부만 했을 때
    return 'bg-red-500';                      // 아예 안했을 때
  };

  const getCompletionData = (studentId: number, date: string) => {
    return generateMockTaskCompletion(studentId, date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">학생별 할일 완수율</CardTitle>
          <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>완료</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>일부</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>미완료</span>
            </div>
          </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(currentMonth, 'yyyy년 M월', { locale: ko })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <ScrollArea className="h-[500px] w-full">
            <div className="min-w-[900px]">
              {/* 헤더 - 날짜들 */}
              <div className="flex bg-gray-50 border-b sticky top-0 z-10">
                <div className="w-16 p-2 text-xs font-medium border-r bg-white">학생명</div>
                {dates.map((date) => (
                  <div
                    key={date.toISOString()}
                    className={`w-8 p-1 text-[10px] text-center border-r bg-gray-50 ${
                      !isSameMonth(date, currentMonth) ? 'text-gray-400' : ''
                    }`}
                  >
                    <div>{format(date, 'M/d', { locale: ko })}</div>
                    <div className={`text-[9px] ${!isSameMonth(date, currentMonth) ? 'text-gray-300' : 'text-gray-500'}`}>
                      {format(date, 'E', { locale: ko })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 학생별 행 */}
              {mockStudents.map((student) => (
                <div key={student.id} className="flex border-b hover:bg-gray-50">
                  <div className="w-16 p-2 text-xs font-medium border-r bg-white sticky left-0">
                    {student.name}
                  </div>
                  {dates.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const completion = getCompletionData(student.id, dateStr);
                    return (
                      <TooltipProvider key={dateStr}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`w-8 p-1 flex items-center justify-center border-r ${
                              !isSameMonth(date, currentMonth) ? 'opacity-40' : ''
                            }`}>
                              <div
                                className={`w-3 h-3 rounded-full ${getCompletionColor(
                                  completion.completionRate
                                )} cursor-pointer hover:scale-125 transition-transform`}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-2">
                              <div className="text-sm font-medium">
                                {student.name} - {format(new Date(dateStr), 'M월 d일', { locale: ko })}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  완수율: {completion.completionRate}%
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs font-medium">할일 목록:</div>
                                {completion.tasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className={`text-xs flex items-center gap-1 ${
                                      task.completed ? 'text-green-600' : 'text-red-600'
                                    }`}
                                  >
                                    <span className="text-xs">{task.completed ? '✓' : '✗'}</span>
                                    <span>{task.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassTaskMatrix;
