import { ActionType } from "enums";

export interface ResponseTaskHistoryDto {
  authorId: string;
  action: ActionType;
  content: string;
  changedAt: Date;
  rawChanges?: any;
}