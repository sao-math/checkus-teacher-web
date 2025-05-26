import React from 'react';
import { TaskNode } from '@/types/task';
import { TaskTreeNode } from './TaskTreeNode';

interface TaskListProps {
  tasks: TaskNode[];
  searchTerm: string;
  onToggleNode: (nodeId: number) => void;
  onAssignTask: (task: TaskNode) => void;
  onTaskDragStart?: (task: TaskNode, event: React.DragEvent) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  searchTerm,
  onToggleNode,
  onAssignTask,
  onTaskDragStart
}) => {
  const filterTasks = (nodes: TaskNode[], term: string): TaskNode[] => {
    if (!term) return nodes;
    
    return nodes.filter(node => {
      const matchesTitle = node.title.toLowerCase().includes(term.toLowerCase());
      const hasMatchingChildren = node.children && filterTasks(node.children, term).length > 0;
      return matchesTitle || hasMatchingChildren;
    }).map(node => ({
      ...node,
      children: node.children ? (node.title.toLowerCase().includes(term.toLowerCase()) ? node.children : filterTasks(node.children, term)) : undefined,
      expanded: term ? true : node.expanded // 검색어가 있을 때는 모든 항목을 펼침
    }));
  };

  const filteredTasks = filterTasks(tasks, searchTerm);

  return (
    <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
      {filteredTasks.length > 0 ? (
        <div className="space-y-1">
          {filteredTasks.map(task => (
            <TaskTreeNode
              key={task.id}
              node={task}
              onToggleNode={onToggleNode}
              onAssignTask={onAssignTask}
              onTaskDragStart={onTaskDragStart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? '검색 결과가 없습니다.' : '등록된 할일이 없습니다.'}
        </div>
      )}
    </div>
  );
};
