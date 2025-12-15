import { authService } from "@/services/auth.service";
import type { ResponseNotificationDto } from "@challenge/types";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:3004";
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const connectWebSocket = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    socketRef.current = io(SOCKET_URL, {
      auth: {
        token,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      transports: ["websocket"],
      reconnection: false,
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      reconnectAttemptsRef.current = 0;

      toast.success("Conectado às notificações em tempo real!", {
        duration: 2000,
      });
    });

    socketRef.current.on("disconnect", (reason: string) => {
      setIsConnected(false);

      if (reason === "io server disconnect" || reason === "auth_error") {
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          setReconnectAttempts(reconnectAttemptsRef.current);

          reconnectTimeoutRef.current = setTimeout(() => {
            refreshTokenAndRetry();
          }, RECONNECT_DELAY);
        } else {
          toast.error(
            "Falha ao reconectar. Por favor, faça login novamente."
          );
          navigate({ to: "/login" });
        }
      } else if (
        reason !== "io client namespace disconnect" &&
        reason !== "client namespace disconnect"
      ) {
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          setReconnectAttempts(reconnectAttemptsRef.current);

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, RECONNECT_DELAY);
        } else {
          toast.error("Conexão perdida. Por favor, recarregue a página.");
        }
      }
    });

    socketRef.current.on(
      "connect_error",
      (error: Error & { data?: { message: string } }) => {
        console.error("Erro de conexão WebSocket:", error);

        if (
          error.message === "Authentication error" ||
          error.data?.message === "Invalid token"
        ) {
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current += 1;
            setReconnectAttempts(reconnectAttemptsRef.current);

            reconnectTimeoutRef.current = setTimeout(() => {
              refreshTokenAndRetry();
            }, RECONNECT_DELAY);
          } else {
            toast.error("Autenticação falhou. Por favor, faça login novamente.");
            navigate({ to: "/login" });
          }
        }
      }
    );

    socketRef.current.on("task:created", (data: ResponseNotificationDto) => {
      toast.success("Nova tarefa criada!", {
        description: data.content,
      });
    });

    socketRef.current.on("task:updated", (data: ResponseNotificationDto) => {
      toast.info("Tarefa atualizada!", {
        description: data.content,
      });
    });

    socketRef.current.on("task:assigned", (data: ResponseNotificationDto) => {
      toast.info("Tarefa atribuída a você!", {
        description: data.content,
      });
    });

    socketRef.current.on("comment:new", (data: ResponseNotificationDto) => {
      toast.info("Novo comentário!", {
        description: data.content,
      });
      try {
        queryClient.invalidateQueries({ queryKey: ["taskHistory"] });
      } catch (e) {
        queryClient.invalidateQueries();
      }
    });
  };

  const refreshTokenAndRetry = async () => {
    try {
      await authService.refreshToken();

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      reconnectAttemptsRef.current = 0;
      setReconnectAttempts(0);
      connectWebSocket();
    } catch (error) {
      console.error("Falha ao renovar token:", error);
      toast.error("Sessão expirada. Por favor, faça login novamente.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate({ to: "/login" });
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isConnected,
    reconnectAttempts,
  };
}
