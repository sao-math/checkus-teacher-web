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
}

interface FormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  activityType: '자습' | '학원';
  activityName: string;
}

export const WeeklyScheduleDialog: React.FC<WeeklyScheduleDialogProps> = ({
  open,
  onClose,
  scheduleItem,
  onSave,
}) => {
  const form = useForm<FormData>({
    defaultValues: {
      dayOfWeek: scheduleItem?.dayOfWeek?.toString() || '1',
      startTime: scheduleItem?.startTime || '09:00',
      endTime: scheduleItem?.endTime || '10:00',
      activityType: (scheduleItem?.activity?.type as '자습' | '학원') || '자습',
      activityName: scheduleItem?.activity?.name || '',
    },
  });

  React.useEffect(() => {
    if (scheduleItem) {
      form.reset({
        dayOfWeek: scheduleItem.dayOfWeek.toString(),
        startTime: scheduleItem.startTime,
        endTime: scheduleItem.endTime,
        activityType: (scheduleItem.activity?.type as '자습' | '학원') || '자습',
        activityName: scheduleItem.activity?.name || '',
      });
    } else {
      form.reset({
        dayOfWeek: '1',
        startTime: '09:00',
        endTime: '10:00',
        activityType: '자습',
        activityName: '',
      });
    }
  }, [scheduleItem, form]);

  const onSubmit = (data: FormData) => {
    const activity: Activity = {
      id: scheduleItem?.activity?.id || Math.floor(Math.random() * 1000),
      name: data.activityName,
      type: data.activityType,
      isStudyAssignable: data.activityType === '자습'
    };

    onSave({
      ...scheduleItem,
      dayOfWeek: parseInt(data.dayOfWeek),
      startTime: data.startTime,
      endTime: data.endTime,
      activityId: activity.id,
      activity: activity
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
              name="activityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>활동 유형</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="활동 유형을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="자습">자습</SelectItem>
                      <SelectItem value="학원">학원</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>활동 제목</FormLabel>
                  <FormControl>
                    <Input placeholder="활동 제목을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시작 시간</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
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
                  <FormLabel>종료 시간</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
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
