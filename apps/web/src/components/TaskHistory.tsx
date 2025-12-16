import HistoryListItem from "@/components/HistoryListItem";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface Props {
  history: any[];
  isLoadingHistory: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  referencedUsers: any[];
  getHistoryUsername: (id?: string) => string;
  formatChangedFields: (entry: any, referencedUsers?: any[]) => string;
  getFirstName: (fullName?: string) => string;
}

export const TaskHistory: React.FC<Props> = ({
  history,
  isLoadingHistory,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  referencedUsers,
  getHistoryUsername,
  formatChangedFields,
  getFirstName,
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-[150px]">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        Histórico
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
              <HistoryListItem
                key={entry.id ?? idx}
                entry={entry}
                getHistoryUsername={getHistoryUsername}
                formatChangedFields={(e: any) =>
                  formatChangedFields(e, referencedUsers)
                }
                getFirstName={getFirstName}
                referencedUsers={referencedUsers}
              />
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
  );
};

export default TaskHistory;
