import React from 'react';
import { TaskNode } from '@/types/task';
import { TaskSearchInput } from './TaskSearchInput';
import { TaskList } from './TaskList';

interface TaskTypeTabContentProps {
  tasks: TaskNode[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleNode: (nodeId: number) => void;
  onAssignTask: (task: TaskNode) => void;
  onTaskDragStart?: (task: TaskNode, event?: React.DragEvent) => void;
}

export const TaskTypeTabContent: React.FC<TaskTypeTabContentProps> = ({
  tasks,
  searchTerm,
  onSearchChange,
  onToggleNode,
  onAssignTask,
  onTaskDragStart
}) => {
  return (
    <div className="space-y-4">
      <TaskSearchInput 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
      <TaskList
        tasks={tasks}
        searchTerm={searchTerm}
        onToggleNode={onToggleNode}
        onAssignTask={onAssignTask}
        onTaskDragStart={onTaskDragStart}
      />
    </div>
  );
};
