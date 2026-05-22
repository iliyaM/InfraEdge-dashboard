export type TaskStatus = 'todo' | 'in-progress' | 'done';

export enum TaskPriority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: number;
}
