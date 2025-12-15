import { PaginationQueryPayload } from "dto";

export interface TaskHistoryPayload extends PaginationQueryPayload {
  taskId: string;
}