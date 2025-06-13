import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths, eachWeekOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TaskSidebar } from './TaskSidebar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarEventList } from './CalendarEventList';
import { useToast } from '@/hooks/use-toast';
import { useAutoCloseSidebar } from '@/hooks/useAutoCloseSidebar';

interface StudentCalendarViewProps {
  studentId: number;
}

interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
  type: 'assigned' | 'actual';
  startTime: string;
  endTime: string;
  status?: 'completed' | 'pending' | 'overdue';
}

// Mock data
const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    date: new Date(2024, 0, 24),
    title: '수학 과제',
    type: 'assigned',
    startTime: '14:00',
    endTime: '16:00',
    status: 'completed'
  },
  {
    id: 2,
    date: new Date(2024, 0, 25),
    title: '영어 독해',
    type: 'assigned',
    startTime: '10:00',
    endTime: '12:00',
    status: 'pending'
  },
  {
    id: 3,
    date: new Date(2024, 0, 24),
    title: '실제 공부시간',
    type: 'actual',
    startTime: '14:30',
    endTime: '15:45'
  }
];

export const StudentCalendarView: React.FC<StudentCalendarViewProps> = ({ studentId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [showTaskSidebar, setShowTaskSidebar] = useState(false);
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const { toast } = useToast();

  // Automatically close AppSidebar when TaskSidebar opens or screen becomes mobile
  useAutoCloseSidebar(showTaskSidebar);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const navigatePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const getDateRange = () => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(start, 'M월 d일', { locale: ko })} - ${format(end, 'M월 d일', { locale: ko })}`;
    } else {
      return format(currentDate, 'yyyy년 M월', { locale: ko });
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setTargetDate(date);
    console.log('Drag over date:', format(date, 'yyyy-MM-dd'));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setTargetDate(null);
    }
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    console.log('Drop event triggered on date:', format(date, 'yyyy-MM-dd'));
    
    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'));
      console.log('Dropped task data:', taskData);
      
      if (taskData && taskData.title) {
        const newEvent: CalendarEvent = {
          id: events.length + 1,
          date: date,
          title: taskData.title,
          type: 'assigned',
          startTime: '09:00',
          endTime: '10:00',
          status: 'pending'
        };

        setEvents(prev => [...prev, newEvent]);
        
        toast({
          title: "할일이 배정되었습니다!",
          description: `${taskData.title}이(가) ${format(date, 'M월 d일', { locale: ko })}에 추가되었습니다.`,
        });
      }
    } catch (error) {
      console.error('Failed to parse dropped task data:', error);
    }
    
    setTargetDate(null);
    setDraggedTask(null);
  };

  const handleTaskDragStart = (task: any) => {
    console.log('Task drag started:', task);
    setDraggedTask(task);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="grid grid-cols-7 gap-4">
        {/* 요일 헤더 */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={index} className="text-center py-2 font-medium text-gray-700 border-b">
            {day}
          </div>
        ))}
        
        {/* 날짜 및 이벤트 */}
        {weekDays.map((date) => {
          const dayEvents = getEventsForDate(date);
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isDragTarget = targetDate && isSameDay(date, targetDate);
          
          return (
            <div
              key={date.toISOString()}
              className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
              } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                isDragTarget ? 'bg-green-50 border-green-300 border-dashed ring-2 ring-green-400 scale-105' : ''
              }`}
              onClick={() => setSelectedDate(date)}
              onDragOver={(e) => handleDragOver(e, date)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, date)}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(date, 'd', { locale: ko })}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate ${
                      event.type === 'assigned' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
              {isDragTarget && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-100 bg-opacity-75 rounded-lg">
                  <span className="text-green-800 font-medium text-sm">여기에 드롭하세요!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="w-full">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentDate}
          onMonthChange={setCurrentDate}
          modifiers={{
            hasEvents: (date) => getEventsForDate(date).length > 0,
            dragTarget: (date) => targetDate && isSameDay(date, targetDate)
          }}
          modifiersStyles={{
            hasEvents: {
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              fontWeight: 'bold'
            },
            dragTarget: {
              backgroundColor: '#dcfce7',
              border: '2px dashed #16a34a',
              transform: 'scale(1.05)'
            }
          }}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
            month: "space-y-4 w-full",
            table: "w-full border-collapse",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-sm text-center py-3",
            row: "flex w-full mt-2",
            cell: "flex-1 text-center text-sm p-0 relative min-h-[60px] border border-gray-100",
            day: "h-full w-full p-2 font-normal hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex flex-col items-center justify-start transition-all",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground font-semibold",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
          }}
          components={{
            Day: ({ date, ...dayProps }) => (
              <div
                {...dayProps}
                onDragOver={(e) => handleDragOver(e, date)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, date)}
                className={`relative w-full h-full flex flex-col items-center justify-start p-2 ${
                  targetDate && isSameDay(date, targetDate) ? 'bg-green-100 scale-105 border-2 border-dashed border-green-400' : ''
                }`}
              >
                <span>{date.getDate()}</span>
                {getEventsForDate(date).length > 0 && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                )}
                {targetDate && isSameDay(date, targetDate) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-200 bg-opacity-50 rounded text-xs text-green-800 font-medium">
                    드롭!
                  </div>
                )}
              </div>
            )
          }}
        />
      </div>
    );
  };

  return (
    <div className="relative">
      <div className={`transition-all duration-300 ease-in-out ${
        showTaskSidebar ? 'mr-[400px] sm:mr-[540px]' : 'mr-0'
      }`}>
        <Card>
          <CalendarHeader 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddTask={() => setShowTaskSidebar(true)}
          />
          
          <CardContent className="space-y-6">
            <CalendarNavigation 
              dateRange={getDateRange()}
              onNavigatePrevious={navigatePrevious}
              onNavigateNext={navigateNext}
            />

            {/* 달력 뷰 */}
            <div className="w-full">
              {viewMode === 'week' ? renderWeekView() : renderMonthView()}
            </div>

            {/* 선택된 날짜의 이벤트 */}
            {selectedDate && (
              <CalendarEventList 
                selectedDate={selectedDate}
                events={selectedDateEvents}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 할일 추가 사이드바 */}
      <TaskSidebar 
        open={showTaskSidebar}
        onClose={() => setShowTaskSidebar(false)}
        studentId={studentId}
        onTaskDragStart={handleTaskDragStart}
      />
    </div>
  );
};
