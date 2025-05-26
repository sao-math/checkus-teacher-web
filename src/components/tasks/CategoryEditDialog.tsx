
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
import { TaskType } from '@/types/task';

interface CategoryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: TaskType[];
  onSave: (categories: TaskType[]) => void;
}

export const CategoryEditDialog: React.FC<CategoryEditDialogProps> = ({
  open,
  onOpenChange,
  categories,
  onSave,
}) => {
  const [editedCategories, setEditedCategories] = useState<TaskType[]>([]);

  useEffect(() => {
    setEditedCategories([...categories]);
  }, [categories, open]);

  const handleCategoryChange = (id: number, name: string) => {
    setEditedCategories(prev => 
      prev.map(cat => cat.id === id ? { ...cat, name } : cat)
    );
  };

  const handleAddCategory = () => {
    const newId = Math.max(...editedCategories.map(cat => cat.id)) + 1;
    setEditedCategories(prev => [...prev, { id: newId, name: '새 카테고리' }]);
  };

  const handleRemoveCategory = (id: number) => {
    setEditedCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleSave = () => {
    onSave(editedCategories);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>카테고리 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            {editedCategories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor={`category-${category.id}`} className="sr-only">
                    카테고리 이름
                  </Label>
                  <Input
                    id={`category-${category.id}`}
                    value={category.name}
                    onChange={(e) => handleCategoryChange(category.id, e.target.value)}
                    placeholder="카테고리 이름"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveCategory(category.id)}
                  disabled={editedCategories.length <= 1}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCategory}
            className="w-full"
          >
            + 새 카테고리 추가
          </Button>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              취소
            </Button>
            <Button type="button" onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
