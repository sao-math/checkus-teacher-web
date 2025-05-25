import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, ChevronDown, Edit, Trash2, MoreVertical } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { TodoItem } from '../../types';
import { colors } from '../../styles/colors';
import TaskForm from './TaskForm';
import ExcelTaskUploader from './ExcelTaskUploader';
import classNames from 'classnames';

const mockTodoItems: TodoItem[] = [
  {
    id: '1',
    title: '수학',
    description: '기본 수학 과제',
    typeId: '1',
    parentId: null,
    isLeaf: false,
    children: [
      {
        id: '101',
        title: '기초 연산',
        description: '덧셈, 뺄셈, 곱셈, 나눗셈 연습',
        typeId: '1',
        parentId: '1',
        isLeaf: true,
        children: [],
        materials: [],
        createdAt: '2023-03-10T09:15:00Z',
        updatedAt: '2023-04-18T11:45:00Z',
      }
    ],
    materials: [],
    createdAt: '2023-03-05T08:00:00Z',
    updatedAt: '2023-04-17T14:20:00Z',
  }
];

const mockTaskTypes = [
  { id: '1', name: '개념' },
  { id: '2', name: '테스트' },
];

function flattenTodos(todos: TodoItem[], parentTitle = ''): { id: string; displayTitle: string }[] {
  let result: { id: string; displayTitle: string }[] = [];
  for (const todo of todos) {
    const displayTitle = parentTitle ? `${parentTitle} > ${todo.title}` : todo.title;
    result.push({ id: todo.id, displayTitle });
    if (todo.children && todo.children.length > 0) {
      result = [...result, ...flattenTodos(todo.children, displayTitle)];
    }
  }
  return result;
}

interface TodoNodeProps {
  todo: TodoItem;
  level: number;
  onEdit: (todo: TodoItem) => void;
  onDelete: (todo: TodoItem) => void;
  onAdd: (parentId: string | null) => void;
  editingId: string | null;
  addingParentId: string | null;
  onFormSubmit: (mode: string, data: any, parentId: string | null, typeIdFromParent?: string) => void;
  onFormCancel: () => void;
}

