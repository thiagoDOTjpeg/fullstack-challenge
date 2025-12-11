export interface TaskNotificationPayload {
  recipients: string[];
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    assigneeIds: string[];
  };
  comment?: {
    content: string;
    authorId: string;
  };
  action?: 'ASSIGNED' | 'STATUS_CHANGE' | 'CREATED' | 'COMMENT';
}