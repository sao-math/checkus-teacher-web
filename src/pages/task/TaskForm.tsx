import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { TodoItem } from '../../types';

interface TaskFormProps {
  initialData?: Partial<TodoItem>;
  onSubmit: (data: Omit<TodoItem, 'id' | 'children' | 'createdAt' | 'updatedAt' | 'parentId' | 'typeId'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  forceIsLeaf?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = '저장',
  forceIsLeaf,
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [isLeaf, setIsLeaf] = useState(forceIsLeaf !== undefined ? forceIsLeaf : initialData.isLeaf || false);
  const [materials, setMaterials] = useState<{
    title: string;
    isVideo: boolean;
    completionCondition: string;
  }[]>(initialData.materials || []);
  const [error, setError] = useState('');

  useEffect(() => {
    if (forceIsLeaf !== undefined) {
      setIsLeaf(forceIsLeaf);
    }
  }, [forceIsLeaf]);

  const addMaterial = () => {
    setMaterials([...materials, { title: '', isVideo: false, completionCondition: '' }]);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: string, value: string | boolean) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setMaterials(newMaterials);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('제목을 입력하세요.');
      return;
    }
    setError('');
    onSubmit({
      title,
      description,
      isLeaf,
      materials,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-md mt-2">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-2 text-sm text-red-700">{error}</div>
      )}
      <Input
        id="title"
        label="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        fullWidth
        placeholder="할일 제목"
      />
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="할일에 대한 상세 설명을 입력하세요"
        />
      </div>
      {isLeaf && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              학습 자료
            </label>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={addMaterial}
            >
              자료 추가
            </Button>
          </div>
          {materials.map((material, index) => (
            <div key={index} className="mb-2 p-2 border border-gray-200 rounded-md">
              <div className="flex justify-between mb-1">
                <h4 className="text-xs font-medium text-gray-700">자료 {index + 1}</h4>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeMaterial(index)}
                >
                  삭제
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  value={material.title}
                  onChange={(e) => updateMaterial(index, 'title', e.target.value)}
                  placeholder="자료 제목"
                  required
                  fullWidth
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={material.isVideo}
                    onChange={(e) => updateMaterial(index, 'isVideo', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-xs text-gray-900">
                    영상 자료
                  </label>
                </div>
                <Input
                  value={material.completionCondition}
                  onChange={(e) => updateMaterial(index, 'completionCondition', e.target.value)}
                  placeholder="완료 조건 (예: 전체 풀이 완료, 시청 완료)"
                  fullWidth
                />
              </div>
            </div>
          ))}
          {materials.length === 0 && (
            <div className="text-center py-3 text-gray-500 border border-dashed border-gray-300 rounded-md">
              학습 자료가 아직 없습니다. '자료 추가'를 클릭하여 추가하세요.
            </div>
          )}
        </div>
      )}
      <div className="flex justify-end space-x-2 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm; 