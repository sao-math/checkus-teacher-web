import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { WeeklySchedule } from '@/types/schedule';
import { Activity } from '@/types/activity';

interface WeeklyScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  scheduleItem?: WeeklySchedule | null;
  onSave: (data: Partial<WeeklySchedule>) => void;
  activities: Activity[];
  fetchActivities: () => void;
}

interface FormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  activityId: string;
  title: string;
}

export const WeeklyScheduleDialog: React.FC<WeeklyScheduleDialogProps> = ({
  open,
  onClose,
  scheduleItem,
  onSave,
  activities,
  fetchActivities,
}) => {
  const form = useForm<FormData>({
    defaultValues: {
      dayOfWeek: scheduleItem?.dayOfWeek?.toString() || '1',
      startTime: scheduleItem?.startTime || '09:00',
      endTime: scheduleItem?.endTime || '10:00',
      activityId: scheduleItem?.activityId?.toString() || '',
      title: scheduleItem?.title || '',
    },
  });

  React.useEffect(() => {
    if (scheduleItem) {
      form.reset({
        dayOfWeek: scheduleItem.dayOfWeek.toString(),
        startTime: scheduleItem.startTime,
        endTime: scheduleItem.endTime,
        activityId: scheduleItem.activityId?.toString() || '',
        title: scheduleItem.title || '',
      });
    } else {
      form.reset({
        dayOfWeek: '1',
        startTime: '09:00',
        endTime: '10:00',
        activityId: '',
        title: '',
      });
    }
  }, [scheduleItem, form]);

  const onSubmit = (data: FormData) => {
    const selectedActivity = activities.find(a => a.id.toString() === data.activityId);
    if (!selectedActivity) return;

    // Client-side validation for time range
    if (data.startTime >= data.endTime) {
      form.setError('endTime', {
        type: 'manual',
        message: 'End time must be after start time'
      });
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

  const getDayOptions = () => [
    { value: '1', label: '월요일' },
    { value: '2', label: '화요일' },
    { value: '3', label: '수요일' },
    { value: '4', label: '목요일' },
    { value: '5', label: '금요일' },
    { value: '6', label: '토요일' },
    { value: '0', label: '일요일' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {scheduleItem ? '시간표 수정' : '시간표 추가'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>일정 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="일정 이름을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>요일</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="요일을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getDayOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>활동</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    onOpenChange={(open) => { if (open) fetchActivities(); }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="활동을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activities.map((activity) => (
                        <SelectItem key={activity.id} value={activity.id.toString()}>
                          {activity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input 
                        type="time" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-calculate end time if not set
                          const endTimeValue = form.getValues('endTime');
                          if (!endTimeValue && e.target.value) {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const endTime = new Date();
                            endTime.setHours(hours + 1, minutes); // Default to 1 hour duration
                            const endTimeString = endTime.toTimeString().slice(0, 5);
                            form.setValue('endTime', endTimeString);
                          }
                        }}
                      />
                      {/* Preset time buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { label: '9:00', value: '09:00' },
                          { label: '13:00', value: '13:00' },
                          { label: '14:00', value: '14:00' },
                          { label: '19:00', value: '19:00' },
                          { label: '20:00', value: '20:00' }
                        ].map(preset => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => {
                              form.setValue('startTime', preset.value);
                              // Auto-set end time to 1 hour later
                              const [hours, minutes] = preset.value.split(':').map(Number);
                              const endTime = new Date();
                              endTime.setHours(hours + 1, minutes);
                              const endTimeString = endTime.toTimeString().slice(0, 5);
                              form.setValue('endTime', endTimeString);
                            }}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input 
                        type="time" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Validate that end time is after start time
                          const startTimeValue = form.getValues('startTime');
                          if (startTimeValue && e.target.value && startTimeValue >= e.target.value) {
                            form.setError('endTime', {
                              type: 'manual',
                              message: 'End time must be after start time'
                            });
                          } else {
                            form.clearErrors('endTime');
                          }
                        }}
                      />
                      {/* Duration presets */}
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { label: '+30min', minutes: 30 },
                          { label: '+1hr', minutes: 60 },
                          { label: '+1.5hr', minutes: 90 },
                          { label: '+2hr', minutes: 120 }
                        ].map(duration => (
                          <button
                            key={duration.minutes}
                            type="button"
                            onClick={() => {
                              const startTimeValue = form.getValues('startTime');
                              if (startTimeValue) {
                                const [hours, minutes] = startTimeValue.split(':').map(Number);
                                const endTime = new Date();
                                endTime.setHours(hours, minutes + duration.minutes);
                                const endTimeString = endTime.toTimeString().slice(0, 5);
                                form.setValue('endTime', endTimeString);
                                form.clearErrors('endTime');
                              }
                            }}
                            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
                            disabled={!form.getValues('startTime')}
                          >
                            {duration.label}
                          </button>
                        ))}
                      </div>
                      {/* Show calculated duration */}
                      {(() => {
                        const startTime = form.watch('startTime');
                        const endTime = form.watch('endTime');
                        if (startTime && endTime) {
                          const [startHours, startMinutes] = startTime.split(':').map(Number);
                          const [endHours, endMinutes] = endTime.split(':').map(Number);
                          const startTotalMinutes = startHours * 60 + startMinutes;
                          const endTotalMinutes = endHours * 60 + endMinutes;
                          const durationMinutes = endTotalMinutes - startTotalMinutes;
                          
                          if (durationMinutes > 0) {
                            const hours = Math.floor(durationMinutes / 60);
                            const minutes = durationMinutes % 60;
                            return (
                              <div className="text-xs text-gray-600">
                                Duration: {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}min` : ''}
                              </div>
                            );
                          } else if (durationMinutes <= 0) {
                            return (
                              <div className="text-xs text-red-600">
                                ⚠️ End time must be after start time
                              </div>
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">
                {scheduleItem ? '수정' : '추가'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
