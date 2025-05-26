import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Edit, Trash2, Plus } from 'lucide-react';
import { WeeklySchedule } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { WeeklyScheduleDialog } from './WeeklyScheduleDialog';

interface WeeklyScheduleGridProps {
  weeklySchedule: WeeklySchedule[];
  studentId: number;
  onUpdateSchedule?: (schedule: WeeklySchedule) => void;
  onDeleteSchedule?: (scheduleId: number) => void;
  onAddSchedule?: () => void;
}

export const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({
  weeklySchedule,
  studentId,
  onUpdateSchedule,
  onDeleteSchedule,
  onAddSchedule
}) => {
  const [showDialog, setShowDialog] = React.useState(false);
  const [editingSchedule, setEditingSchedule] = React.useState<WeeklySchedule | null>(null);

  const getDayName = (dayOfWeek: number) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[dayOfWeek];
  };

  const getDaySchedule = (dayOfWeek: number) => {
    return weeklySchedule
      .filter(item => item.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleEditSchedule = (schedule: WeeklySchedule) => {
    setEditingSchedule(schedule);
    setShowDialog(true);
  };

  const handleDeleteSchedule = (scheduleId: number) => {
    if (onDeleteSchedule) {
      onDeleteSchedule(scheduleId);
    }
  };

  const handleSaveSchedule = (data: Partial<WeeklySchedule>) => {
    if (editingSchedule && onUpdateSchedule) {
      onUpdateSchedule({
        ...editingSchedule,
        ...data
      });
    }
    setShowDialog(false);
    setEditingSchedule(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              주간 고정 일정표
            </CardTitle>
            <Button size="sm" variant="outline" className="bg-white text-black hover:bg-gray-100" onClick={onAddSchedule}>
              <Plus className="h-4 w-4 mr-2" />
              일정 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
              const daySchedule = getDaySchedule(dayOfWeek);
              return (
                <div key={dayOfWeek} className="space-y-3">
                  <div className="text-center">
                    <h3 className="font-medium text-gray-900 py-2 border-b border-gray-200">
                      {getDayName(dayOfWeek)}
                    </h3>
                  </div>
                  <div className="space-y-2 min-h-[300px]">
                    {daySchedule.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border rounded-lg transition-all duration-200 bg-white hover:bg-gray-50 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {item.activity?.name}
                            </p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleEditSchedule(item)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteSchedule(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              item.activity?.isStudyAssignable 
                                ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                          >
                            {item.activity?.type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <p className="text-xs text-gray-500">
                              {item.startTime} - {item.endTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {daySchedule.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        등록된 일정이 없습니다
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <WeeklyScheduleDialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
          setEditingSchedule(null);
        }}
        scheduleItem={editingSchedule}
        onSave={handleSaveSchedule}
      />
    </>
  );
};
