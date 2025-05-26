
import React from 'react';

export const TaskSidebarHeader: React.FC = () => {
  return (
    <div className="pb-4 border-b">
      <h2 className="text-lg font-semibold text-gray-900">할일 추가</h2>
      <p className="text-sm text-gray-500 mt-1">
        기존 할일을 배정하거나 새로운 할일을 만들어 학생에게 배정할 수 있습니다.
      </p>
    </div>
  );
};
