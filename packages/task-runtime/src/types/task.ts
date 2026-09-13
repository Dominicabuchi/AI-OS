export type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed";

export interface Task {
  id: string;
  missionId: string;
  title: string;
  status: TaskStatus;
}
