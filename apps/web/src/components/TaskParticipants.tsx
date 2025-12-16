import ParticipantListItem from "@/components/ParticipantListItem";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Plus } from "lucide-react";
import React from "react";

interface Props {
  taskAssignees: string[];
  users: any[];
  candidateUsers: any[];
  isLoadingAllUsers: boolean;
  openAssign: boolean;
  setOpenAssign: (b: boolean) => void;
  handleToggleAssign: (userId: string) => Promise<void>;
  handleRemoveAssignee: (userId: string) => Promise<void>;
  removingAssignee: string | null;
}

export const TaskParticipants: React.FC<Props> = ({
  taskAssignees,
  users,
  candidateUsers,
  isLoadingAllUsers,
  openAssign,
  setOpenAssign,
  handleToggleAssign,
  handleRemoveAssignee,
  removingAssignee,
}) => {
  return (
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
                <CommandGroup heading="Usuários">
                  {isLoadingAllUsers ? (
                    <CommandItem
                      disabled
                      className="flex items-center justify-between"
                    >
                      <span>Carregando...</span>
                    </CommandItem>
                  ) : (
                    (candidateUsers ?? []).map((user) => {
                      const isAssigned = (taskAssignees ?? []).includes(
                        user.id
                      );
                      return (
                        <CommandItem
                          key={user.id}
                          value={user.username}
                          onSelect={() => handleToggleAssign(user.id)}
                          className="flex items-center justify-between"
                        >
                          <span>{user.username}</span>
                          {isAssigned && <Check className="h-4 w-4" />}
                        </CommandItem>
                      );
                    })
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        {taskAssignees?.length ? (
          taskAssignees.map((id) => {
            const u = users.find((x) => x.id === id) || {
              id,
              username: "Carregando...",
              email: "",
            };
            return (
              <ParticipantListItem
                key={id}
                user={u}
                onRemove={(uid) => handleRemoveAssignee(uid)}
                isRemoving={removingAssignee === id}
              />
            );
          })
        ) : (
          <div className="text-xs text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg">
            Nenhum participante.
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskParticipants;
