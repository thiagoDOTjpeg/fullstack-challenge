import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import React from "react";

interface Props {
  user: any;
  onRemove: (id: string) => void;
  isRemoving?: boolean;
}

export const ParticipantListItem: React.FC<Props> = ({
  user,
  onRemove,
  isRemoving,
}) => {
  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-background border border-transparent hover:border-border transition-all">
      <Avatar className="h-8 w-8 border">
        <AvatarFallback className="text-xs bg-muted">
          {user?.username?.[0]?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-none truncate">
          {user?.username || "Carregando..."}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 truncate">
          {user?.email || "user@email.com"}
        </p>
      </div>
      <div className="ml-2">
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${isRemoving ? "opacity-100" : ""}`}
          onClick={() => onRemove(user.id)}
          disabled={isRemoving}
          aria-label={`Remover ${user?.username ?? "participante"}`}
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default ParticipantListItem;
