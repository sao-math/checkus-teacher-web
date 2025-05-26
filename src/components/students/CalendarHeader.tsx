
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

interface CalendarHeaderProps {
  viewMode: 'week' | 'month';
  onViewModeChange: (value: 'week' | 'month') => void;
  onAddTask: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onViewModeChange,
  onAddTask
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5" />
          공부시간 & 할일 달력
        </CardTitle>
        <div className="flex items-center gap-3">
          <Button 
            onClick={onAddTask}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            할일 추가
          </Button>
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && onViewModeChange(value as 'week' | 'month')}
            className="bg-gray-100 rounded-lg p-1"
          >
            <ToggleGroupItem value="week" className="px-4 py-2">
              주간
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="px-4 py-2">
              월간
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </CardHeader>
  );
};
