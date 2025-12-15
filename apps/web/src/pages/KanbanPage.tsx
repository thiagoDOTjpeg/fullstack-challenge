import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { ResponseTaskDto } from "@challenge/types";
import { LogOut, Plus, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function KanbanPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();

  const { data: tasksData, isLoading } = useTasks({
    page: 1,
    limit: 100,
  });

  const tasks = tasksData?.items || [];

  const handleTaskClick = (task: ResponseTaskDto) => {
    setSelectedTaskId(task.id);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Task Board</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span>Conectado</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span>Desconectado</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Olá, <strong>{user?.username}</strong>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <KanbanBoard
          tasks={tasks}
          isLoading={isLoading}
          onTaskClick={handleTaskClick}
        />
      </main>

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <TaskDetailDialog
        taskId={selectedTaskId}
        open={!!selectedTaskId}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
      />
    </div>
  );
}
