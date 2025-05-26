import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Download, Upload, CheckSquare, Settings } from 'lucide-react';
import { TaskForm } from '@/components/tasks/TaskForm';
import { DeleteConfirmDialog } from '@/components/tasks/DeleteConfirmDialog';
import { ExcelUploadDialog } from '@/components/tasks/ExcelUploadDialog';
import { CategoryEditDialog } from '@/components/tasks/CategoryEditDialog';
import { DraggableTaskTree } from '@/components/tasks/DraggableTaskTree';
import { useTaskManagement } from '@/hooks/useTaskManagement';

const TaskManagement = () => {
  const {
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
  } = useTaskManagement();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">할일 DB 관리</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-gray-300"
            onClick={() => setShowCategoryEdit(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            카테고리 편집
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-300"
            onClick={() => setShowExcelUpload(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Excel 업로드
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-300"
            onClick={handleExcelDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Excel 다운로드
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleAddTask()}
          >
            <Plus className="h-4 w-4 mr-2" />
            새 할일 추가
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>할일 카테고리</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${taskTypes.length}, 1fr)` }}>
              {taskTypes.map((type) => (
                <TabsTrigger key={type.id} value={type.id.toString()}>
                  {type.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {taskTypes.map((type) => (
              <TabsContent key={type.id} value={type.id.toString()} className="mt-6">
                <div className="space-y-2">
                  {tasksByType[type.id]?.length > 0 ? (
                    <DraggableTaskTree
                      tasks={tasksByType[type.id]}
                      typeId={type.id}
                      onToggle={toggleNode}
                      onEdit={handleEditTask}
                      onAdd={handleAddTask}
                      onDelete={handleDeleteTask}
                      onMove={handleMoveTask}
                    />
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-gray-500">
                        <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">아직 {type.name} 할일이 없습니다</h3>
                        <p className="text-sm">새로운 할일을 추가하여 시작하세요</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        task={editingTask}
        parentTask={parentTask}
        onSave={handleSaveTask}
      />

      <DeleteConfirmDialog
        open={!!deletingTask}
        onOpenChange={() => setDeletingTask(null)}
        taskTitle={deletingTask?.title || ''}
        onConfirm={confirmDelete}
      />

      <ExcelUploadDialog
        open={showExcelUpload}
        onOpenChange={setShowExcelUpload}
        onUpload={handleExcelUpload}
        onTemplateDownload={handleTemplateDownload}
      />

      <CategoryEditDialog
        open={showCategoryEdit}
        onOpenChange={setShowCategoryEdit}
        categories={taskTypes}
        onSave={handleSaveCategories}
      />
    </div>
  );
};

export default TaskManagement;
