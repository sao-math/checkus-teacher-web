import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Copy, Loader2, Plus } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import { StudyTimeCalendarToggle } from './StudyTimeCalendarToggle';
import { AssignedStudyTime, WeeklySchedule, ActualStudyTime } from '@/types/schedule';
import { format, addDays, parse, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, isSameMonth, addHours } from 'date-fns';
import { TaskTree } from '@/components/tasks/TaskTree';
import { TaskNode } from '@/types/task';
import { TaskSidebar } from './TaskSidebar';
import { toast } from '@/components/ui/use-toast';

interface StudyTimeCalendarProps {
  studentId: number;
  assignedStudyTimes: AssignedStudyTime[];
  actualStudyTimes: ActualStudyTime[];
  setAssignedStudyTimes: React.Dispatch<React.SetStateAction<AssignedStudyTime[]>>;
  weeklySchedule: WeeklySchedule[];
  onUpdateStudyTime: (id: number, updates: Partial<AssignedStudyTime>) => void;
  onDeleteStudyTime: (id: number) => void;
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
  onGenerateStudyTimes: (startDate: Date, days: number) => Promise<void>;
  onAddTask: () => void;
}

// 임시 mock 데이터 (실제 데이터로 교체 필요)
const mockTasks: TaskNode[] = [
  {
    id: 1,
    title: '수학',
    typeId: 1,
    isLeaf: false,
    expanded: true,
    children: [
      {
        id: 2,
        title: '미적분',
        typeId: 1,
        parentId: 1,
        isLeaf: false,
        expanded: true,
        children: [
          { id: 3, title: '극한의 개념', typeId: 1, parentId: 2, isLeaf: true },
        ]
      }
    ]
  },
  {
    id: 4,
    title: '영어',
    typeId: 1,
    isLeaf: false,
    expanded: true,
    children: [
      { id: 5, title: '문법 연습', typeId: 1, parentId: 4, isLeaf: true },
      { id: 6, title: '단어 암기', typeId: 1, parentId: 4, isLeaf: true }
    ]
  }
];

