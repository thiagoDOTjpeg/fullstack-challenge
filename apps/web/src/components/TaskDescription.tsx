import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

interface Props {
  task: any;
  isLoading: boolean;
  isEditing: boolean;
  registerTask: any;
  taskErrors: any;
}

export const TaskDescription: React.FC<Props> = ({
  task,
  isLoading,
  isEditing,
  registerTask,
  taskErrors,
}) => {
  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        Descrição
      </h3>
      {isEditing ? (
        <div>
          <Textarea
            placeholder="Descrição da tarefa"
            className="min-h-40 resize-none bg-background"
            {...registerTask("description")}
          />
          {taskErrors.description && (
            <p className="text-xs text-destructive mt-1 ml-1">
              {taskErrors.description.message as any}
            </p>
          )}
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : (
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {task?.description || "Nenhuma descrição fornecida."}
        </div>
      )}
    </section>
  );
};

export default TaskDescription;
