import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";

interface Props {
  entry: any;
  getHistoryUsername: (id?: string) => string;
  formatChangedFields: (entry: any) => string;
  getFirstName: (fullName?: string) => string;
  referencedUsers?: any[];
}

export const HistoryListItem: React.FC<Props> = ({
  entry,
  getHistoryUsername,
  formatChangedFields,
  getFirstName,
  referencedUsers = [],
}) => {
  return (
    <div className="flex gap-3 text-sm relative pb-4 border-l ml-1.5 pl-4 last:border-0 last:pb-0">
      <div
        className={`absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full ${entry.type === "system" ? "bg-muted-foreground/30" : "bg-blue-500"}`}
      />
      <div>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {getFirstName(getHistoryUsername(entry.authorId))}
          </span>{" "}
          {formatChangedFields(entry, referencedUsers)}
        </p>
        <span className="text-[10px] text-muted-foreground mt-0.5 block">
          {entry.changedAt
            ? format(new Date(entry.changedAt), "dd MMM yy • HH:mm", {
                locale: ptBR,
              })
            : entry.createdAt
              ? format(new Date(entry.createdAt), "dd MMM yy • HH:mm", {
                  locale: ptBR,
                })
              : "—"}
        </span>
      </div>
    </div>
  );
};

export default HistoryListItem;
