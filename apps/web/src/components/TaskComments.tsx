import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";

interface Props {
  comments: any[];
  isLoadingComments: boolean;
  getUsername: (id: string) => string;
  register: any;
  handleSubmit: any;
  onSubmitComment: (data: any) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
}

export const TaskComments: React.FC<Props> = ({
  comments,
  isLoadingComments,
  getUsername,
  register,
  handleSubmit,
  onSubmitComment,
  isSubmitting,
  isEditing,
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Comentários</h3>
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
                  {format(new Date(comment.createdAt), "dd MMM yy • HH:mm", {
                    locale: ptBR,
                  })}
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

      <div className="h-2" />

      {!isEditing && (
        <form onSubmit={handleSubmit(onSubmitComment)} className="mt-2">
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
        </form>
      )}
    </section>
  );
};

export default TaskComments;
