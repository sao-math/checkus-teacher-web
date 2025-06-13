import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Copy, Loader2, Plus, Trash2 } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { isAxiosError } from 'axios';

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
  onDeleteStudyTime
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

  const form = useForm({
    defaultValues: {
      title: '',
      activityId: '',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:00',
    },
  });

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

          // Create new Date objects with the current date and parsed time
          const startTime = new Date(currentDate);
          startTime.setHours(startHours, startMinutes, 0, 0);

          const endTime = new Date(currentDate);
          endTime.setHours(endHours, endMinutes, 0, 0);

          // Create study time object
          const studyTime: Partial<AssignedStudyTime> = {
            studentId: studentId,
            activityId: schedule.activityId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
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

        await onGenerateStudyTimes(date, 1, studyTime);
        
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
    if (!data.date || !data.startTime || !data.endTime || !data.activityId) return;

    try {
      setIsLoading(true);
      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);

      const startTime = new Date(data.date);
      startTime.setHours(startHours, startMinutes, 0, 0);

      const endTime = new Date(data.date);
      endTime.setHours(endHours, endMinutes, 0, 0);

      const studyTime: Partial<AssignedStudyTime> = {
        studentId: studentId,
        activityId: Number(data.activityId),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        assignedBy: 1, // TODO: Replace with actual user ID
        title: data.title,
        activityName: activities.find(a => a.id === Number(data.activityId))?.name
      };

      await onGenerateStudyTimes(startTime, 1, studyTime);
      setShowManualModal(false);
      form.reset();
    } catch (error: any) {
      let msg = '공부시간 추가 중 오류가 발생했습니다.';
      if (isAxiosError?.(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudyTimeDragStart = (studyTime: AssignedStudyTime, event: React.DragEvent) => {
    event.dataTransfer.setData('application/json', JSON.stringify({ type: 'studyTime', studyTime }));
  };

  const handleStudyTimeDrop = async (date: Date, event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const data = event.dataTransfer.getData('application/json');
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
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
          toast({ title: '이동 완료', description: '공부시간이 이동되었습니다.' });
        } catch (error: any) {
          let msg = '공부시간 이동 중 오류가 발생했습니다.';
          if (isAxiosError?.(error) && error.response?.data?.message) {
            msg = error.response.data.message;
          }
          toast({
            title: 'Error',
            description: msg,
            variant: 'destructive',
          });
        }
        return;
      }
      // 기존 할일 드롭 처리
      if (parsed.type === 'task') {
        // ... 기존 코드 ...
      }
    } catch (e) {}
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
              onClick={() => setSelectedDate(date)}
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
                    >
                      <div className="font-medium">{studyTime.title}</div>
                      <div className="text-[10px] text-green-600">{studyTime.activityName}</div>
                      <div className="text-[10px] text-green-600">
                        {format(new Date(studyTime.startTime), 'HH:mm')} - {format(new Date(studyTime.endTime), 'HH:mm')}
                      </div>
                    </div>
                  ))}
                  {/* 실제 공부시간 */}
                  {actual.slice(0, 3).map((studyTime) => (
                    <div
                      key={studyTime.id}
                      className="text-xs p-1 rounded truncate bg-blue-100 text-blue-800"
                    >
                      <div className="font-medium">{studyTime.studentName} (실제)</div>
                      <div className="text-[10px] text-blue-600">
                        {format(new Date(studyTime.startTime), 'HH:mm')} - {format(new Date(studyTime.endTime), 'HH:mm')}
                      </div>
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
                    >
                      <div className="font-medium">{studyTime.title}</div>
                      <div className="text-[10px] text-green-600">{studyTime.activityName}</div>
                      <div className="text-[10px] text-green-600">
                        {format(new Date(studyTime.startTime), 'HH:mm')} - {format(new Date(studyTime.endTime), 'HH:mm')}
                      </div>
                    </div>
                  ))}
                  {/* 실제 공부시간 */}
                  {actual.slice(0, 3).map((studyTime) => (
                    <div
                      key={studyTime.id}
                      className="text-xs p-1 rounded truncate bg-blue-100 text-blue-800"
                    >
                      <div className="font-medium">{studyTime.studentName} (실제)</div>
                      <div className="text-[10px] text-blue-600">
                        {format(new Date(studyTime.startTime), 'HH:mm')} - {format(new Date(studyTime.endTime), 'HH:mm')}
                      </div>
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="활동을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activities.map((activity) => (
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
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작 시간</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>종료 시간</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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

      {/* 휴지통 영역 추가 (컴포넌트 하단) */}
      <div
        onDrop={handleTrashDrop}
        onDragOver={e => e.preventDefault()}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-24 h-24 bg-red-100 border-2 border-red-300 rounded-full shadow-lg z-50"
      >
        <Trash2 className="w-10 h-10 text-red-500" />
      </div>
    </div>
  );
};
