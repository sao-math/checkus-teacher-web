
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface NewTaskFormProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCreateTask: () => void;
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onCreateTask
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="taskTitle">할일 제목 *</Label>
        <Input
          id="taskTitle"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="새로운 할일 제목을 입력하세요"
        />
      </div>

      <div>
        <Label htmlFor="taskDescription">할일 설명</Label>
        <Textarea
          id="taskDescription"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="할일에 대한 상세 설명을 입력하세요"
          rows={4}
        />
      </div>

      <Button 
        onClick={onCreateTask}
        className="w-full"
        disabled={!title.trim()}
      >
        <Plus className="h-4 w-4 mr-2" />
        새 할일 생성 및 배정
      </Button>
    </div>
  );
};
