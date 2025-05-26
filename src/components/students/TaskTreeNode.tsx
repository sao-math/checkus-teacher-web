import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Plus, GripVertical } from 'lucide-react';
import { TaskNode } from '@/types/task';

interface TaskTreeNodeProps {
  node: TaskNode;
  level?: number;
  onToggleNode: (nodeId: number) => void;
  onAssignTask: (task: TaskNode) => void;
  onTaskDragStart?: (task: TaskNode, event: React.DragEvent) => void;
}

export const TaskTreeNode: React.FC<TaskTreeNodeProps> = ({
  node,
  level = 0,
  onToggleNode,
  onAssignTask,
  onTaskDragStart
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const paddingLeft = level * 16;

  const handleDragStart = (e: React.DragEvent) => {
    console.log('Drag started for task:', node.title);
    
    if (node.isLeaf && onTaskDragStart) {
      onTaskDragStart(node, e);
      e.dataTransfer.setData('application/json', JSON.stringify(node));
      e.dataTransfer.effectAllowed = 'copy';
      
      // 드래그 이미지 설정
      const dragImage = document.createElement('div');
      dragImage.textContent = node.title;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.style.background = 'white';
      dragImage.style.padding = '8px';
      dragImage.style.border = '1px solid #ccc';
      dragImage.style.borderRadius = '4px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };

  return (
    <div>
      <div 
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors ${
          node.isLeaf ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        }`}
        style={{ paddingLeft: paddingLeft + 12 }}
        draggable={node.isLeaf}
        onDragStart={handleDragStart}
        onClick={() => !node.isLeaf && hasChildren && onToggleNode(node.id)}
      >
        {node.isLeaf && (
          <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
        
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleNode(node.id);
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {node.expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}

        {!hasChildren && !node.isLeaf && (
          <div className="w-6 h-6 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm truncate ${node.isLeaf ? 'font-medium' : 'font-semibold'}`}>
              {node.title}
            </span>
          </div>
          {node.description && node.isLeaf && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {node.description}
            </p>
          )}
        </div>

        {node.isLeaf && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onAssignTask(node);
            }}
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {hasChildren && node.expanded && (
        <div>
          {node.children?.map((child) => (
            <TaskTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onToggleNode={onToggleNode}
              onAssignTask={onAssignTask}
              onTaskDragStart={onTaskDragStart}
            />
          ))}
        </div>
      )}
    </div>
  );
};
