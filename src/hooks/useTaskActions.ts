import { TaskNode, TaskType } from '@/types/task';
import { useToast } from '@/hooks/use-toast';
import { getMaxId, findTaskById, updateNodeRecursively, removeTaskRecursively, addTaskToParent, moveTaskToNewParent } from '@/utils/taskUtils';
import * as XLSX from 'xlsx';

interface UseTaskActionsProps {
  tasksByType: { [key: number]: TaskNode[] };
  setTasksByType: React.Dispatch<React.SetStateAction<{ [key: number]: TaskNode[] }>>;
  activeTab: string;
  setEditingTask: (task: TaskNode | null) => void;
  setParentTask: (task: TaskNode | null) => void;
  setShowTaskForm: (show: boolean) => void;
  setDeletingTask: (task: TaskNode | null) => void;
  setTaskTypes: (types: TaskType[]) => void;
  setActiveTab: (tab: string) => void;
  setShowExcelUpload: (show: boolean) => void;
  taskTypes: TaskType[];
}

export const useTaskActions = ({
  tasksByType,
  setTasksByType,
  activeTab,
  setEditingTask,
  setParentTask,
  setShowTaskForm,
  setDeletingTask,
  setTaskTypes,
  setActiveTab,
  setShowExcelUpload,
  taskTypes,
}: UseTaskActionsProps) => {
  const { toast } = useToast();

  const toggleNode = (nodeId: number, typeId: number) => {
    setTasksByType(prev => ({
      ...prev,
      [typeId]: updateNodeRecursively(prev[typeId] || [], nodeId, node => ({ ...node, expanded: !node.expanded }))
    }));
  };

  const handleAddTask = (parentId?: number) => {
    const parent = parentId ? findTaskById(tasksByType[Number(activeTab)] || [], parentId) : null;
    setParentTask(parent);
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: TaskNode) => {
    setEditingTask(task);
    setParentTask(null);
    setShowTaskForm(true);
  };

  const handleDeleteTask = (task: TaskNode) => {
    setDeletingTask(task);
  };

  const handleMoveTask = (draggedId: number, targetId: number | null, typeId: number) => {
    setTasksByType(prev => ({
      ...prev,
      [typeId]: moveTaskToNewParent(prev[typeId] || [], draggedId, targetId)
    }));

    toast({
      title: "성공",
      description: "할일이 이동되었습니다.",
    });
  };

  const handleSaveTask = (taskData: Partial<TaskNode>, editingTask: TaskNode | null, parentTask: TaskNode | null) => {
    const typeId = Number(activeTab);
    
    if (editingTask) {
      if (taskData.isLeaf && editingTask.children && editingTask.children.length > 0) {
        toast({
          title: "변경 불가",
          description: "하위 항목이 있는 분류는 실제 과제로 변경할 수 없습니다.",
          variant: "destructive"
        });
        return;
      }

      setTasksByType(prev => ({
        ...prev,
        [typeId]: updateNodeRecursively(prev[typeId] || [], editingTask.id, node => ({ 
          ...node, 
          ...taskData,
          children: taskData.isLeaf ? undefined : node.children
        }))
      }));

      toast({
        title: "성공",
        description: `${taskData.isLeaf ? '실제 과제' : '분류'}가 수정되었습니다.`,
      });
    } else {
      const newId = Math.max(...Object.values(tasksByType).flat().map(getMaxId)) + 1;
      const newTask: TaskNode = {
        id: newId,
        title: taskData.title || '',
        description: taskData.description,
        typeId,
        parentId: parentTask?.id,
        isLeaf: taskData.isLeaf || false,
        children: taskData.isLeaf ? undefined : [],
        expanded: false,
        references: taskData.isLeaf ? (taskData.references || []) : undefined
      };

      if (parentTask) {
        setTasksByType(prev => ({
          ...prev,
          [typeId]: addTaskToParent(prev[typeId] || [], parentTask.id, newTask)
        }));
      } else {
        setTasksByType(prev => ({
          ...prev,
          [typeId]: [...(prev[typeId] || []), newTask]
        }));
      }

      toast({
        title: "성공",
        description: `새 ${taskData.isLeaf ? '실제 과제' : '분류'}가 추가되었습니다.`,
      });
    }

    setShowTaskForm(false);
    setEditingTask(null);
    setParentTask(null);
  };

  const confirmDelete = (deletingTask: TaskNode | null) => {
    if (!deletingTask) return;

    const typeId = Number(activeTab);
    
    setTasksByType(prev => ({
      ...prev,
      [typeId]: removeTaskRecursively(prev[typeId] || [], deletingTask.id)
    }));

    toast({
      title: "성공",
      description: "할일이 삭제되었습니다.",
    });

    setDeletingTask(null);
  };

  const handleSaveCategories = (categories: TaskType[]) => {
    setTaskTypes(categories);
    
    if (!categories.find(cat => cat.id.toString() === activeTab)) {
      setActiveTab(categories[0]?.id.toString() || '1');
    }

    toast({
      title: "성공",
      description: "카테고리가 저장되었습니다.",
    });
  };

  const handleExcelDownload = () => {
    try {
      console.log('Starting Excel download...');
      console.log('Task Types:', taskTypes);
      console.log('Tasks by Type:', tasksByType);

      // 모든 할일 데이터를 평탄화된 배열로 변환
      const flattenTasks = (nodes: TaskNode[], parentPath: string = ''): any[] => {
        if (!Array.isArray(nodes)) {
          console.error('Invalid nodes array:', nodes);
          return [];
        }

        return nodes.flatMap(node => {
          if (!node || typeof node !== 'object') {
            console.error('Invalid node:', node);
            return [];
          }

          const currentPath = parentPath ? `${parentPath} > ${node.title}` : node.title;
          const typeName = taskTypes?.find(t => t.id === node.typeId)?.name || '';
          
          // 기본 할일 데이터
          const taskData = {
            '카테고리': typeName,
            '상위할일ID': node.parentId || '',
            '할일ID': node.id,
            '제목': node.title || '',
            '설명': node.description || '',
            '실제과제여부': node.isLeaf ? 'Y' : 'N',
            '완료조건': '없음',
            '자료URL1': '',
            '영상여부1': '',
            '자료URL2': '',
            '영상여부2': '',
            '자료URL3': '',
            '영상여부3': ''
          };

          // 자료가 있는 경우 자료 정보 추가
          if (node.references && node.references.length > 0) {
            const references = node.references.slice(0, 3); // 최대 3개의 자료만 사용
            references.forEach((ref, index) => {
              taskData[`자료URL${index + 1}`] = ref.url || '';
              taskData[`영상여부${index + 1}`] = ref.isVideo ? 'Y' : 'N';
            });
            if (references.length > 0) {
              taskData['완료조건'] = references[0].completionCondition || '없음';
            }
          }

          // 자식 할일이 있는 경우 재귀적으로 처리
          const result = [taskData];
          if (node.children && Array.isArray(node.children)) {
            return [...result, ...flattenTasks(node.children, currentPath)];
          }

          return result;
        });
      };

      // 각 타입별로 워크시트 생성
      const workbook = XLSX.utils.book_new();
      
      Object.entries(tasksByType).forEach(([typeId, tasks]) => {
        console.log(`Processing type ${typeId}:`, tasks);
        const typeName = taskTypes?.find(t => t.id.toString() === typeId)?.name || `할일 유형 ${typeId}`;
        const flattenedTasks = flattenTasks(tasks);
        console.log(`Flattened tasks for ${typeName}:`, flattenedTasks);

        if (flattenedTasks.length === 0) {
          console.warn(`No tasks found for type ${typeName}`);
          return;
        }

        const worksheet = XLSX.utils.json_to_sheet(flattenedTasks);
        
        // 열 너비 설정
        const colWidths = [
          { wch: 15 },  // 카테고리
          { wch: 10 },  // 상위할일ID
          { wch: 10 },  // 할일ID
          { wch: 30 },  // 제목
          { wch: 40 },  // 설명
          { wch: 10 },  // 실제과제여부
          { wch: 15 },  // 완료조건
          { wch: 50 },  // 자료URL1
          { wch: 10 },  // 영상여부1
          { wch: 50 },  // 자료URL2
          { wch: 10 },  // 영상여부2
          { wch: 50 },  // 자료URL3
          { wch: 10 }   // 영상여부3
        ];
        worksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, typeName);
      });

      // Excel 파일을 Blob으로 변환
      console.log('Converting workbook to blob...');
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });

      // 다운로드 링크 생성 및 클릭
      console.log('Creating download link...');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '할일_목록.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Download completed successfully');
      toast({
        title: "다운로드 완료",
        description: "할일 목록이 Excel 파일로 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('Excel 다운로드 중 오류 발생:', error);
      console.error('Error details:', {
        error,
        taskTypes,
        tasksByType,
        activeTab
      });
      toast({
        title: "오류 발생",
        description: "Excel 파일 다운로드 중 문제가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleTemplateDownload = () => {
    try {
      // 빈 템플릿 데이터 생성
      const templateData = [{
        '카테고리': '',
        '상위할일ID': '',
        '할일ID': '',
        '제목': '',
        '설명': '',
        '실제과제여부': '',
        '완료조건': '',
        '자료URL1': '',
        '영상여부1': '',
        '자료URL2': '',
        '영상여부2': '',
        '자료URL3': '',
        '영상여부3': ''
      }];

      // 워크시트 생성
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      // 열 너비 설정
      const colWidths = [
        { wch: 15 },  // 카테고리
        { wch: 10 },  // 상위할일ID
        { wch: 10 },  // 할일ID
        { wch: 30 },  // 제목
        { wch: 40 },  // 설명
        { wch: 10 },  // 실제과제여부
        { wch: 15 },  // 완료조건
        { wch: 50 },  // 자료URL1
        { wch: 10 },  // 영상여부1
        { wch: 50 },  // 자료URL2
        { wch: 10 },  // 영상여부2
        { wch: 50 },  // 자료URL3
        { wch: 10 }   // 영상여부3
      ];
      worksheet['!cols'] = colWidths;

      // 워크북 생성 및 워크시트 추가
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '할일_템플릿');

      // Excel 파일을 Blob으로 변환
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });

      // 다운로드 링크 생성 및 클릭
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '할일_템플릿.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "다운로드 완료",
        description: "할일 템플릿이 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('템플릿 다운로드 중 오류 발생:', error);
      toast({
        title: "오류 발생",
        description: "템플릿 다운로드 중 문제가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleExcelUpload = (file: File) => {
    console.log('Uploading file:', file.name);
    toast({
      title: "업로드 완료",
      description: `${file.name} 파일이 업로드되었습니다.`,
    });
    setShowExcelUpload(false);
  };

  return {
    toggleNode,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    handleMoveTask,
    handleSaveTask,
    confirmDelete,
    handleSaveCategories,
    handleExcelDownload,
    handleExcelUpload,
    handleTemplateDownload,
  };
};
