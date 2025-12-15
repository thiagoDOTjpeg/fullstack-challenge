import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function Login() {
  const [open, setOpen] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/kanban" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-700">
      <div className="text-center mb-8 absolute top-12">
        <h1 className="text-4xl font-bold text-white">Task Board</h1>
        <p className="text-slate-300 mt-2">
          Gerencie suas tarefas de forma eficiente
        </p>
      </div>
      <AuthDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
