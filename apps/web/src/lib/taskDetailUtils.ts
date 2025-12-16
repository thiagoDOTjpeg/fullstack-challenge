import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-green-50 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-50 text-yellow-800 border-yellow-200",
  HIGH: "bg-orange-50 text-orange-800 border-orange-200",
  URGENT: "bg-rose-50 text-rose-800 border-rose-200",
};

export const STATUS_LABELS: Record<string, string> = {
  TODO: "A Fazer",
  IN_PROGRESS: "Em Progresso",
  REVIEW: "Em Revisão",
  DONE: "Concluído",
};

export const formatFriendlyDate = (date?: string | Date) => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Hoje";
  if (isTomorrow(d)) return "Amanhã";
  return format(d, "dd/MMM/yy", { locale: ptBR });
};

export const mapTaskToForm = (t: any) => {
  const d = t?.deadline ? new Date(t.deadline) : undefined;
  const dateStr = d ? d.toISOString().slice(0, 10) : undefined;
  return {
    title: t?.title,
    description: t?.description,
    priority: t?.priority as any,
    deadline: dateStr as any,
    assignees: t?.assignees ?? [],
  } as any;
};

export const getFirstName = (fullName?: string): string => {
  if (!fullName) return "";
  return fullName.split(" ")[0];
};

export const getUsernameFromList = (users: any[] = [], id?: string) =>
  (users.find((u) => u.id === id)?.username || "Desconhecido");

export const formatChangedFields = (entry: any, referencedUsers: any[] = []) => {
  const raw = entry.rawChanges ?? entry.raw_changes ?? entry.changes;
  const content = entry.content ?? entry.contentHtml ?? entry.message;
  if (content) {
    if (typeof content === "string") {
      try {
        if (entry.action === "ASSIGNED" || entry.action === "assigned") {
          let mapped = content as string;
          for (const u of referencedUsers) {
            if (!u || !u.id) continue;
            const username = u.username ?? u.id;
            mapped = mapped.split(u.id).join(username);
          }
          return mapped;
        }
      } catch (e) { }
      return content;
    }
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
