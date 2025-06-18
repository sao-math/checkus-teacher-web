import React from 'react';
import { format, parseISO, differenceInMinutes, startOfDay, addHours } from 'date-fns';
import { StudyMonitoringStudent } from '@/types/study-monitoring';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, MessageSquare, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StudyTimelineProps {
  students: StudyMonitoringStudent[];
  currentTime: string;
  selectedStudents?: Set<number>;
  onStudentSelect?: (studentId: number) => void;
  onNotificationClick?: (studentId: number) => void;
  onStudentClick?: (studentId: number) => void;
  loadingNotifications?: Set<number>;
}

export const StudyTimeline: React.FC<StudyTimelineProps> = ({ 
  students, 
  currentTime,
  selectedStudents = new Set(),
  onStudentSelect,
  onNotificationClick,
  onStudentClick,
  loadingNotifications = new Set()
}) => {
  // Generate time labels for vertical timeline
  const generateTimeLabels = () => {
    const now = parseISO(currentTime);
    const currentHour = now.getHours();
    
    const labels = [];
    for (let i = 0; i < 24; i++) {
      labels.push(i.toString().padStart(2, '0') + ':00');
    }
    return { labels, timelineStartHour: 0 };
  };

  // Calculate vertical position for time blocks
  const getTimePosition = (timeString: string) => {
    const time = parseISO(timeString);
    const dayStart = startOfDay(time);
    const minutesFromDayStart = differenceInMinutes(time, dayStart);
    const hoursFromDayStart = minutesFromDayStart / 60;
    
    return (hoursFromDayStart / 24) * 100;
  };

  const getCurrentTimePosition = () => {
    const now = parseISO(currentTime);
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentHoursFloat = currentHour + currentMinutes / 60;
    
    return (currentHoursFloat / 24) * 100;
  };

  const getTimeDuration = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const durationMinutes = differenceInMinutes(end, start);
    return (durationMinutes / (24 * 60)) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-blue-500';
      case 'ABSENT': return 'bg-gray-200';
      case 'LATE': return 'bg-orange-500';
      case 'SCHEDULED': return 'bg-gray-200';
      default: return 'bg-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT': return <Badge className="bg-blue-500 text-white text-xs">출석</Badge>;
      case 'ABSENT': return <Badge variant="outline" className="text-xs">결석</Badge>;
      case 'LATE': return <Badge className="bg-orange-500 text-white text-xs">지각</Badge>;
      case 'SCHEDULED': return <Badge variant="outline" className="text-xs">예정</Badge>;
      default: return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const { labels: timeLabels } = generateTimeLabels();
  const currentTimePos = getCurrentTimePosition();

  return (
    <TooltipProvider>
      <div className="w-full bg-white border border-gray-200 flex">
        {/* Time Labels Column */}
        <div className="w-16 bg-gray-50 border-r border-gray-200">
          <div className="h-12 border-b border-gray-200 flex items-center justify-center text-sm font-medium">
            시간
          </div>
          <div className="relative" style={{ height: '600px' }}>
            {timeLabels.map((time, index) => (
              <div
                key={time}
                className="absolute text-xs text-center border-b border-gray-100 w-full flex items-center justify-center"
                style={{ 
                  top: `${(index / 24) * 100}%`,
                  height: `${100 / 24}%`
                }}
              >
                {index % 2 === 0 && time}
              </div>
            ))}
          </div>
        </div>

        {/* Students Timeline */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max">
            {students.map((student, studentIndex) => (
              <div key={student.studentId} className="w-80 border-r border-gray-200">
                {/* Student Header */}
                <div className="h-12 px-3 py-2 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    {onStudentSelect && (
                      <Checkbox
                        checked={selectedStudents.has(student.studentId)}
                        onCheckedChange={() => onStudentSelect(student.studentId)}
                        className="w-3 h-3"
                      />
                    )}
                    
                    {onNotificationClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onNotificationClick(student.studentId)}
                        disabled={loadingNotifications.has(student.studentId)}
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    )}

                    <button
                      className="text-sm hover:underline flex-1 text-left truncate"
                      onClick={() => onStudentClick?.(student.studentId)}
                    >
                      {student.studentName}
                    </button>

                    {getStatusBadge(student.status)}
                  </div>
                </div>

                {/* Student Timeline Column */}
                <div className="relative" style={{ height: '600px' }}>
                  {/* Hour grid lines */}
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-b border-gray-100"
                      style={{ top: `${(i / 24) * 100}%` }}
                    />
                  ))}

                  {/* Assigned study time bar */}
                  <div
                    className={`absolute left-2 right-12 ${getStatusColor(student.status)} rounded`}
                    style={{
                      top: `${getTimePosition(student.assignedStudyTime.startTime)}%`,
                      height: `${getTimeDuration(student.assignedStudyTime.startTime, student.assignedStudyTime.endTime)}%`,
                      minHeight: '4px'
                    }}
                  />

                  {/* Actual study time bar (if present) */}
                  {student.actualStudyTime.startTime && (
                    <div
                      className="absolute left-6 right-8 bg-green-500 rounded"
                      style={{
                        top: `${getTimePosition(student.actualStudyTime.startTime)}%`,
                        height: student.actualStudyTime.endTime 
                          ? `${getTimeDuration(student.actualStudyTime.startTime, student.actualStudyTime.endTime)}%`
                          : '4px',
                        minHeight: '4px'
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Current time indicator */}
          <div
            className="absolute left-16 right-0 h-0.5 bg-red-500 pointer-events-none z-10"
            style={{ 
              top: `calc(48px + ${currentTimePos * 600 / 100}px)`
            }}
          >
            <div className="absolute -left-12 -top-2 bg-red-500 text-white text-xs px-1 rounded">
              {format(parseISO(currentTime), 'HH:mm')}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}; 