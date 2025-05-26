import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash } from 'lucide-react';
import { TaskNode } from '@/types/task';

interface TaskActionsProps {
  task: TaskNode;
  onEdit: (task: TaskNode) => void;
  onAdd: (parentId: number) => void;
  onDelete: (task: TaskNode) => void;
}

export const TaskActions: React.FC<TaskActionsProps> = ({
  task,
  onEdit,
  onAdd,
  onDelete,
}) => {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {!task.isLeaf && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={() => onAdd(task.id)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 w-6 p-0"
        onClick={() => onEdit(task)}
      >
        <Edit className="h-3 w-3" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
        onClick={() => onDelete(task)}
      >
        <Trash className="h-3 w-3" />
      </Button>
    </div>
  );
};
