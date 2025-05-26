
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
  type: 'assigned' | 'actual';
  startTime: string;
  endTime: string;
  status?: 'completed' | 'pending' | 'overdue';
}

interface CalendarEventItemProps {
  event: CalendarEvent;
}

export const CalendarEventItem: React.FC<CalendarEventItemProps> = ({ event }) => {
  const getEventTypeColor = (type: string, status?: string) => {
    if (type === 'assigned') {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'overdue': return 'bg-red-100 text-red-800';
        default: return 'bg-blue-100 text-blue-800';
      }
    } else {
      return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{event.title}</p>
        <p className="text-sm text-gray-500">
          {event.startTime} - {event.endTime}
        </p>
      </div>
      <Badge className={getEventTypeColor(event.type, event.status)}>
        {event.type === 'assigned' ? '할일' : '실제'}
      </Badge>
    </div>
  );
};
