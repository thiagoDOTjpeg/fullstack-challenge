import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register: registerUser } = useAuth();

  const {
    register: registerLoginForm,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegisterForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
    reset: resetRegister,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success("Login realizado com sucesso!");
      onOpenChange(false);
      resetLogin();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao fazer login");
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success("Conta criada com sucesso!");
      onOpenChange(false);
      resetRegister();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao criar conta");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetLogin();
    resetRegister();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isLogin ? "Entrar" : "Criar Conta"}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Entre com suas credenciais para acessar o sistema"
              : "Crie uma nova conta para começar"}
          </DialogDescription>
        </DialogHeader>

        {isLogin ? (
          <form
            onSubmit={handleLoginSubmit(onLoginSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...registerLoginForm("email")}
              />
              {loginErrors.email && (
                <p className="text-sm text-destructive">
                  {loginErrors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...registerLoginForm("password")}
              />
              {loginErrors.password && (
                <p className="text-sm text-destructive">
                  {loginErrors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoginSubmitting}
              >
                {isLoginSubmitting ? "Entrando..." : "Entrar"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={toggleMode}
              >
                Não tem uma conta? Criar conta
              </Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleRegisterSubmit(onRegisterSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="seu_username"
                {...registerRegisterForm("username")}
              />
              {registerErrors.username && (
                <p className="text-sm text-destructive">
                  {registerErrors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="seu@email.com"
                {...registerRegisterForm("email")}
              />
              {registerErrors.email && (
                <p className="text-sm text-destructive">
                  {registerErrors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Senha</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="••••••••"
                {...registerRegisterForm("password")}
              />
              {registerErrors.password && (
                <p className="text-sm text-destructive">
                  {registerErrors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isRegisterSubmitting}
              >
                {isRegisterSubmitting ? "Criando..." : "Criar Conta"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={toggleMode}
              >
                Já tem uma conta? Entrar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
