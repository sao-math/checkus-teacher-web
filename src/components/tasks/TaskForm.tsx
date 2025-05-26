import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ReferenceForm } from './ReferenceForm';
import { TaskNode, Reference } from '@/types/task';
import { toast } from '@/components/ui/use-toast';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskNode | null;
  parentTask?: TaskNode | null;
  onSave: (taskData: Partial<TaskNode>) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onOpenChange,
  task,
  parentTask,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isLeaf: false,
    references: [] as Reference[],
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        isLeaf: task.isLeaf,
        references: task.references || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        isLeaf: false,
        references: [],
      });
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // 분류일 때는 참고자료 제거
    const taskData = {
      ...formData,
      references: formData.isLeaf ? formData.references : undefined,
    };

    onSave(taskData);
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      title: '',
      description: '',
      isLeaf: false,
      references: [],
    });
  };

  const getDialogTitle = () => {
    if (task) {
      return `${task.isLeaf ? '실제 과제' : '분류'} 수정`;
    }
    if (parentTask) {
      return `${parentTask.title}에 하위 항목 추가`;
    }
    return '새 항목 추가';
  };

  // 하위 항목이 있는 분류를 실제 과제로 변경할 수 없도록 체크
  const canChangeToTask = !task || !task.children || task.children.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isLeaf"
              checked={formData.isLeaf}
              onCheckedChange={(checked) => {
                if (checked && !canChangeToTask) {
                  toast({
                    title: "변경 불가",
                    description: "하위 항목이 있는 분류는 실제 과제로 변경할 수 없습니다.",
                    variant: "destructive"
                  });
                  return;
                }
                setFormData(prev => ({ 
                  ...prev, 
                  isLeaf: checked === true,
                  references: checked === true ? prev.references : []
                }));
              }}
              disabled={!canChangeToTask}
            />
            <Label htmlFor="isLeaf" className="text-sm">
              실제 과제 (체크 해제 시 분류로 설정)
            </Label>
          </div>

          {formData.isLeaf ? (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="과제에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <ReferenceForm
                  references={formData.references}
                  onChange={(references) => setFormData(prev => ({ ...prev, references }))}
                />
              </div>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                분류는 제목만 입력하면 됩니다. 하위에 다른 분류나 실제 과제를 추가할 수 있습니다.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {task ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
