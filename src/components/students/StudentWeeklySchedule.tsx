import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { WeeklySchedule } from '@/types/student';
import { WeeklyScheduleDialog } from './WeeklyScheduleDialog';

interface StudentWeeklyScheduleProps {
  studentId: number;
}

// Mock data - 실제로는 API에서 가져와야 함
const mockSchedule: WeeklySchedule[] = [
  {
    id: 1,
    studentId: 1,
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '12:00',
    activity: '수학 수업'
  },
  {
    id: 2,
    studentId: 1,
    dayOfWeek: 1,
    startTime: '13:00',
    endTime: '15:00',
    activity: '영어 수업'
  },
  {
    id: 3,
    studentId: 1,
    dayOfWeek: 3,
    startTime: '10:00',
    endTime: '12:00',
    activity: '과학 실험'
  },
  {
    id: 4,
    studentId: 1,
    dayOfWeek: 5,
    startTime: '14:00',
    endTime: '16:00',
    activity: '문학 토론'
  }
];

export const StudentWeeklySchedule: React.FC<StudentWeeklyScheduleProps> = ({ studentId }) => {
  const [schedule, setSchedule] = useState<WeeklySchedule[]>(mockSchedule);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WeeklySchedule | null>(null);

  const getDayName = (dayOfWeek: number) => {
    const days = ['', '월', '화', '수', '목', '금', '토', '일']; // Index 0 is empty, 1=월요일, 7=일요일
    return days[dayOfWeek];
  };

  const getDaySchedule = (dayOfWeek: number) => {
    return schedule.filter(item => item.dayOfWeek === dayOfWeek);
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setShowDialog(true);
  };

  const handleEditSchedule = (scheduleItem: WeeklySchedule) => {
    setEditingSchedule(scheduleItem);
    setShowDialog(true);
  };

  const handleDeleteSchedule = (scheduleItem: WeeklySchedule) => {
    setSchedule(prev => prev.filter(item => item.id !== scheduleItem.id));
  };

  const handleSaveSchedule = (data: Partial<WeeklySchedule>) => {
    if (editingSchedule) {
      // 수정
      setSchedule(prev => prev.map(item => 
        item.id === editingSchedule.id 
          ? { ...item, ...data }
          : item
      ));
    } else {
      // 추가
      const newSchedule: WeeklySchedule = {
        id: Date.now(), // 임시 ID
        studentId,
        dayOfWeek: data.dayOfWeek!,
        startTime: data.startTime!,
        endTime: data.endTime!,
        activity: data.activity!,
      };
      setSchedule(prev => [...prev, newSchedule]);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              주간 고정 시간표
            </CardTitle>
            <Button size="sm" onClick={handleAddSchedule}>
              <Plus className="h-4 w-4 mr-2" />
              시간표 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => {
              const daySchedule = getDaySchedule(dayOfWeek);
              return (
                <div key={dayOfWeek} className="space-y-2">
                  <div className="text-center">
                    <h3 className="font-medium text-gray-900 mb-3">
                      {getDayName(dayOfWeek)}
                    </h3>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {daySchedule.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg group hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              {item.activity}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {item.startTime} - {item.endTime}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleEditSchedule(item)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteSchedule(item)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {daySchedule.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        등록된 시간표가 없습니다
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
        onClose={() => setShowDialog(false)}
        scheduleItem={editingSchedule}
        onSave={handleSaveSchedule}
      />
    </>
  );
};
