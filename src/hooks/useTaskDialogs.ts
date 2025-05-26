
import { useState } from 'react';
import { TaskNode } from '@/types/task';

export const useTaskDialogs = () => {
  const [editingTask, setEditingTask] = useState<TaskNode | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskNode | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [showCategoryEdit, setShowCategoryEdit] = useState(false);
  const [parentTask, setParentTask] = useState<TaskNode | null>(null);

  return {
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
  };
};
