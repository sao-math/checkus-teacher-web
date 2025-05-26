export interface Reference {
  id: number;
  url: string;
  isVideo: boolean;
  completionCondition: string;
}

export interface TaskNode {
  id: number;
  title: string;
  description?: string;
  typeId: number;
  parentId?: number;
  isLeaf: boolean; // false=분류(카테고리), true=실제 과제
  children?: TaskNode[];
  expanded?: boolean;
  references?: Reference[]; // 실제 과제일 때만 사용
}

export interface TaskType {
  id: number;
  name: string;
}
