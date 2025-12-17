import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PRIORITY_COLORS,
  STATUS_LABELS,
  formatFriendlyDate,
} from "@/lib/taskDetailUtils";
import type { TaskPriority, TaskStatus } from "@challenge/types";
import React from "react";

interface Props {
  task: any;
  taskId: string | null;
  isLoading: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  registerTask: any;
}

export const TaskDetailHeader: React.FC<Props> = ({
  task,
  taskId,
  isLoading,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onDelete,
  registerTask,
}) => {
  return (
    <div className="flex items-start justify-between px-8 py-6 border-b bg-background z-10 shrink-0">
      <div className="flex-1 min-w-0 mr-8">
        {isLoading ? (
          <Skeleton className="h-8 w-1/2 mb-2" />
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-muted-foreground text-xs font-mono mb-2 uppercase tracking-wider">
              <span>{taskId?.split("-")[0] ?? "TASK"}</span>
              <span>•</span>
              <span>
                {isEditing
                  ? "Editando tarefa"
                  : `Criado em ${formatFriendlyDate(task?.createdAt)}`}
              </span>
            </div>
            {isEditing ? (
              <Input
                placeholder="Título da tarefa"
                className="text-2xl font-semibold tracking-tight text-foreground leading-tight"
                {...registerTask("title")}
              />
            ) : (
              <h2 className="text-2xl font-semibold tracking-tight text-foreground leading-tight">
                {task?.title}
              </h2>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          {isEditing ? (
            <select
              className="border-input h-9 rounded-md bg-transparent px-3 text-sm"
              {...registerTask("priority")}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          ) : (
            task && (
              <>
                <Badge
                  variant="outline"
                  className={PRIORITY_COLORS[task.priority as TaskPriority]}
                >
                  {task.priority}
                </Badge>
                <Badge variant="secondary" className="font-medium">
                  {STATUS_LABELS[task.status as TaskStatus]}
                </Badge>
              </>
            )
          )}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {!isLoading && task && !isEditing && (
          <>
            <Button variant="ghost" size="sm" onClick={onStartEdit}>
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Deletar
            </Button>
          </>
        )}
        {!isLoading && task && isEditing && (
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskDetailHeader;
