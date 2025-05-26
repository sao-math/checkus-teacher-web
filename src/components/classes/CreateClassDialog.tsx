
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTeachers } from '@/data/mockTeachers';

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClassFormData) => void;
}

export interface ClassFormData {
  name: string;
  teacherId: string;
}

export const CreateClassDialog: React.FC<CreateClassDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const form = useForm<ClassFormData>({
    defaultValues: {
      name: '',
      teacherId: '',
    },
  });

  const handleSubmit = (data: ClassFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 반 만들기</DialogTitle>
          <DialogDescription>
            새로운 반을 생성합니다. 반 이름과 담당 선생님을 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: '반 이름을 입력해주세요' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>반 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 3-A반" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherId"
              rules={{ required: '담당 선생님을 선택해주세요' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>담당 선생님</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="담당 선생님을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {mockTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button type="submit">반 만들기</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
