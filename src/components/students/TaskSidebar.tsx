import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TaskNode, TaskType } from '@/types/task';
import { TaskSidebarHeader } from './TaskSidebarHeader';
import { TaskTabNavigation } from './TaskTabNavigation';
import { TaskTypeTabContent } from './TaskTypeTabContent';
import { NewTaskForm } from './NewTaskForm';

interface TaskSidebarProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  onTaskDragStart?: (task: TaskNode, event: React.DragEvent) => void;
}

// Mock task types and tasks
const mockTaskTypes: TaskType[] = [
  { id: 1, name: '개념' },
  { id: 2, name: '테스트' },
];

const mockTasks: TaskNode[] = [
  {
    id: 1,
    title: '수학',
    typeId: 1,
    isLeaf: false,
    expanded: true,
    children: [
      {
        id: 2,
        title: '미적분',
        typeId: 1,
        parentId: 1,
        isLeaf: false,
        expanded: false,
        children: [
          { 
            id: 3, 
            title: '극한의 개념', 
            typeId: 1, 
            parentId: 2, 
            isLeaf: true,
            description: '함수의 극한에 대한 기본 개념을 학습합니다.'
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: '영어',
    typeId: 1,
    isLeaf: false,
    expanded: true,
    children: [
      { 
        id: 5, 
        title: '문법 연습', 
        typeId: 1, 
        parentId: 4, 
        isLeaf: true,
        description: '기본 문법 구조를 학습합니다.'
      },
      { 
        id: 6, 
        title: '단어 암기', 
        typeId: 1, 
        parentId: 4, 
        isLeaf: true,
        description: '필수 어휘를 학습합니다.'
      }
    ]
  }
];

export const TaskSidebar: React.FC<TaskSidebarProps> = ({ 
  open, 
  onClose, 
  studentId, 
  onTaskDragStart 
}) => {
  // 탭별로 할일 관리
  const [tasksByType, setTasksByType] = useState<{ [key: string]: TaskNode[] }>({
    1: mockTasks, // 개념
    2: [],        // 테스트
  });
  const [activeTab, setActiveTab] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const handleDragStart = (task: TaskNode, event: React.DragEvent) => {
    if (onTaskDragStart) {
      onTaskDragStart(task, event);
    }
    
    // 드래그 이미지 설정
    const dragImage = document.createElement('div');
    dragImage.textContent = task.title;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.background = 'white';
    dragImage.style.padding = '8px';
    dragImage.style.border = '1px solid #ccc';
    dragImage.style.borderRadius = '4px';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const toggleNode = (nodeId: number) => {
    const updateNodeRecursively = (nodes: TaskNode[]): TaskNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNodeRecursively(node.children) };
        }
        return node;
      });
    };
    setTasksByType(prev => ({
      ...prev,
      [activeTab]: updateNodeRecursively(prev[activeTab] || [])
    }));
  };

  const handleAssignTask = (task: TaskNode) => {
    console.log('Assign task to student:', task, studentId);
    onClose();
  };

  const handleCreateNewTask = () => {
    if (!newTaskTitle.trim()) return;

    // 새 할일을 현재 탭에 추가
    setTasksByType(prev => ({
      ...prev,
      [activeTab]: [
        ...prev[activeTab],
        {
          id: Date.now(),
          title: newTaskTitle,
          typeId: Number(activeTab),
          isLeaf: true,
        }
      ]
    }));

    setNewTaskTitle('');
    setNewTaskDescription('');
    onClose();
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full bg-white border-l shadow-xl transition-transform duration-300 ease-in-out z-50 ${
        open ? 'translate-x-0' : 'translate-x-full'
      } w-[400px] sm:w-[540px]`}
    >
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <TaskSidebarHeader />

          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TaskTabNavigation 
                taskTypes={mockTaskTypes}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {mockTaskTypes.map((type) => (
                <TabsContent key={type.id} value={type.id.toString()}>
                  <TaskTypeTabContent
                    tasks={tasksByType[type.id] || []}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onToggleNode={toggleNode}
                    onAssignTask={handleAssignTask}
                    onTaskDragStart={handleDragStart}
                  />
                </TabsContent>
              ))}

              <TabsContent value="new">
                <NewTaskForm
                  title={newTaskTitle}
                  description={newTaskDescription}
                  onTitleChange={setNewTaskTitle}
                  onDescriptionChange={setNewTaskDescription}
                  onCreateTask={handleCreateNewTask}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 text-center">
              💡 할일을 드래그해서 달력의 원하는 날짜에 드롭하세요!
            </p>
          </div>
        </div>
      </div>
      
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
