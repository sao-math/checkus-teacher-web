
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { StudyTimeEventModal } from './StudyTimeEventModal';
import { AssignedStudyTime } from '@/types/schedule';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: AssignedStudyTime;
  type: 'study' | 'other';
}

interface StudyTimeDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: CalendarEvent[];
  onUpdateStudyTime: (id: number, updates: Partial<AssignedStudyTime>) => void;
  onDeleteStudyTime: (id: number) => void;
}

export const StudyTimeDayModal: React.FC<StudyTimeDayModalProps> = ({
  isOpen,
  onClose,
  date,
  events,
  onUpdateStudyTime,
  onDeleteStudyTime
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // 이벤트를 시간순으로 정렬
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

  const handleEventEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleEventUpdate = (updates: Partial<AssignedStudyTime>) => {
    if (selectedEvent) {
      onUpdateStudyTime(parseInt(selectedEvent.id), updates);
      setSelectedEvent(null);
    }
  };

  const handleEventDelete = () => {
    if (selectedEvent) {
      onDeleteStudyTime(parseInt(selectedEvent.id));
      setSelectedEvent(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(date, 'M월 d일 (EEEE)', { locale: ko })} 일정
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 일정 목록 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">일정 목록</h3>
              
              {sortedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>이 날짜에는 일정이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {sortedEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={event.type === 'study' ? 'default' : 'secondary'}
                                className={event.type === 'study' ? 'bg-blue-500' : 'bg-green-500'}
                              >
                                {event.type === 'study' ? '학습' : '기타'}
                              </Badge>
                              <h4 className="font-medium">{event.title}</h4>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                                </span>
                              </div>
                              <div>
                                소요시간: {Math.round(((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)) * 10) / 10}시간
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEventEdit(event)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                handleEventDelete();
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 닫기 버튼 */}
            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 이벤트 수정 모달 */}
      {selectedEvent && (
        <StudyTimeEventModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
          onUpdate={handleEventUpdate}
          onDelete={handleEventDelete}
        />
      )}
    </>
  );
};
