import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useTaskComments } from "@/hooks/useTaskComments";
import { useTaskHistory } from "@/hooks/useTaskHistory";
import { useAddComment, useTask } from "@/hooks/useTasks";
import { useUsersByIds } from "@/hooks/useUsersByIds";
import { commentSchema, type CommentFormData } from "@/lib/schemas";
import type { TaskPriority, TaskStatus } from "@challenge/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Check, Clock, History, Plus, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TaskDetailDialogProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-green-50 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-50 text-yellow-800 border-yellow-200",
  HIGH: "bg-orange-50 text-orange-800 border-orange-200",
  URGENT: "bg-rose-50 text-rose-800 border-rose-200",
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "A Fazer",
  IN_PROGRESS: "Em Progresso",
  REVIEW: "Em Revisão",
  DONE: "Concluído",
};

const MOCK_ALL_USERS = [
  { id: "1", username: "Thiago" },
  { id: "2", username: "Jungle" },
  { id: "3", username: "Admin" },
  { id: "4", username: "Guest" },
];

export function TaskDetailDialog({
  taskId,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const { data: task, isLoading } = useTask(taskId || "");
  const { data: comments = [], isLoading: isLoadingComments } =
    useTaskComments(taskId);
  const addComment = useAddComment();

  const {
    data: historyPages,
    isLoading: isLoadingHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTaskHistory(taskId, 5);

  const history = historyPages?.pages?.flatMap((p: any) => p.items) || [];

  const historyAuthorIds = Array.from(
    new Set(history.map((h: any) => h.authorId).filter(Boolean))
  );
  const { data: historyUsers = [] } = useUsersByIds(
    historyAuthorIds.length > 0 ? historyAuthorIds : undefined
  );

  const getHistoryUsername = (id?: string) => {
    if (!id) return "Sistema";
    const u = historyUsers.find((x) => x.id === id);
    return u?.username || "Sistema";
  };

  const getFirstName = (fullName?: string) => {
    if (!fullName) return fullName;
    return fullName.split(" ")[0];
  };

  const formatChangedFields = (entry: any) => {
    const raw = entry.rawChanges ?? entry.raw_changes ?? entry.changes;
    const content = entry.content ?? entry.contentHtml ?? entry.message;
    if (content) {
      if (typeof content === "string") return content;
      try {
        if (Array.isArray(content)) return content.join(", ");
        return JSON.stringify(content);
      } catch (e) {
        return String(content);
      }
    }
    if (!raw) return entry.action || "atualizou a tarefa";
    const keys = Array.isArray(raw) ? raw : Object.keys(raw).filter(Boolean);
    const human = keys
      .map((k) =>
        String(k)
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim()
      )
      .join(", ");
    return human
      ? `alterou: ${human}`
      : entry.content || entry.action || "atualizou a tarefa";
  };

  const userIds = task
    ? [task.creatorId, ...(task.assignees ?? [])].filter(
        (id, idx, arr) => id && arr.indexOf(id) === idx
      )
    : [];
  const { data: users = [] } = useUsersByIds(
    userIds.length > 0 ? userIds : undefined
  );

  const [openAssign, setOpenAssign] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmitComment = async (data: CommentFormData) => {
    if (!taskId) return;
    try {
      await addComment.mutateAsync({ id: taskId, data });
      toast.success("Comentário adicionado!");
      reset();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erro ao adicionar comentário"
      );
    }
  };

  const handleAssignUser = async (userId: string) => {
    console.log(`Atribuindo usuário ${userId} à tarefa ${taskId}`);
    toast.success("Usuário convidado com sucesso!");
    setOpenAssign(false);
  };

  const formatFriendlyDate = (date?: string | Date) => {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isToday(d)) return "Hoje";
    if (isTomorrow(d)) return "Amanhã";
    return format(d, "dd/MMM/yy", { locale: ptBR });
  };

  const getUsername = (id: string) =>
    users.find((u) => u.id === id)?.username || "Desconhecido";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] h-[90vh] md:h-[85vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-sm">
        <div className="flex items-start justify-between px-8 py-6 border-b bg-background z-10 shrink-0">
          <div className="flex-1 min-w-0 mr-8">
            {isLoading ? (
              <Skeleton className="h-8 w-1/2 mb-2" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-muted-foreground text-xs font-mono mb-2 uppercase tracking-wider">
                  <span>{taskId?.split("-")[0] ?? "TASK"}</span>
                  <span>•</span>
                  <span>Criado em {formatFriendlyDate(task?.createdAt)}</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground leading-tight">
                  {task?.title}
                </h2>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              {!isLoading && task && (
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
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden grid md:grid-cols-[1fr_320px] divide-x">
          <div className="flex flex-col h-full overflow-hidden bg-background">
            <div className="flex-1 min-h-0 relative">
              <ScrollArea className="h-full">
                <div className="p-8 space-y-8 pb-4">
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      Descrição
                    </h3>
                    {isLoading ? (
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

                  <Separator />

                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">
                        Comentários
                      </h3>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {comments.length}
                      </Badge>
                    </div>

                    <div className="space-y-4 pl-4 border-l-2 border-muted">
                      {isLoadingComments ? (
                        <div className="space-y-4">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ) : comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="group relative">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {getUsername(comment.authorId)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  new Date(comment.createdAt),
                                  "dd MMM yy • HH:mm",
                                  { locale: ptBR }
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Seja o primeiro a comentar.
                        </p>
                      )}
                    </div>
                  </section>

                  <div className="h-2" />
                </div>
              </ScrollArea>
            </div>

            <div className="p-4 border-t bg-muted/10 shrink-0 z-10">
              <form onSubmit={handleSubmit(onSubmitComment)}>
                <div className="relative">
                  <Textarea
                    placeholder="Escreva um comentário..."
                    className="min-h-20 pr-20 resize-none bg-background focus-visible:ring-1"
                    {...register("content")}
                  />
                  <div className="absolute bottom-2 right-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting}
                      className="h-8 text-xs"
                    >
                      {isSubmitting ? "Enviando..." : "Enviar"}
                    </Button>
                  </div>
                </div>
                {errors.content && (
                  <p className="text-xs text-destructive mt-1 ml-1">
                    {errors.content.message}
                  </p>
                )}
              </form>
            </div>
          </div>

          <div className="h-full bg-muted/5 p-6 flex flex-col gap-6 overflow-y-auto border-l">
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
                    <p className="font-medium text-foreground">
                      {formatFriendlyDate(task?.deadline)}
                    </p>
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

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Participantes
                </h4>
                <Popover open={openAssign} onOpenChange={setOpenAssign}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 -mr-2 hover:bg-background"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-60" align="end">
                    <Command>
                      <CommandInput placeholder="Buscar usuário..." />
                      <CommandList>
                        <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                        <CommandGroup heading="Sugestões">
                          {MOCK_ALL_USERS.map((user) => {
                            const isAssigned = task?.assignees?.includes(
                              user.id
                            );
                            return (
                              <CommandItem
                                key={user.id}
                                value={user.username}
                                onSelect={() => {
                                  if (!isAssigned) handleAssignUser(user.id);
                                }}
                                disabled={isAssigned}
                                className="flex items-center justify-between"
                              >
                                <span>{user.username}</span>
                                {isAssigned && (
                                  <Check className="h-4 w-4 opacity-50" />
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                {task?.assignees?.length ? (
                  task.assignees.map((id) => {
                    const u = users.find((x) => x.id === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-background border border-transparent hover:border-border transition-all"
                      >
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback className="text-xs bg-muted">
                            {u?.username?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            {u?.username || "Carregando..."}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            {u?.email || "user@email.com"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg">
                    Nenhum participante.
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex-1 flex flex-col min-h-[150px]">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <History className="h-3 w-3" /> Histórico
              </h4>
              <ScrollArea className="flex-1 -mr-4 pr-4">
                <div className="space-y-4">
                  {isLoadingHistory ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                  ) : history.length > 0 ? (
                    history.map((entry: any, idx: number) => (
                      <div
                        key={entry.id ?? idx}
                        className="flex gap-3 text-sm relative pb-4 border-l ml-1.5 pl-4 last:border-0 last:pb-0"
                      >
                        <div
                          className={`absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full ${
                            entry.type === "system"
                              ? "bg-muted-foreground/30"
                              : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {getFirstName(getHistoryUsername(entry.authorId))}
                            </span>{" "}
                            {formatChangedFields(entry)}
                          </p>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">
                            {entry.changedAt
                              ? format(
                                  new Date(entry.changedAt),
                                  "dd MMM yy • HH:mm",
                                  {
                                    locale: ptBR,
                                  }
                                )
                              : entry.createdAt
                                ? format(
                                    new Date(entry.createdAt),
                                    "dd MMM yy • HH:mm",
                                    {
                                      locale: ptBR,
                                    }
                                  )
                                : "—"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg">
                      Nenhum histórico.
                    </div>
                  )}
                  {hasNextPage && (
                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? "Carregando..." : "Ver mais"}
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
