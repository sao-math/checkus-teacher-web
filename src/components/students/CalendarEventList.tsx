
import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarEventItem } from './CalendarEventItem';

interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
  type: 'assigned' | 'actual';
  startTime: string;
  endTime: string;
  status?: 'completed' | 'pending' | 'overdue';
}

interface CalendarEventListProps {
  selectedDate: Date;
  events: CalendarEvent[];
}

export const CalendarEventList: React.FC<CalendarEventListProps> = ({
  selectedDate,
  events
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">
        {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}의 일정
      </h4>
      
      <div className="space-y-2">
        {events.length > 0 ? (
          events.map((event) => (
            <CalendarEventItem key={event.id} event={event} />
          ))
        ) : (
          <div className="text-center py-4 text-gray-400">
            이 날짜에는 등록된 일정이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
