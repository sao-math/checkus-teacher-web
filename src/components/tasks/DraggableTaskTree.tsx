
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Folder, FileText, Search, GripVertical } from 'lucide-react';
import { TaskNode } from '@/types/task';
import { TaskActions } from './TaskActions';
import { SortableTaskItem } from './SortableTaskItem';

interface DraggableTaskTreeProps {
  tasks: TaskNode[];
  typeId: number;
  onToggle: (nodeId: number, typeId: number) => void;
  onEdit: (task: TaskNode) => void;
  onAdd: (parentId: number) => void;
  onDelete: (task: TaskNode) => void;
  onMove: (draggedId: number, targetId: number | null, typeId: number) => void;
}

export const DraggableTaskTree: React.FC<DraggableTaskTreeProps> = ({
  tasks,
  typeId,
  onToggle,
  onEdit,
  onAdd,
  onDelete,
  onMove,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filterTasks = (nodes: TaskNode[], term: string): TaskNode[] => {
    if (!term) return nodes;
    
    return nodes.filter(node => {
      const matchesTitle = node.title.toLowerCase().includes(term.toLowerCase());
      const hasMatchingChildren = node.children && filterTasks(node.children, term).length > 0;
      return matchesTitle || hasMatchingChildren;
    }).map(node => ({
      ...node,
      children: node.children ? filterTasks(node.children, term) : undefined
    }));
  };

  const getAllTaskIds = (nodes: TaskNode[]): string[] => {
    const ids: string[] = [];
    nodes.forEach(node => {
      ids.push(node.id.toString());
      if (node.children) {
        ids.push(...getAllTaskIds(node.children));
      }
    });
    return ids;
  };

  const findTaskById = (nodes: TaskNode[], id: string): TaskNode | null => {
    for (const node of nodes) {
      if (node.id.toString() === id) return node;
      if (node.children) {
        const found = findTaskById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const filteredTasks = filterTasks(tasks, searchTerm);
  const taskIds = getAllTaskIds(filteredTasks);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const draggedId = parseInt(active.id as string);
      const targetId = over?.id ? parseInt(over.id as string) : null;
      onMove(draggedId, targetId, typeId);
    }
    
    setActiveId(null);
  };

  const renderTaskNode = (node: TaskNode, level: number = 0) => {
    return (
      <SortableTaskItem
        key={node.id}
        node={node}
        level={level}
        onToggle={onToggle}
        onEdit={onEdit}
        onAdd={onAdd}
        onDelete={onDelete}
        typeId={typeId}
      >
        {node.children && node.expanded && (
          <div className="mt-1">
            {node.children.map(child => renderTaskNode(child, level + 1))}
          </div>
        )}
      </SortableTaskItem>
    );
  };

  const draggedTask = activeId ? findTaskById(filteredTasks, activeId) : null;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* 검색 기능 */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="과제 또는 분류 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => renderTaskNode(task, 0))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 과제가 없습니다.'}
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {draggedTask ? (
            <div className="flex items-center gap-2 p-2 bg-white border rounded-lg shadow-lg opacity-90">
              <GripVertical className="h-4 w-4 text-gray-400" />
              {draggedTask.isLeaf ? (
                <FileText className="h-4 w-4 text-blue-600" />
              ) : (
                <Folder className="h-4 w-4 text-amber-600" />
              )}
              <span className={`${draggedTask.isLeaf ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
                {draggedTask.title}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
