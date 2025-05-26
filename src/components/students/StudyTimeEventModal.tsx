
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AssignedStudyTime } from '@/types/schedule';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: AssignedStudyTime;
  type: 'study' | 'other';
}

interface StudyTimeEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent;
  onUpdate: (updates: Partial<AssignedStudyTime>) => void;
  onDelete: () => void;
}

export const StudyTimeEventModal: React.FC<StudyTimeEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onUpdate,
  onDelete
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (event) {
      setStartTime(format(event.start, 'yyyy-MM-dd HH:mm'));
      setEndTime(format(event.end, 'yyyy-MM-dd HH:mm'));
      setNotes(''); // notes 필드가 있다면 추가
    }
  }, [event]);

  const handleSave = () => {
    const updates: Partial<AssignedStudyTime> = {
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    };
    
    onUpdate(updates);
  };

  const isTimeValid = () => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return start < end;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            학습시간 편집
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* 기본 정보 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">활동명</Label>
            <div className="p-2 bg-gray-50 rounded border">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded ${
                    event.type === 'study' ? 'bg-blue-500' : 'bg-green-500'
                  }`} 
                />
                <span className="font-medium">{event.title}</span>
              </div>
            </div>
          </div>

          {/* 학생 정보 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">학생</Label>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>학생 ID: {event.resource.studentId}</span>
            </div>
          </div>

          {/* 시작 시간 */}
          <div className="space-y-2">
            <Label htmlFor="startTime">시작 시간</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          {/* 종료 시간 */}
          <div className="space-y-2">
            <Label htmlFor="endTime">종료 시간</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          {/* 시간 유효성 검사 메시지 */}
          {!isTimeValid() && startTime && endTime && (
            <div className="text-sm text-red-600">
              종료 시간은 시작 시간보다 늦어야 합니다.
            </div>
          )}

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              id="notes"
              placeholder="추가 메모나 설명을 입력하세요..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>학습시간 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  이 학습시간을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!isTimeValid()}
            >
              저장
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
