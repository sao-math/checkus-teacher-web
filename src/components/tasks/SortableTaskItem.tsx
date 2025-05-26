
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Folder, FileText, GripVertical } from 'lucide-react';
import { TaskNode } from '@/types/task';
import { TaskActions } from './TaskActions';

interface SortableTaskItemProps {
  node: TaskNode;
  level: number;
  onToggle: (nodeId: number, typeId: number) => void;
  onEdit: (task: TaskNode) => void;
  onAdd: (parentId: number) => void;
  onDelete: (task: TaskNode) => void;
  typeId: number;
  children?: React.ReactNode;
}

export const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  node,
  level,
  onToggle,
  onEdit,
  onAdd,
  onDelete,
  typeId,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div ref={setNodeRef} style={style} className="select-none group">
      <div 
        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
          level > 0 ? 'ml-6' : ''
        }`}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
      >
        {/* 드래그 핸들 */}
        <div 
          {...attributes} 
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        <div className="flex items-center flex-1 gap-2">
          {hasChildren ? (
            <button
              onClick={() => onToggle(node.id, typeId)}
              className="text-gray-500 hover:text-gray-700"
            >
              {node.expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
          
          {/* 아이콘으로 분류/실제 과제 구분 */}
          {node.isLeaf ? (
            <FileText className="h-4 w-4 text-blue-600" />
          ) : (
            <Folder className="h-4 w-4 text-amber-600" />
          )}
          
          <span className={`${node.isLeaf ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
            {node.title}
          </span>

          {/* 참고자료 개수 표시 */}
          {node.isLeaf && node.references && node.references.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              참고자료 {node.references.length}개
            </Badge>
          )}
        </div>
        
        <TaskActions
          task={node}
          onEdit={onEdit}
          onAdd={onAdd}
          onDelete={onDelete}
        />
      </div>
      
      {children}
    </div>
  );
};
