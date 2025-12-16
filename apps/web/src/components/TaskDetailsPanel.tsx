import { formatFriendlyDate } from "@/lib/taskDetailUtils";
import { Calendar, Clock, User } from "lucide-react";
import React from "react";

interface Props {
  task: any;
  isEditing: boolean;
  registerTask: any;
  getUsername: (id: string) => string;
}

export const TaskDetailsPanel: React.FC<Props> = ({
  task,
  isEditing,
  registerTask,
  getUsername,
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Detalhes
      </h4>

      <div className="grid gap-4">
        <div className="flex items-center gap-3 text-sm group">
          <div className="p-1.5 rounded-md bg-background border shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Criador</p>
            <p className="font-medium text-foreground truncate">
              {getUsername(task?.creatorId || "")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm group">
          <div className="p-1.5 rounded-md bg-background border shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Prazo</p>
            {isEditing ? (
              <input
                type="date"
                className="border-input h-9 rounded-md bg-transparent px-3 text-sm w-full"
                {...registerTask("deadline")}
              />
            ) : (
              <p className="font-medium text-foreground">
                {formatFriendlyDate(task?.deadline)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm group">
          <div className="p-1.5 rounded-md bg-background border shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Criado em</p>
            <p className="font-medium text-foreground">
              {formatFriendlyDate(task?.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPanel;
