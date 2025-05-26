
import { useState } from 'react';
import { TaskNode, TaskType } from '@/types/task';

const defaultTaskTypes: TaskType[] = [
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
        expanded: true,
        children: [
          { 
            id: 3, 
            title: '극한의 개념', 
            typeId: 1, 
            parentId: 2, 
            isLeaf: true,
            description: '함수의 극한에 대한 기본 개념을 학습합니다.',
            references: [
              {
                id: 1,
                title: '극한의 정의 강의',
                isVideo: true,
                completionCondition: '강의를 끝까지 시청하고 예제 문제 3개 풀기'
              }
            ]
          },
          { 
            id: 4, 
            title: '도함수의 정의', 
            typeId: 1, 
            parentId: 2, 
            isLeaf: true,
            description: '미분의 정의와 기본 공식을 익힙니다.',
            references: []
          },
          { 
            id: 5, 
            title: '적분의 기본 정리', 
            typeId: 1, 
            parentId: 2, 
            isLeaf: true,
            description: '적분과 미분의 관계를 이해합니다.',
            references: []
          },
        ]
      },
      {
        id: 6,
        title: '확률과 통계',
        typeId: 1,
        parentId: 1,
        isLeaf: false,
        expanded: false,
        children: [
          { 
            id: 7, 
            title: '확률의 정의', 
            typeId: 1, 
            parentId: 6, 
            isLeaf: true,
            description: '확률의 기본 정의와 성질을 학습합니다.',
            references: []
          },
          { 
            id: 8, 
            title: '조건부 확률', 
            typeId: 1, 
            parentId: 6, 
            isLeaf: true,
            description: '조건부 확률과 베이즈 정리를 이해합니다.',
            references: []
          },
        ]
      }
    ]
  },
  {
    id: 9,
    title: '영어',
    typeId: 1,
    isLeaf: false,
    expanded: true,
    children: [
      {
        id: 10,
        title: '문법',
        typeId: 1,
        parentId: 9,
        isLeaf: false,
        expanded: false,
        children: [
          { 
            id: 11, 
            title: '현재완료시제', 
            typeId: 1, 
            parentId: 10, 
            isLeaf: true,
            description: '현재완료시제의 용법과 예문을 학습합니다.',
            references: []
          },
          { 
            id: 12, 
            title: '관계대명사', 
            typeId: 1, 
            parentId: 10, 
            isLeaf: true,
            description: '관계대명사의 종류와 사용법을 익힙니다.',
            references: []
          },
        ]
      }
    ]
  }
];

export const useTaskState = () => {
  const [tasksByType, setTasksByType] = useState<{ [key: number]: TaskNode[] }>({
    1: mockTasks,
    2: []
  });
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(defaultTaskTypes);
  const [activeTab, setActiveTab] = useState('1');

  return {
    tasksByType,
    setTasksByType,
    taskTypes,
    setTaskTypes,
    activeTab,
    setActiveTab,
  };
};
