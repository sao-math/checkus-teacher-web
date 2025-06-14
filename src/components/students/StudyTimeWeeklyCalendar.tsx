import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, ChevronLeft, ChevronRight, Plus, CalendarDays, CalendarIcon, Copy, Loader2, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import { StudyTimeCalendarToggle } from './StudyTimeCalendarToggle';
import { AssignedStudyTime, WeeklySchedule, ActualStudyTime } from '@/types/schedule';
import { Activity } from '@/types/activity';
import { TaskNode } from '@/types/task';
import { TaskSidebar } from '@/components/students/TaskSidebar';
import { useAutoCloseSidebar } from '@/hooks/useAutoCloseSidebar';
import { StudyTimeDayModal } from '@/components/students/StudyTimeDayModal';
import { StudyTimeEventModal } from '@/components/students/StudyTimeEventModal';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, parse, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { formatKoreanTime, formatKoreanTimeRange } from '@/utils/dateUtils';

interface StudyTimeCalendarProps {
  studentId: number;
  assignedStudyTimes: AssignedStudyTime[];
  weeklySchedule: WeeklySchedule[];
  onUpdateStudyTime: (id: number, updates: Partial<AssignedStudyTime>) => void;
  onDeleteStudyTime: (id: number) => void;
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
  onGenerateStudyTimes: (startDate: Date, days: number) => Promise<void>;
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
  weeklySchedule,
  viewMode,
  onViewModeChange,
  onGenerateStudyTimes
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState<{[key: string]: TaskNode[]}>({});

  // Automatically close AppSidebar when TaskSidebar opens or screen becomes mobile
  useAutoCloseSidebar(isSidebarOpen);

  const handleCopySchedule = async () => {
    setIsLoading(true);
    try {
      // Get study-assignable schedules
      const studyAssignableSchedules = weeklySchedule.filter(
        schedule => schedule.activity?.isStudyAssignable
      );

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
    } finally {
      setIsLoading(false);
    }
  };

  const getStudyTimesForDate = (date: Date) => {
    return assignedStudyTimes.filter(studyTime => 
      isSameDay(new Date(studyTime.startTime), date)
    );
  };

  const handleTaskDragStart = (task: TaskNode, event: React.DragEvent) => {
    // 드래그 시작 시 필요한 데이터 설정
    const dragData = {
      type: 'task',
      task
    };
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
  };

  const handleDrop = (date: Date, event: React.DragEvent) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('application/json');
    if (!data) return;

    try {
      const task = JSON.parse(data);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      // 이미 해당 날짜에 같은 할일이 있는지 확인
      const existingTasks = assignedTasks[dateKey] || [];
      const isTaskAlreadyAssigned = existingTasks.some(t => t.id === task.id);
      
      if (!isTaskAlreadyAssigned) {
        setAssignedTasks(prev => ({
          ...prev,
          [dateKey]: [...existingTasks, task]
        }));
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
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
          const studyTimes = getStudyTimesForDate(date);
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
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(date, 'd', { locale: ko })}
              </div>
              
              {/* 공부시간 섹션 */}
              <div className="mb-2">
                <div className="space-y-1">
                  {studyTimes.slice(0, 3).map((studyTime) => (
                    <div
                      key={studyTime.id}
                      className={`text-xs p-1 rounded truncate ${
                        studyTime.activity?.isStudyAssignable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {studyTime.activity?.name}
                    </div>
                  ))}
                  {studyTimes.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{studyTimes.length - 3} more
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
    const days = eachDayOfInterval({ start, end });
    
    // Get the first day of the month and calculate padding days
    const firstDayOfMonth = start.getDay();
    const paddingDays = Array(firstDayOfMonth).fill(null);
    
    // Get the last day of the month and calculate remaining days
    const lastDayOfMonth = end.getDate();
    const remainingDays = Array(6 - end.getDay()).fill(null);

    return (
      <div className="grid grid-cols-7 gap-4">
        {/* 요일 헤더 */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={index} className="text-center py-2 font-medium text-gray-700 border-b">
            {day}
          </div>
        ))}
        
        {/* 이전 달의 남은 날짜 */}
        {paddingDays.map((_, index) => (
          <div key={`padding-${index}`} className="min-h-[200px] p-2 border rounded-lg bg-gray-50" />
        ))}
        
        {/* 현재 달의 날짜 */}
        {days.map((date) => {
          const studyTimes = getStudyTimesForDate(date);
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
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(date, 'd', { locale: ko })}
              </div>
              
              {/* 공부시간 섹션 */}
              <div className="mb-2">
                <div className="space-y-1">
                  {studyTimes.slice(0, 3).map((studyTime) => (
                    <div
                      key={studyTime.id}
                      className={`text-xs p-1 rounded truncate ${
                        studyTime.activity?.isStudyAssignable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {studyTime.activity?.name}
                    </div>
                  ))}
                  {studyTimes.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{studyTimes.length - 3} more
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
        
        {/* 다음 달의 시작 날짜 */}
        {remainingDays.map((_, index) => (
          <div key={`remaining-${index}`} className="min-h-[200px] p-2 border rounded-lg bg-gray-50" />
        ))}
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
              {/* 할일 추가 버튼 */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setIsSidebarOpen(true)}
              >
                할일 추가
              </Button>
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
                className="h-8 px-3 text-xs"
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
                {getStudyTimesForDate(selectedDate).length > 0 ? (
                  getStudyTimesForDate(selectedDate).map((studyTime) => (
                    <div key={studyTime.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span>{studyTime.activity?.name}</span>
                      <div className="text-sm font-medium text-gray-900">
                        {formatKoreanTimeRange(studyTime.startTime, studyTime.endTime)}
                      </div>
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

      {/* 할일 추가 사이드바 */}
      <TaskSidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        studentId={studentId}
        onTaskDragStart={handleTaskDragStart}
      />
    </div>
  );
};
