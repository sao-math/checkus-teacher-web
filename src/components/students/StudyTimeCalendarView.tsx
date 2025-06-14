import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, addMonths, subMonths, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AssignedStudyTime } from '@/types/schedule';
import { formatKoreanTimeRange } from '@/utils/dateUtils';

interface StudyTimeCalendarViewProps {
  studentId: number;
  assignedStudyTimes: AssignedStudyTime[];
  viewMode: 'week' | 'month';
}

export const StudyTimeCalendarView: React.FC<StudyTimeCalendarViewProps> = ({
  assignedStudyTimes,
  viewMode
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const getStudyTimesForDate = (date: Date) => {
    return assignedStudyTimes.filter(studyTime => 
      isSameDay(new Date(studyTime.startTime), date)
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="grid grid-cols-7 gap-4">
        {/* 요일 헤더 */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={index} className="text-center py-2 font-medium text-gray-700 border-b">
            {day}
          </div>
        ))}
        
        {/* 날짜 및 할당된 학습시간 */}
        {days.map((date) => {
          const studyTimes = getStudyTimesForDate(date);
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          
          return (
            <div
              key={date.toISOString()}
              className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all ${
                isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(date, 'd', { locale: ko })}
              </div>
              <div className="space-y-1">
                {studyTimes.slice(0, 3).map((studyTime) => (
                  <div
                    key={studyTime.id}
                    className="text-xs p-1 rounded truncate bg-green-100 text-green-800"
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
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="text-center py-12 text-gray-500">
        월간 뷰는 다음 단계에서 구현 예정입니다.
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5" />
            학습시간 달력
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold">{getDateRange()}</span>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'week' ? renderWeekView() : renderMonthView()}
        
        {selectedDate && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">
              {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}의 학습시간
            </h4>
            <div className="space-y-2">
              {getStudyTimesForDate(selectedDate).length > 0 ? (
                getStudyTimesForDate(selectedDate).map((studyTime) => (
                  <div key={studyTime.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>{studyTime.title || '공부시간'}</span>
                    <span className="text-sm text-gray-500">
                      {formatKoreanTimeRange(studyTime.startTime, studyTime.endTime)}
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
  );
};