const TodoNode: React.FC<TodoNodeProps> = ({ todo, level, onEdit, onDelete, onAdd, editingId, addingParentId, onFormSubmit, onFormCancel }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div 
        className={`
          flex items-center p-3 hover:bg-gray-50 cursor-pointer
          ${level === 0 ? 'bg-gray-50' : ''}
        `}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {todo.children.length > 0 ? (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-6"></div>
        )}
        
        <div className="flex-grow ml-2">
          <div className="font-medium text-gray-900">{todo.title}</div>
          {todo.description && (
            <div className="text-sm text-gray-500">{todo.description}</div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(todo.id);
            }}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo);
            }}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div>
          {addingParentId === todo.id && (
            <TaskForm
              initialData={{}}
              onSubmit={data => onFormSubmit('add', data, todo.id, todo.typeId)}
              onCancel={onFormCancel}
              submitLabel="추가"
            />
          )}
          {editingId === todo.id && (
            <TaskForm
              initialData={todo}
              onSubmit={data => onFormSubmit('edit', data, todo.id, todo.typeId)}
              onCancel={onFormCancel}
              submitLabel="저장"
            />
          )}
          {todo.children.map((child) => (
            <TodoNode
              key={child.id}
              todo={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              editingId={editingId}
              addingParentId={addingParentId}
              onFormSubmit={onFormSubmit}
              onFormCancel={onFormCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const getTasksByType = (todos: TodoItem[], typeId: string): TodoItem[] => {
  return todos.filter(todo => todo.typeId === typeId);
};

const TABS = [
  { key: 'unit', label: '단원·유형별' },
  { key: 'market', label: '시중교재' },
  { key: 'exam', label: '수능/모의고사' },
  { key: 'signature', label: '시그니처 교재' },
  { key: 'school', label: '학교별 기출' },
  { key: 'upload', label: '기출 업로드' },
];

// Helper to build a tree from flat tasks
function buildTaskTree(tasks: TodoItem[]): TodoItem[] {
  const map: { [id: string]: TodoItem & { children: TodoItem[] } } = {};
  const roots: (TodoItem & { children: TodoItem[] })[] = [];
  tasks.forEach((task: TodoItem) => {
    map[task.id] = { ...task, children: [] };
  });
  tasks.forEach((task: TodoItem) => {
    if (task.parentId && map[task.parentId]) {
      map[task.parentId].children.push(map[task.id]);
    } else {
      roots.push(map[task.id]);
    }
  });
  return roots;
}

type TaskTreeNodeProps = {
  node: TodoItem & { children: TodoItem[] };
  onEdit: (id: string) => void;
  onAdd: (parentId: string | null) => void;
  onDelete: (id: string) => void;
  editingId: string | null;
  addingId: string | null;
  addIsLeaf: boolean | null;
  handleLeafChoice: (isLeaf: boolean) => void;
  handleFormSubmit: (mode: string, data: any, parentId: string | null) => void;
  handleFormCancel: () => void;
};

const TaskTreeNode: React.FC<TaskTreeNodeProps> = ({ node, onEdit, onAdd, onDelete, editingId, addingId, addIsLeaf, handleLeafChoice, handleFormSubmit, handleFormCancel }) => {
  const [expanded, setExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="ml-4 mt-2">
      <div className="flex items-center gap-2">
        {node.children.length > 0 && (
          <button className="text-gray-400" onClick={() => setExpanded(e => !e)}>{expanded ? '▼' : '▶'}</button>
        )}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {!node.isLeaf && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd(node.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    하위 항목 추가
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(node.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  수정
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  role="menuitem"
                >
                  삭제
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <span className="font-medium text-gray-900">{node.title}</span>
          {node.description && <span className="ml-2 text-sm text-gray-500">{node.description}</span>}
        </div>
      </div>
      {editingId === node.id && (
        <TaskForm
          initialData={node}
          onSubmit={data => handleFormSubmit('edit', data, node.id)}
          onCancel={handleFormCancel}
          submitLabel="저장"
          forceIsLeaf={node.isLeaf}
        />
      )}
      {addingId === node.id && (
        addIsLeaf === null ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="text-lg font-medium">실제 과제(leaf)로 만들까요?</div>
            <div className="flex gap-4">
              <Button variant="primary" onClick={() => handleLeafChoice(true)}>실제 과제</Button>
              <Button variant="primary" onClick={() => handleLeafChoice(false)}>카테고리</Button>
            </div>
          </div>
        ) : (
          <TaskForm
            initialData={{ isLeaf: addIsLeaf, parentId: node.id }}
            onSubmit={data => handleFormSubmit('add', data, node.id)}
            onCancel={handleFormCancel}
            submitLabel="추가"
            forceIsLeaf={addIsLeaf}
          />
        )
      )}
      {expanded && node.children.map(child => (
        <TaskTreeNode
          key={child.id}
          node={child}
          onEdit={onEdit}
          onAdd={onAdd}
          onDelete={onDelete}
          editingId={editingId}
          addingId={addingId}
          addIsLeaf={addIsLeaf}
          handleLeafChoice={handleLeafChoice}
          handleFormSubmit={handleFormSubmit}
          handleFormCancel={handleFormCancel}
        />
      ))}
    </div>
  );
};

const TodoManagementPage: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>(mockTaskTypes[0].id);
  const [addIsLeaf, setAddIsLeaf] = useState<boolean | null>(null);
  const [showRootAddUI, setShowRootAddUI] = useState<boolean>(false);
  const [view, setView] = useState<'tree' | 'excel'>('tree');

  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTodos(mockTodoItems);
      } catch (error) {
        console.error('Failed to fetch todos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const tasksForType = todos.filter(todo => todo.typeId === selectedTab);
  const tree = buildTaskTree(tasksForType);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setAddingId(null);
    setAddIsLeaf(null);
    setShowRootAddUI(false);
  };
  const handleAdd = (parentId: string | null) => {
    setAddingId(parentId);
    setEditingId(null);
    setAddIsLeaf(null);
    setShowRootAddUI(parentId === null);
  };
  const handleDelete = (id: string) => {
    setTodos(todos.filter(t => t.id !== id && t.parentId !== id)); // simple delete, remove children too
  };
  const handleFormSubmit = (mode: string, data: any, parentId: string | null) => {
    if (mode === 'add') {
      const newTodo: TodoItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: data.title,
        description: data.description,
        typeId: selectedTab,
        parentId: parentId,
        isLeaf: data.isLeaf,
        materials: data.materials,
        children: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTodos(prev => [...prev, newTodo]);
    } else if (mode === 'edit') {
      setTodos(prev => prev.map(t => t.id === parentId ? { ...t, ...data, updatedAt: new Date().toISOString() } : t));
    }
    setEditingId(null);
    setAddingId(null);
    setAddIsLeaf(null);
    setShowRootAddUI(false);
  };
  const handleFormCancel = () => {
    setEditingId(null);
    setAddingId(null);
    setAddIsLeaf(null);
    setShowRootAddUI(false);
  };
  const handleLeafChoice = (isLeaf: boolean) => {
    setAddIsLeaf(isLeaf);
  };

  const handleTasksUploaded = (newTasks: Partial<TodoItem>[]) => {
    // 엑셀에서 업로드된 작업을 처리
    const createdTasks: TodoItem[] = newTasks.map(task => ({
      id: Math.random().toString(36).substr(2, 9),
      title: task.title || '제목 없음',
      description: task.description || '',
      typeId: selectedTab,
      parentId: task.parentId || null,
      isLeaf: task.isLeaf || false,
      materials: task.materials || [],
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setTodos(prev => [...prev, ...createdTasks]);
  };

  return (
    <AppLayout title="할일 DB 관리">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-2">
        {mockTaskTypes.map(tab => (
          <button
            key={tab.id}
            className={classNames(
              'px-6 py-3 text-lg focus:outline-none',
              selectedTab === tab.id ? 'font-bold border-b-2 border-black' : 'text-gray-500',
            )}
            onClick={() => { setSelectedTab(tab.id); setEditingId(null); setAddingId(null); }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              view === 'tree'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
            onClick={() => setView('tree')}
          >
            트리 뷰
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              view === 'excel'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300 border-l-0`}
            onClick={() => setView('excel')}
          >
            엑셀 업로드
          </button>
        </div>
      </div>

      {/* Content based on view */}
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {view === 'tree' ? (
            <div className={`bg-${colors.background2} shadow-sm rounded-lg overflow-x-auto`}>
              <div className="p-6">
                <div>
                  {tree.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">등록된 할일이 없습니다.</div>
                  ) : (
                    tree.map(node => (
                      <TaskTreeNode
                        key={node.id}
                        node={node}
                        onEdit={handleEdit}
                        onAdd={handleAdd}
                        onDelete={handleDelete}
                        editingId={editingId}
                        addingId={addingId}
                        addIsLeaf={addIsLeaf}
                        handleLeafChoice={handleLeafChoice}
                        handleFormSubmit={handleFormSubmit}
                        handleFormCancel={handleFormCancel}
                      />
                    ))
                  )}
                </div>
                {/* 새 할일 추가 button at the bottom, left-aligned */}
                <div className="mt-6 flex justify-start">
                  <Button variant="primary" onClick={() => handleAdd(null)} className="inline-flex items-center">
                    <Plus size={16} className="mr-2" />
                    <span>새 할일 추가</span>
                  </Button>
                </div>
                
                {/* 루트 레벨에서 새 할일 추가 시 표시되는 UI */}
                {showRootAddUI && addIsLeaf === null && (
                  <div className="mt-4 flex flex-col items-center gap-4 py-4 border border-gray-200 rounded-md">
                    <div className="text-lg font-medium">실제 과제(leaf)로 만들까요?</div>
                    <div className="flex gap-4">
                      <Button variant="primary" onClick={() => handleLeafChoice(true)} className="inline-flex items-center">
                        <span>실제 과제</span>
                      </Button>
                      <Button variant="primary" onClick={() => handleLeafChoice(false)} className="inline-flex items-center">
                        <span>카테고리</span>
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* 선택 후 표시되는 폼 */}
                {showRootAddUI && addIsLeaf !== null && (
                  <div className="mt-4 border border-gray-200 rounded-md p-4">
                    <TaskForm
                      initialData={{ isLeaf: addIsLeaf, parentId: null }}
                      onSubmit={data => handleFormSubmit('add', data, null)}
                      onCancel={handleFormCancel}
                      submitLabel="추가"
                      forceIsLeaf={addIsLeaf}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ExcelTaskUploader 
              onTasksUploaded={handleTasksUploaded} 
              typeId={selectedTab} 
            />
          )}
        </>
      )}
    </AppLayout>
  );
};

export default TodoManagementPage;