export const StudyTimeCalendar: React.FC<StudyTimeCalendarProps> = ({
  studentId,
  assignedStudyTimes,
  actualStudyTimes,
  setAssignedStudyTimes,
  weeklySchedule,
  viewMode,
  onViewModeChange,
  onGenerateStudyTimes,
  onAddTask
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState<{[key: string]: TaskNode[]}>({});

  // Add effect to handle onAddTask prop changes
  useEffect(() => {
    if (onAddTask) {
      setIsSidebarOpen(true);
    }
  }, [onAddTask]);

  const handleCopySchedule = async () => {
    setIsLoading(true);
    try {
      // Get study-assignable schedules
      const studyAssignableSchedules = weeklySchedule.filter(schedule => {
        const isAssignable = schedule.activity?.isStudyAssignable;
        console.log('Schedule:', schedule.activityName, 'isAssignable:', isAssignable);
        return isAssignable;
      });

      if (studyAssignableSchedules.length === 0) {
        toast({
          title: "알림",
          description: "복사할 수 있는 학습 일정이 없습니다.",
          variant: "destructive",
        });
        return;
      }

      // Clear existing study times for the date range
      const start = startDate;
      const end = addDays(startDate, days - 1);
      
      // Generate study times for each day in the range
      for (let i = 0; i < days; i++) {
        const currentDate = addDays(startDate, i);
        const dayOfWeek = currentDate.getDay();

        // Find schedules for this day of week
        const daySchedules = studyAssignableSchedules.filter(
          schedule => schedule.dayOfWeek === dayOfWeek
        );

        // Create study times for each schedule
        for (const schedule of daySchedules) {
          const startTime = parse(schedule.startTime, 'HH:mm', currentDate);
          const endTime = parse(schedule.endTime, 'HH:mm', currentDate);

          const studyTime: Partial<AssignedStudyTime> = {
            studentId: studentId,
            activityId: schedule.activityId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            assignedBy: 1 // TODO: Replace with actual user ID
          };

          await onGenerateStudyTimes(currentDate, 1);
        }
      }

      toast({
        title: "일정이 복사되었습니다.",
        description: `${format(start, 'M월 d일')}부터 ${format(end, 'M월 d일')}까지의 일정이 복사되었습니다.`,
      });
    } catch (error) {
      console.error('Failed to copy schedule:', error);
      toast({
        title: "Error",
        description: "일정 복사 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStudyTimesForDate = (date: Date) => {
    const assigned = assignedStudyTimes.filter(studyTime => 
      isSameDay(new Date(studyTime.startTime), date)
    );
    const actual = actualStudyTimes.filter(studyTime =>
      isSameDay(new Date(studyTime.startTime), date)
    );
    return { assigned, actual };
  };

  const handleTaskDragStart = (task: TaskNode, event: React.DragEvent) => {
    // 드래그 시작 시 필요한 데이터 설정
    const dragData = {
      type: 'task',
      task
    };
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
  };

  const handleDrop = async (date: Date, event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      const data = event.dataTransfer.getData('application/json');
      if (!data) return;

      const { type, task } = JSON.parse(data);
      if (type !== 'task') return;

      const dateKey = format(date, 'yyyy-MM-dd');
      
      // 이미 해당 날짜에 같은 할일이 있는지 확인
      const existingTasks = assignedTasks[dateKey] || [];
      const isTaskAlreadyAssigned = existingTasks.some(t => t.id === task.id);
      
      if (!isTaskAlreadyAssigned) {
        // API를 통해 할일 할당
        const studyTime: Partial<AssignedStudyTime> = {
          studentId: studentId,
          activityId: task.id,
          startTime: date.toISOString(),
          endTime: addHours(date, 1).toISOString(), // 기본 1시간으로 설정
          assignedBy: 1 // TODO: Replace with actual user ID
        };

        await onGenerateStudyTimes(date, 1);
        
        setAssignedTasks(prev => ({
          ...prev,
          [dateKey]: [...existingTasks, task]
        }));

        toast({
          title: "할일이 할당되었습니다.",
          description: `${format(date, 'M월 d일')}에 할일이 할당되었습니다.`,
        });
      } else {
        toast({
          title: "알림",
          description: "이미 해당 날짜에 할당된 할일입니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to handle task drop:', error);
      toast({
        title: "Error",
        description: "할일 할당 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const renderWeekView = () => {
    const start = startOfWeek(startDate, { weekStartsOn: 0 });
    const end = endOfWeek(startDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="grid grid-cols-7 gap-4">
        {/* 요일 헤더 */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={index} className="text-center py-2 font-medium text-gray-700 border-b">
            {day}
          </div>
        ))}
        
        {/* 날짜 및 할당된 학습시간/할일 */}
        {days.map((date) => {
          const { assigned, actual } = getStudyTimesForDate(date);
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const dateKey = format(date, 'yyyy-MM-dd');
          const tasks = assignedTasks[dateKey] || [];
          
          return (
            <div
              key={date.toISOString()}
              className={`min-h-[200px] p-2 border rounded-lg cursor-pointer transition-all ${
                isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedDate(date)}
              onDrop={(e) => handleDrop(date, e)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(date, 'd', { locale: ko })}
              </div>
              
              {/* 공부시간 섹션 */}
              <div className="mb-2">
                <div className="space-y-1">
                  {/* 할당된 공부시간 */}
                  {assigned.slice(0, 3).map((studyTime) => (
                    <div
                      key={studyTime.id}
                      className={`text-xs p-1 rounded truncate ${
                        studyTime.activity?.isStudyAssignable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {studyTime.activityName}
                    </div>
                  ))}
                  {/* 실제 공부시간 */}
                  {actual.slice(0, 3).map((studyTime) => (
                    <div
                      key={studyTime.id}
                      className="text-xs p-1 rounded truncate bg-blue-100 text-blue-800"
                    >
                      {studyTime.studentName} (실제)
                    </div>
                  ))}
                  {(assigned.length + actual.length) > 3 && (
                    <div className="text-xs text-gray-500">
                      +{(assigned.length + actual.length) - 3} more
                    </div>
                  )}
                </div>
              </div>

              {/* 할일 섹션 */}
              <div>
                <div className="space-y-1">
                  {tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="text-xs p-1.5 rounded truncate bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                    >
                      {task.title}
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{tasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const start = startOfMonth(startDate);
    const end = endOfMonth(startDate);
    
    // Get the first day of the month and calculate padding days
    const firstDayOfMonth = start.getDay();
    const paddingDays = Array(firstDayOfMonth).fill(null).map((_, index) => {
      const dayOffset = index - firstDayOfMonth;
      return addDays(start, dayOffset);
    });
    
    // Get the last day of the month and calculate remaining days
    const lastDayOfMonth = end.getDate();
    const remainingDays = Array(6 - end.getDay()).fill(null).map((_, index) => {
      const dayOffset = lastDayOfMonth + index;
      return addDays(start, dayOffset);
    });

    // Combine all days
    const allDays = [...paddingDays, ...eachDayOfInterval({ start, end }), ...remainingDays];

    return (
      <div className="grid grid-cols-7 gap-4">
        {/* 요일 헤더 */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={index} className="text-center py-2 font-medium text-gray-700 border-b">
            {day}
          </div>
        ))}
        
        {/* 날짜 및 할당된 학습시간/할일 */}
        {allDays.map((date) => {
          const { assigned, actual } = getStudyTimesForDate(date);
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, startDate);
          const dateKey = format(date, 'yyyy-MM-dd');
          const tasks = assignedTasks[dateKey] || [];
          
          return (
            <div
              key={date.toISOString()}
              className={`min-h-[200px] p-2 border rounded-lg cursor-pointer transition-all ${
                isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
              } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                !isCurrentMonth ? 'opacity-50' : ''
              }`}
              onClick={() => setSelectedDate(date)}
              onDrop={(e) => handleDrop(date, e)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
            >
              <div className={`text-sm font-medium mb-2 ${
                isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {format(date, 'd', { locale: ko })}
              </div>
              
              {/* 공부시간 섹션 */}
              <div className="mb-2">
                <div className="space-y-1">
                  {/* 할당된 공부시간 */}
                  {assigned.slice(0, 3).map((studyTime) => (
                    <div
                      key={studyTime.id}
                      className={`text-xs p-1 rounded truncate ${
                        studyTime.activity?.isStudyAssignable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {studyTime.activityName}
                    </div>
                  ))}
                  {/* 실제 공부시간 */}
                  {actual.slice(0, 3).map((studyTime) => (
                    <div
                      key={studyTime.id}
                      className="text-xs p-1 rounded truncate bg-blue-100 text-blue-800"
                    >
                      {studyTime.studentName} (실제)
                    </div>
                  ))}
                  {(assigned.length + actual.length) > 3 && (
                    <div className="text-xs text-gray-500">
                      +{(assigned.length + actual.length) - 3} more
                    </div>
                  )}
                </div>
              </div>

              {/* 할일 섹션 */}
              <div>
                <div className="space-y-1">
                  {tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="text-xs p-1.5 rounded truncate bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                    >
                      {task.title}
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{tasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCalendar = () => {
    if (viewMode === 'week') {
      return renderWeekView();
    } else {
      return renderMonthView();
    }
  };

  return (
    <div className="relative" style={{ minHeight: '100%' }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5" />
              학습시간 달력
            </CardTitle>
            <div className="flex items-center gap-4">
              {/* 학습시간 생성 컨트롤 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">시작일</Label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => date && setStartDate(date)}
                    dateFormat="MM/dd"
                    locale={ko}
                    className="w-20 h-8 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center gap-1">
                  <Label className="text-xs">기간</Label>
                  <Input
                    type="number"
                    value={days}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (value >= 1 && value <= 365) {
                        setDays(value);
                      }
                    }}
                    min="1"
                    max="365"
                    className="w-16 h-8 px-2 py-1 text-xs"
                  />
                </div>
                
                <Button 
                  onClick={handleCopySchedule}
                  disabled={isLoading}
                  size="sm"
                  className="h-8 px-3 text-xs bg-gray-200 hover:bg-gray-300 text-gray"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      복사중
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      고정 일정 복사
                    </>
                  )}
                </Button>

                {/* 할일 추가 버튼 */}
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-3 text-xs bg-gray-200 hover:bg-gray-300 text-gray"
                  onClick={onAddTask}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  할일 추가
                </Button>
              </div>
              {/* 뷰 모드 토글 */}
              <StudyTimeCalendarToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderCalendar()}
          {selectedDate && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">
                {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}의 학습시간
              </h4>
              <div className="space-y-2">
                {getStudyTimesForDate(selectedDate).assigned.length > 0 ? (
                  getStudyTimesForDate(selectedDate).assigned.map((studyTime) => (
                    <div key={studyTime.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span>{studyTime.activityName}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(studyTime.startTime), 'HH:mm')} - {format(new Date(studyTime.endTime), 'HH:mm')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">할당된 학습시간이 없습니다.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
