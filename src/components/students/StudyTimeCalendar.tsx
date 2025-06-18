import React, { useState, useEffect } from 'react';
import { format, isSameDay, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, addHours, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Plus, CalendarDays, CalendarIcon, Copy, Loader2, Trash2 } from 'lucide-react';
import { WeeklySchedule, AssignedStudyTime, ActualStudyTime } from '@/types/schedule';
import { Activity } from '@/types/activity';
import { TaskNode } from '@/types/task';
import { TaskSidebar } from '@/components/students/TaskSidebar';
import { useAutoCloseSidebar } from '@/hooks/useAutoCloseSidebar';
import { StudyTimeDayModal } from '@/components/students/StudyTimeDayModal';
import { StudyTimeEventModal } from '@/components/students/StudyTimeEventModal';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { isAxiosError } from 'axios';
import { studentApi } from '@/services/studentApi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { StudyTimeCalendarToggle } from './StudyTimeCalendarToggle';
import { TaskTree } from '@/components/tasks/TaskTree';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { formatKoreanTime, formatKoreanTimeRange, formatLocalDateTime } from '@/utils/dateUtils';
import { Progress, TimelineSegment } from '@/components/ui/progress';

// Timeline calculation helper function
const calculateTimeline = (assigned: AssignedStudyTime, actuals: ActualStudyTime[]): TimelineSegment[] => {
  const assignedStart = new Date(assigned.startTime).getTime();
  const assignedEnd = new Date(assigned.endTime).getTime();
  const totalDuration = assignedEnd - assignedStart;
  
  const timeline: TimelineSegment[] = [];
  
  actuals.forEach(actual => {
    // Skip if endTime is null (ongoing session)
    if (!actual.endTime) return;
    
    const actualStart = new Date(actual.startTime).getTime();
    const actualEnd = new Date(actual.endTime).getTime();
    
    const clampedStart = Math.max(actualStart, assignedStart);
    const clampedEnd = Math.min(actualEnd, assignedEnd);
    
    if (clampedStart < clampedEnd) {
      const startPercent = ((clampedStart - assignedStart) / totalDuration) * 100;
      const endPercent = ((clampedEnd - assignedStart) / totalDuration) * 100;
      
      timeline.push({
        start: Math.round(startPercent),
        end: Math.round(endPercent),
        status: "connected",
        source: actual.source
      });
    }
  });
  
  timeline.sort((a, b) => a.start - b.start);
  
  const fullTimeline: TimelineSegment[] = [];
  let currentPos = 0;
  
  timeline.forEach(segment => {
    if (currentPos < segment.start) {
      fullTimeline.push({
        start: currentPos,
        end: segment.start,
        status: "not-connected"
      });
    }
    fullTimeline.push(segment);
    currentPos = segment.end;
  });
  
  if (currentPos < 100) {
    fullTimeline.push({
      start: currentPos,
      end: 100,
      status: "not-connected"
    });
  }
  
  return fullTimeline;
};

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
  onGenerateStudyTimes: (startDate: Date, days: number, studyTime: Partial<AssignedStudyTime>) => Promise<void>;
  onAddTask: () => void;
  activities: { id: number; name: string }[];
  onPeriodChange?: (startDate: Date, endDate: Date) => void;
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
  onAddTask,
  activities,
  onUpdateStudyTime,
  onDeleteStudyTime,
  onPeriodChange
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState<{[key: string]: TaskNode[]}>({});
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualActivityId, setManualActivityId] = useState<number | null>(null);
  const [manualStartTime, setManualStartTime] = useState<Date | null>(null);
  const [manualEndTime, setManualEndTime] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDateActuals, setSelectedDateActuals] = useState<{[assignedId: number]: ActualStudyTime[]}>({});
  const [studyTimeActivities, setStudyTimeActivities] = useState<Activity[]>([]);

  const form = useForm({
    defaultValues: {
      title: '',
      activityId: '',
      date: new Date(),
      startTime: '09:00',
      duration: 60, // duration in minutes instead of end time
    },
  });

  // Fetch study-assignable activities for study time assignment
  const fetchStudyTimeActivities = async () => {
    try {
      const data = await studentApi.getActivities(); // This calls /study-time/activities
      setStudyTimeActivities(data);
    } catch (error) {
      console.error('Failed to fetch study time activities:', error);
    }
  };

  // Add effect to handle onAddTask prop changes
  useEffect(() => {
    if (onAddTask) {
      setIsSidebarOpen(true);
    }
  }, [onAddTask]);

  // Handle view mode change and trigger data fetch
  const handleViewModeChange = (mode: 'week' | 'month') => {
    onViewModeChange(mode);
    // Trigger data fetch for new view mode after a brief delay to ensure mode is updated
    setTimeout(() => {
      if (onPeriodChange) {
        const { start, end } = getPeriodDates(startDate);
        onPeriodChange(start, end);
      }
    }, 0);
  };

  // Navigation functions
  const getPeriodDates = (date: Date) => {
    if (viewMode === 'week') {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = endOfWeek(date, { weekStartsOn: 0 });
      return { start, end };
    } else {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      return { start, end };
    }
  };

  const updatePeriodAndFetch = (newDate: Date) => {
    setStartDate(newDate);
    if (onPeriodChange) {
      const { start, end } = getPeriodDates(newDate);
      onPeriodChange(start, end);
    }
  };

  const handlePreviousPeriod = () => {
    if (viewMode === 'week') {
      const newDate = addDays(startDate, -7);
      updatePeriodAndFetch(newDate);
    } else {
      const newDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
      updatePeriodAndFetch(newDate);
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'week') {
      const newDate = addDays(startDate, 7);
      updatePeriodAndFetch(newDate);
    } else {
      const newDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
      updatePeriodAndFetch(newDate);
    }
  };

  const handleToday = () => {
    const today = new Date();
    updatePeriodAndFetch(today);
  };

  const getCurrentPeriodText = () => {
    if (viewMode === 'week') {
      const endDate = addDays(startDate, 6);
      return `${format(startDate, 'M월 d일')} - ${format(endDate, 'M월 d일')}`;
    } else {
      return format(startDate, 'yyyy년 M월');
    }
  };

  const handleCopySchedule = async () => {
    setIsLoading(true);
    try {
      // Get study-assignable schedules
      const studyAssignableSchedules = weeklySchedule.filter(
        schedule => schedule.isStudyAssignable
      );

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
          // Parse the time strings (HH:mm:ss format)
          const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
          const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);

          // Create study time object
          const studyTime: Partial<AssignedStudyTime> = {
            studentId: studentId,
            activityId: schedule.activityId,
            startTime: formatLocalDateTime(currentDate, startHours, startMinutes),
            endTime: formatLocalDateTime(currentDate, endHours, endMinutes),
            assignedBy: 1, // TODO: Replace with actual user ID
            title: schedule.title,
            activityName: schedule.activityName
          };

          // Generate study time with the created study time information
          await onGenerateStudyTimes(currentDate, 1, studyTime);
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

  const fetchActualStudyTimesForDate = async (date: Date) => {
    const { assigned } = getStudyTimesForDate(date);
    const actualsMap: {[assignedId: number]: ActualStudyTime[]} = {};
    
    try {
      // Fetch actual study times for each assigned study time
      const promises = assigned.map(async (assignedStudyTime) => {
        try {
          const actuals = await studentApi.getActualStudyTimesByAssigned(assignedStudyTime.id);
          actualsMap[assignedStudyTime.id] = actuals;
        } catch (error) {
          console.error(`Failed to fetch actuals for assigned study time ${assignedStudyTime.id}:`, error);
          actualsMap[assignedStudyTime.id] = [];
        }
      });
      
      await Promise.all(promises);
      setSelectedDateActuals(actualsMap);
    } catch (error) {
      console.error('Failed to fetch actual study times:', error);
      setSelectedDateActuals({});
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    fetchActualStudyTimesForDate(date);
  };

  const handleTaskDragStart = (task: TaskNode, event: React.DragEvent) => {
    // 드래그 시작 시 필요한 데이터 설정
    const dragData = {
      type: 'task',
      task
    };
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleManualAdd = async () => {
    if (!manualTitle || !manualActivityId || !manualStartTime || !manualEndTime) return;
    setIsLoading(true);
    try {
      await onGenerateStudyTimes(manualStartTime, 1, {
        studentId,
        title: manualTitle,
        activityId: manualActivityId,
        startTime: manualStartTime.toISOString(),
        endTime: manualEndTime.toISOString(),
      });
      setShowManualModal(false);
      setManualTitle('');
      setManualActivityId(null);
      setManualStartTime(null);
      setManualEndTime(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!data.date || !data.startTime || !data.duration || !data.activityId) return;

    try {
      setIsLoading(true);
      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      
      // Calculate end time from start time + duration
      const startTimeMinutes = startHours * 60 + startMinutes;
      const endTimeMinutes = startTimeMinutes + data.duration;
      const endHours = Math.floor(endTimeMinutes / 60);
      const endMins = endTimeMinutes % 60;

      const studyTime: Partial<AssignedStudyTime> = {
        studentId: studentId,
        activityId: Number(data.activityId),
        startTime: formatLocalDateTime(data.date, startHours, startMinutes),
        endTime: formatLocalDateTime(data.date, endHours, endMins),
        assignedBy: 1, // TODO: Replace with actual user ID
        title: data.title,
        activityName: studyTimeActivities.find(a => a.id === Number(data.activityId))?.name
      };

      await onGenerateStudyTimes(data.date, 1, studyTime);
      setShowManualModal(false);
      form.reset();
    } catch (error: any) {
      console.error('Study time assignment error:', error);
      
      // Extract error message from server response
      let errorMessage = 'An error occurred while adding study time.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Study Time Assignment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudyTimeDragStart = (studyTime: AssignedStudyTime, event: React.DragEvent) => {
    event.dataTransfer.setData('application/json', JSON.stringify({ type: 'studyTime', studyTime }));
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleStudyTimeDrop = async (date: Date, event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const data = event.dataTransfer.getData('application/json');
    if (!data) return;
    
    try {
      const parsed = JSON.parse(data);
      
      // 공부시간 드롭 처리
      if (parsed.type === 'studyTime') {
        const { studyTime } = parsed;
        // 날짜만 변경해서 업데이트
        const start = new Date(date);
        const end = new Date(date);
        const oldStart = new Date(studyTime.startTime);
        const oldEnd = new Date(studyTime.endTime);
        start.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
        end.setHours(oldEnd.getHours(), oldEnd.getMinutes(), 0, 0);
        
        try {
          await onUpdateStudyTime(studyTime.id, {
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          });
          // Update local state for immediate UI reflection
          setAssignedStudyTimes(prev => 
            prev.map(item => 
              item.id === studyTime.id 
                ? { ...item, startTime: start.toISOString(), endTime: end.toISOString() }
                : item
            )
          );
        } catch (error: any) {
          console.error('Study time update error:', error);
          
          // Extract error message from server response
          let errorMessage = 'An error occurred while moving study time.';
          
          if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          toast({
            title: 'Study Time Update Failed',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        return;
      }
      
      // 할일 드롭 처리
      if (parsed.type === 'task') {
        const { task } = parsed;
        
        // 아직 할일 추가 API가 구현되지 않았음을 알림
        toast({
          title: "기능 준비 중",
          description: "할일 추가 기능은 아직 구현되지 않았습니다. 서버 API 구현 후 사용 가능합니다.",
          variant: "default",
        });
        return;
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
      toast({
        title: "Error",
        description: "드롭 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleTrashDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('application/json');
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'studyTime') {
        const { studyTime } = parsed;
        await onDeleteStudyTime(studyTime.id);
        toast({ title: '삭제 완료', description: '공부시간이 삭제되었습니다.' });
      }
    } catch (e) {}
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
              onClick={() => handleDateClick(date)}
              onDrop={(e) => handleStudyTimeDrop(date, e)}
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
                      className="text-xs p-1 rounded truncate bg-green-100 text-green-800 cursor-move"
                      draggable
                      onDragStart={e => handleStudyTimeDragStart(studyTime, e)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="font-medium">{studyTime.title}</div>
                      <div className="text-[10px] text-green-600">{studyTime.activityName}</div>
                      <div className="text-[10px] text-green-600">
                        {formatKoreanTimeRange(studyTime.startTime, studyTime.endTime)}
                      </div>
                    </div>
                  ))}
                  {/* 추가 자습 (assignedStudyTimeId가 null인 경우만) */}
                  {actual.filter(studyTime => studyTime.assignedStudyTimeId === null).slice(0, 3).map((studyTime) => (
                    <div
                      key={studyTime.id}
                      className="text-xs p-1 rounded truncate bg-purple-100 text-purple-800"
                    >
                      <div className="font-medium">추가 자습</div>
                      <div className="text-[10px] text-purple-600">
                        {formatKoreanTimeRange(studyTime.startTime, studyTime.endTime)}
                      </div>
                    </div>
                  ))}
                  {(assigned.length + actual.filter(studyTime => studyTime.assignedStudyTimeId === null).length) > 3 && (
                    <div className="text-xs text-gray-500">
                      +{(assigned.length + actual.filter(studyTime => studyTime.assignedStudyTimeId === null).length) - 3} more
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
              onClick={() => handleDateClick(date)}
              onDrop={(e) => handleStudyTimeDrop(date, e)}
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
                      className="text-xs p-1 rounded truncate bg-green-100 text-green-800 cursor-move"
                      draggable
                      onDragStart={e => handleStudyTimeDragStart(studyTime, e)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="font-medium">{studyTime.title}</div>
                      <div className="text-[10px] text-green-600">{studyTime.activityName}</div>
                      <div className="text-[10px] text-green-600">
                        {formatKoreanTimeRange(studyTime.startTime, studyTime.endTime)}
                      </div>
                    </div>
                  ))}
                  {/* 추가 자습 (assignedStudyTimeId가 null인 경우만) */}
                  {actual.filter(studyTime => studyTime.assignedStudyTimeId === null).slice(0, 3).map((studyTime) => (
                    <div
                      key={studyTime.id}
                      className="text-xs p-1 rounded truncate bg-purple-100 text-purple-800"
                    >
                      <div className="font-medium">추가 자습</div>
                      <div className="text-[10px] text-purple-600">
                        {formatKoreanTimeRange(studyTime.startTime, studyTime.endTime)}
                      </div>
                    </div>
                  ))}
                  {(assigned.length + actual.filter(studyTime => studyTime.assignedStudyTimeId === null).length) > 3 && (
                    <div className="text-xs text-gray-500">
                      +{(assigned.length + actual.filter(studyTime => studyTime.assignedStudyTimeId === null).length) - 3} more
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
              {/* 뷰 모드 토글 */}
              <StudyTimeCalendarToggle
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
              />
            </div>
          </div>
          
          {/* Navigation and Controls */}
          <div className="flex items-center justify-between pt-4">
            {/* Period Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPeriod}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="px-4 py-1 text-sm font-medium min-w-[140px] text-center">
                  {getCurrentPeriodText()}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPeriod}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="h-8 px-3 text-xs ml-2"
                >
                  오늘
                </Button>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2">
              {/* 학습시간 생성 컨트롤 */}
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

              {/* 직접 공부시간 추가 버튼 */}
              <Button
                variant="default"
                size="sm"
                className="h-8 px-3 text-xs bg-gray-200 hover:bg-gray-300 text-gray"
                onClick={() => setShowManualModal(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                공부시간 직접 추가
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
          </div>
        </CardHeader>
        <CardContent>
          {renderCalendar()}
          {selectedDate && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-4">
                {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}의 학습시간
              </h4>
              <div className="space-y-4">
                {getStudyTimesForDate(selectedDate).assigned.length > 0 ? (
                  getStudyTimesForDate(selectedDate).assigned.map((studyTime) => {
                    const actuals = selectedDateActuals[studyTime.id] || [];
                    const totalConnectedMinutes = actuals.reduce((total, actual) => {
                      if (actual.endTime) {
                        const duration = new Date(actual.endTime).getTime() - new Date(actual.startTime).getTime();
                        return total + Math.round(duration / (1000 * 60));
                      }
                      return total;
                    }, 0);
                    
                    const assignedDuration = new Date(studyTime.endTime).getTime() - new Date(studyTime.startTime).getTime();
                    const assignedMinutes = Math.round(assignedDuration / (1000 * 60));
                    const progressPercent = assignedMinutes > 0 ? Math.round((totalConnectedMinutes / assignedMinutes) * 100) : 0;
                    
                    // Calculate timeline for progress bar
                    const timeline = calculateTimeline(studyTime, actuals);
                    
                    return (
                      <div key={studyTime.id} className="bg-white rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900">{studyTime.title || studyTime.activityName}</h5>
                            <p className="text-sm text-gray-600">{studyTime.activityName}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatKoreanTimeRange(studyTime.startTime, studyTime.endTime)}
                            </div>
                            <div className="text-xs text-gray-500">
                              배정: {assignedMinutes}분 | 접속: {totalConnectedMinutes}분 ({Math.min(progressPercent, 100)}%)
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress bar with timeline */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <div className="flex gap-3">
                              <span className="flex items-center">
                                <span className="h-2 w-2 bg-emerald-500 inline-block rounded-full mr-1"></span>
                                접속
                              </span>
                              <span className="flex items-center">
                                <span className="h-2 w-2 bg-gray-200 inline-block rounded-full mr-1"></span>
                                미접속
                              </span>
                            </div>
                            <span className="text-emerald-600 font-medium">
                              총 {totalConnectedMinutes}분 접속 ({Math.min(progressPercent, 100)}%)
                            </span>
                          </div>
                          
                          <Progress segments={timeline} className="h-3" />
                          
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{formatKoreanTime(studyTime.startTime)}</span>
                            <span>{formatKoreanTime(studyTime.endTime)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">할당된 학습시간이 없습니다.</p>
                )}
                
                {/* 추가 자습 섹션 */}
                {getStudyTimesForDate(selectedDate).actual.filter(studyTime => studyTime.assignedStudyTimeId === null).length > 0 && (
                  <div className="bg-white rounded-lg border p-4">
                    <h5 className="font-medium text-gray-900 mb-3">추가 자습</h5>
                    <div className="space-y-2">
                      {getStudyTimesForDate(selectedDate).actual.filter(studyTime => studyTime.assignedStudyTimeId === null).map((actual) => (
                        <div key={actual.id} className="flex items-center justify-between p-2 bg-purple-50 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              actual.source === 'discord' ? 'bg-indigo-500' : 
                              actual.source === 'zoom' ? 'bg-blue-500' : 'bg-gray-500'
                            }`}></div>
                            <span className="capitalize text-gray-700">{actual.source}</span>
                          </div>
                          <div className="text-gray-600">
                            {formatKoreanTime(actual.startTime)} - {
                              actual.endTime ? formatKoreanTime(actual.endTime) : '진행중'
                            }
                            {actual.endTime && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({Math.round((new Date(actual.endTime).getTime() - new Date(actual.startTime).getTime()) / (1000 * 60))}분)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 직접 공부시간 추가 모달 */}
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>직접 공부시간 추가</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>일정 이름</FormLabel>
                    <FormControl>
                      <Input placeholder="일정 이름을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>활동</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      onOpenChange={(open) => { 
                        if (open) fetchStudyTimeActivities(); 
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="활동을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {studyTimeActivities.map((activity) => (
                          <SelectItem key={activity.id} value={activity.id.toString()}>
                            {activity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>날짜</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DatePicker
                          selected={field.value}
                          onChange={(date: Date | null) => field.onChange(date)}
                          dateFormat="yyyy-MM-dd"
                          locale={ko}
                          placeholderText="날짜를 선택하세요"
                          customInput={<Input className="pr-10" />}
                          className="w-full"
                        />
                        <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Quick Templates */}
              <div className="space-y-2">
                <FormLabel className="text-sm font-medium">Quick Templates</FormLabel>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: '30min Study', startTime: '14:00', endTime: '14:30' },
                    { label: '1hr Study', startTime: '14:00', endTime: '15:00' },
                    { label: 'Evening 2hr', startTime: '19:00', endTime: '21:00' },
                    { label: 'Morning 1hr', startTime: '09:00', endTime: '10:00' }
                  ].map(template => (
                    <button
                      key={template.label}
                      type="button"
                      onClick={() => {
                        form.setValue('startTime', template.startTime);
                        form.setValue('endTime', template.endTime);
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded transition-colors"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        placeholder="09:00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input 
                          type="number" 
                          {...field}
                          min="15"
                          max="480"
                          step="15"
                          placeholder="60"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                        />
                        {/* Duration presets */}
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { label: '30min', value: 30 },
                            { label: '1hr', value: 60 },
                            { label: '1.5hr', value: 90 },
                            { label: '2hr', value: 120 },
                            { label: '3hr', value: 180 }
                          ].map(preset => (
                            <button
                              key={preset.value}
                              type="button"
                              onClick={() => form.setValue('duration', preset.value)}
                              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        {/* Show calculated end time */}
                        {(() => {
                          const startTime = form.watch('startTime');
                          const duration = form.watch('duration');
                          if (startTime && duration) {
                            const [startHours, startMinutes] = startTime.split(':').map(Number);
                            const startTotalMinutes = startHours * 60 + startMinutes;
                            const endTotalMinutes = startTotalMinutes + duration;
                            const endHours = Math.floor(endTotalMinutes / 60);
                            const endMins = endTotalMinutes % 60;
                            const endTimeString = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
                            
                            return (
                              <div className="text-xs text-green-600 flex items-center">
                                ✓ End time: {endTimeString} ({duration} minutes)
                              </div>
                            );
                          }
                          return (
                            <div className="text-xs text-gray-500">
                              💡 Select start time and duration
                            </div>
                          );
                        })()}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowManualModal(false)}>
                  취소
                </Button>
                <Button type="submit" disabled={isLoading}>
                  추가
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 휴지통 영역 - 드래그 중일 때만 표시 */}
      {isDragging && (
        <div
          onDrop={handleTrashDrop}
          onDragOver={e => e.preventDefault()}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-24 h-24 bg-red-100 border-2 border-red-300 rounded-full shadow-lg z-50 animate-bounce"
        >
          <Trash2 className="w-10 h-10 text-red-500" />
        </div>
      )}
    </div>
  );
};
