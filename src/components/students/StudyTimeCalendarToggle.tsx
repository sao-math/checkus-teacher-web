import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays, Calendar } from 'lucide-react';

interface StudyTimeCalendarToggleProps {
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
}

export const StudyTimeCalendarToggle: React.FC<StudyTimeCalendarToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('week')}
        className={`h-8 px-3 text-xs ${
          viewMode === 'week' 
            ? 'bg-white text-blue-600 shadow-sm hover:bg-white hover:text-blue-700' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <CalendarDays className="mr-1 h-3 w-3" />
        주간
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('month')}
        className={`h-8 px-3 text-xs ${
          viewMode === 'month' 
            ? 'bg-white text-blue-600 shadow-sm hover:bg-white hover:text-blue-700' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Calendar className="mr-1 h-3 w-3" />
        월간
      </Button>
    </div>
  );
};
