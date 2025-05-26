
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  onConfirm: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  taskTitle,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <DialogTitle>할일 삭제</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            <span className="font-semibold text-gray-900">"{taskTitle}"</span>을(를) 삭제하시겠습니까?
            <br />
            <br />
            이 작업은 되돌릴 수 없으며, 하위 할일들도 모두 함께 삭제됩니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1"
          >
            취소
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleConfirm} 
            className="flex-1"
          >
            삭제
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
