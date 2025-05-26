
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Folder, FileText, Search } from 'lucide-react';
import { TaskNode } from '@/types/task';
import { TaskActions } from './TaskActions';

interface TaskTreeProps {
  tasks: TaskNode[];
  typeId: number;
  onToggle: (nodeId: number, typeId: number) => void;
  onEdit: (task: TaskNode) => void;
  onAdd: (parentId: number) => void;
  onDelete: (task: TaskNode) => void;
}

export const TaskTree: React.FC<TaskTreeProps> = ({
  tasks,
  typeId,
  onToggle,
  onEdit,
  onAdd,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredTasks = filterTasks(tasks, searchTerm);

  const renderTaskNode = (node: TaskNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="select-none group">
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
            level > 0 ? 'ml-6' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
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
        
        {hasChildren && node.expanded && (
          <div className="mt-1">
            {node.children!.map(child => renderTaskNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

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
      
      {/* 트리 뷰 */}
      <div className="space-y-1">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => renderTaskNode(task, 0))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? '검색 결과가 없습니다.' : '등록된 과제가 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
};
