import { useTaskState } from './useTaskState';
import { useTaskDialogs } from './useTaskDialogs';
import { useTaskActions } from './useTaskActions';

export const useTaskManagement = () => {
  const {
    tasksByType,
    setTasksByType,
    taskTypes,
    setTaskTypes,
    activeTab,
    setActiveTab,
  } = useTaskState();

  const {
    editingTask,
    setEditingTask,
    deletingTask,
    setDeletingTask,
    showTaskForm,
    setShowTaskForm,
    showExcelUpload,
    setShowExcelUpload,
    showCategoryEdit,
    setShowCategoryEdit,
    parentTask,
    setParentTask,
  } = useTaskDialogs();

  const {
    toggleNode,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    handleMoveTask,
    handleSaveTask: handleSaveTaskAction,
    confirmDelete: confirmDeleteAction,
    handleSaveCategories,
    handleExcelDownload,
    handleExcelUpload,
    handleTemplateDownload,
  } = useTaskActions({
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
  });

  const handleSaveTask = (taskData: Partial<any>) => {
    handleSaveTaskAction(taskData, editingTask, parentTask);
  };

  const confirmDelete = () => {
    confirmDeleteAction(deletingTask);
  };

  return {
    tasksByType,
    taskTypes,
    activeTab,
    setActiveTab,
    editingTask,
    deletingTask,
    showTaskForm,
    showExcelUpload,
    showCategoryEdit,
    parentTask,
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
    setShowTaskForm,
    setShowExcelUpload,
    setShowCategoryEdit,
    setDeletingTask,
  };
};
