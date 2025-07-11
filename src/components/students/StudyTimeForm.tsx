import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import DatePicker from 'react-datepicker';
import { CalendarIcon } from 'lucide-react';
import { ko } from 'date-fns/locale';
import TimeInputPicker from '@/components/ui/time-input-picker';
import { Activity } from '@/types/activity';

interface StudyTimeFormData {
  title: string;
  activityId: string;
  date?: Date;
  dayOfWeek?: string;
  startTime: string;
  endTime: string;
}

interface StudyTimeFormProps {
  defaultValues?: Partial<StudyTimeFormData>;
  activities: Activity[];
  onSubmit: (data: StudyTimeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  showDatePicker?: boolean;
  showDayOfWeek?: boolean;
  submitButtonText?: string;
  fetchActivities?: () => void;
}

export const StudyTimeForm: React.FC<StudyTimeFormProps> = ({
  defaultValues = {},
  activities,
  onSubmit,
  onCancel,
  isLoading = false,
  showDatePicker = true,
  showDayOfWeek = false,
  submitButtonText = "추가",
  fetchActivities
}) => {
  const form = useForm<StudyTimeFormData>({
    defaultValues: {
      title: '',
      activityId: '',
      date: new Date(),
      dayOfWeek: '1',
      startTime: '09:00',
      endTime: '10:00',
      ...defaultValues,
    },
    mode: 'onChange', // Enable real-time validation
  });

  const handleSubmit = (data: StudyTimeFormData) => {
    onSubmit(data);
  };

  const getDayOptions = () => [
    { value: '1', label: '월요일' },
    { value: '2', label: '화요일' },
    { value: '3', label: '수요일' },
    { value: '4', label: '목요일' },
    { value: '5', label: '금요일' },
    { value: '6', label: '토요일' },
    { value: '7', label: '일요일' },
  ];

  // Check if form is valid for submission
  const isFormValid = form.watch('title')?.trim() && form.watch('activityId');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          rules={{
            required: '일정 이름을 입력해주세요',
            minLength: {
              value: 1,
              message: '일정 이름을 입력해주세요'
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>일정 이름 <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="일정 이름을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activityId"
          rules={{
            required: '활동을 선택해주세요'
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>활동 <span className="text-red-500">*</span></FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                onOpenChange={(open) => { 
                  if (open && fetchActivities) fetchActivities(); 
                }}
              >
                <FormControl>
                  <SelectTrigger className={!field.value ? 'text-muted-foreground' : ''}>
                    <SelectValue placeholder="활동을 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activities.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-gray-500">활동이 없습니다</div>
                  ) : (
                    activities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id.toString()}>
                        {activity.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showDatePicker && (
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <div className="inline-flex items-center gap-2 w-fit">
                  <FormLabel className="whitespace-nowrap">날짜</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date | null) => field.onChange(date)}
                        dateFormat="yyyy-MM-dd"
                        locale={ko}
                        placeholderText="날짜를 선택하세요"
                        customInput={<Input className="w-auto max-w-[140px]" />}
                      />
                      <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {showDayOfWeek && (
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
        )}

        {/* Time Input Picker */}
        <FormItem>
          <FormControl>
            <TimeInputPicker
              startTime={form.watch('startTime')}
              endTime={form.watch('endTime')}
              onTimeChange={(startTime, endTime) => {
                form.setValue('startTime', startTime);
                form.setValue('endTime', endTime);
              }}
              disabled={isLoading}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !isFormValid}
            className={!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isLoading ? "처리중..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 