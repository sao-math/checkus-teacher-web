import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WeeklySchedule } from '@/types/schedule';
import { Activity } from '@/types/activity';
import { StudyTimeForm } from '@/components/students/StudyTimeForm';

interface WeeklyScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  scheduleItem?: WeeklySchedule | null;
  onSave: (data: Partial<WeeklySchedule>) => void;
  activities: Activity[];
  fetchActivities: () => void;
}

export const WeeklyScheduleDialog: React.FC<WeeklyScheduleDialogProps> = ({
  open,
  onClose,
  scheduleItem,
  onSave,
  activities,
  fetchActivities,
}) => {
  const handleSubmit = (data: any) => {
    const selectedActivity = activities.find(a => a.id.toString() === data.activityId);
    if (!selectedActivity) return;

    // Client-side validation for time range
    if (data.startTime >= data.endTime) {
      return;
    }

    onSave({
      ...scheduleItem,
      dayOfWeek: parseInt(data.dayOfWeek),
      startTime: data.startTime,
      endTime: data.endTime,
      activityId: selectedActivity.id,
      activity: selectedActivity,
      title: data.title,
      isStudyAssignable: selectedActivity.isStudyAssignable,
      activityName: selectedActivity.name
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {scheduleItem ? '시간표 수정' : '시간표 추가'}
          </DialogTitle>
        </DialogHeader>
        <StudyTimeForm
          defaultValues={{
            title: scheduleItem?.title || '',
            activityId: scheduleItem?.activityId?.toString() || '',
            dayOfWeek: scheduleItem?.dayOfWeek?.toString() || '1',
            startTime: scheduleItem?.startTime || '09:00',
            endTime: scheduleItem?.endTime || '10:00',
          }}
          activities={activities}
          onSubmit={handleSubmit}
          onCancel={onClose}
          showDatePicker={false}
          showDayOfWeek={true}
          submitButtonText={scheduleItem ? '수정' : '추가'}
          fetchActivities={fetchActivities}
        />
      </DialogContent>
    </Dialog>
  );
};
