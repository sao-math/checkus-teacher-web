
import { TaskNode } from '@/types/task';

export const getMaxId = (task: TaskNode): number => {
  let maxId = task.id;
  if (task.children) {
    for (const child of task.children) {
      maxId = Math.max(maxId, getMaxId(child));
    }
  }
  return maxId;
};

export const findTaskById = (nodes: TaskNode[], taskId: number): TaskNode | null => {
  for (const node of nodes) {
    if (node.id === taskId) return node;
    if (node.children) {
      const found = findTaskById(node.children, taskId);
      if (found) return found;
    }
  }
  return null;
};

export const updateNodeRecursively = (nodes: TaskNode[], nodeId: number, updater: (node: TaskNode) => TaskNode): TaskNode[] => {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return updater(node);
    }
    if (node.children) {
      return { ...node, children: updateNodeRecursively(node.children, nodeId, updater) };
    }
    return node;
  });
};

export const removeTaskRecursively = (nodes: TaskNode[], taskId: number): TaskNode[] => {
  return nodes.filter(node => {
    if (node.id === taskId) return false;
    if (node.children) {
      node.children = removeTaskRecursively(node.children, taskId);
    }
    return true;
  });
};

export const addTaskToParent = (nodes: TaskNode[], parentId: number, newTask: TaskNode): TaskNode[] => {
  return nodes.map(node => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newTask],
        isLeaf: false
      };
    }
    if (node.children) {
      return { ...node, children: addTaskToParent(node.children, parentId, newTask) };
    }
    return node;
  });
};

export const moveTaskToNewParent = (nodes: TaskNode[], draggedId: number, targetId: number | null): TaskNode[] => {
  // 먼저 드래그된 태스크를 찾고 제거
  const draggedTask = findTaskById(nodes, draggedId);
  if (!draggedTask) return nodes;

  // 기존 위치에서 제거
  let updatedNodes = removeTaskRecursively(nodes, draggedId);

  // 새로운 위치에 추가
  if (targetId === null) {
    // 루트 레벨로 이동
    const movedTask = { ...draggedTask, parentId: undefined };
    updatedNodes = [...updatedNodes, movedTask];
  } else {
    // 특정 부모 아래로 이동
    const movedTask = { ...draggedTask, parentId: targetId };
    updatedNodes = addTaskToParent(updatedNodes, targetId, movedTask);
  }

  return updatedNodes;
};
