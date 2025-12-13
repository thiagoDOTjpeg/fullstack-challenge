import { TaskPriority, TaskStatus } from "enums";

export class ResponseTaskDto {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  deadline: Date;
  creatorId: string;
  createdAt: Date;
}