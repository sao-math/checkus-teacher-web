
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarNavigationProps {
  dateRange: string;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
}

export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  dateRange,
  onNavigatePrevious,
  onNavigateNext
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" size="sm" onClick={onNavigatePrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h3 className="text-lg font-semibold">{dateRange}</h3>
      <Button variant="outline" size="sm" onClick={onNavigateNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
