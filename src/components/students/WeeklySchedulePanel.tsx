import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { WeeklySchedule } from '@/types/schedule';

interface WeeklySchedulePanelProps {
  weeklySchedule: WeeklySchedule[];
}

export const WeeklySchedulePanel: React.FC<WeeklySchedulePanelProps> = ({
  weeklySchedule
}) => {
  const getDayName = (dayOfWeek: number) => {
    const days = ['', '월', '화', '수', '목', '금', '토', '일']; // 1=월, 2=화, ..., 7=일
    return days[dayOfWeek];
  };

  const getDaySchedule = (dayOfWeek: number) => {
    return weeklySchedule.filter(item => item.dayOfWeek === dayOfWeek);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Calendar className="h-5 w-5" />
          주간 고정 일정표
        </CardTitle>
        <p className="text-sm text-gray-600">
          학습 할당 가능한 시간은 파란색으로 표시됩니다.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => {
            const daySchedule = getDaySchedule(dayOfWeek);
            
            return (
              <div key={dayOfWeek} className="space-y-3">
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 py-2 border-b border-gray-200">
                    {getDayName(dayOfWeek)}
                  </h3>
                </div>
                <div className="space-y-2">
                  {daySchedule.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border ${
                        item.isStudyAssignable 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-sm font-medium ${
                              item.activity?.isStudyAssignable ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {item.activity?.name}
                            </p>
                            {item.activity?.isStudyAssignable && (
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                할당가능
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <p className={`text-xs ${
                              item.activity?.isStudyAssignable ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              {item.startTime} - {item.endTime}
                            </p>
                          </div>
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
  );
};
