# Sistema de Autenticação - Frontend

Sistema completo de autenticação usando React, Context API e TanStack Router.

## 🚀 Funcionalidades

- ✅ Login com email e senha
- ✅ Registro de novos usuários
- ✅ Gerenciamento de estado com Context API
- ✅ Proteção de rotas (Route Guards)
- ✅ Persistência de autenticação com localStorage
- ✅ Interceptors Axios para adicionar token automaticamente
- ✅ Redirecionamento automático baseado no estado de autenticação
- ✅ Logout com limpeza de estado

## 📁 Estrutura de Arquivos

```
src/
├── contexts/
│   └── AuthContext.tsx          # Context API para autenticação
├── hooks/
│   └── useAuth.ts               # Hook customizado para usar o AuthContext
├── services/
│   ├── api.ts                   # Configuração do Axios com interceptors
│   └── auth.service.ts          # Serviços de autenticação (login, register, etc)
├── pages/
│   ├── Login.tsx                # Página de login
│   ├── Register.tsx             # Página de registro
│   └── Dashboard.tsx            # Página protegida (exemplo)
├── router.tsx                   # Configuração do TanStack Router
├── App.tsx                      # Componente principal
└── main.tsx                     # Entry point
```

## 🛠️ Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **TanStack Router** - Roteamento com type-safety
- **Axios** - Cliente HTTP
- **Context API** - Gerenciamento de estado
- **Tailwind CSS** - Estilização

## 📝 Como Usar

### 1. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz de `apps/web`:

```env
VITE_API_URL=http://localhost:3000
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Executar o projeto

```bash
npm run dev
```

## 🔐 Fluxo de Autenticação

### Login

1. Usuário acessa `/login`
2. Preenche email e senha
3. Sistema chama `authService.login()`
4. Token e dados do usuário são salvos no localStorage
5. Estado global é atualizado via Context
6. Usuário é redirecionado para `/dashboard`

### Registro

1. Usuário acessa `/register`
2. Preenche username, email e senha
3. Sistema chama `authService.register()`
4. Token e dados do usuário são salvos no localStorage
5. Estado global é atualizado via Context
6. Usuário é redirecionado para `/dashboard`

### Proteção de Rotas

- Rotas protegidas verificam `context.auth.isAuthenticated`
- Se não autenticado, redireciona para `/login`
- Se autenticado tentando acessar `/login` ou `/register`, redireciona para `/dashboard`

### Logout

1. Usuário clica em "Sair"
2. Sistema chama `authService.logout()`
3. Token e dados são removidos do localStorage
4. Estado é limpo
5. Usuário é redirecionado para `/login`

## 🎯 Uso do Hook `useAuth`

```tsx
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, login, register, logout } = useAuth();

  // Fazer login
  await login({ email: "user@example.com", password: "123456" });

  // Registrar
  await register({
    username: "user",
    email: "user@example.com",
    password: "123456",
  });

  // Logout
  logout();

  // Verificar autenticação
  if (isAuthenticated) {
    console.log("Usuário logado:", user);
  }
}
```

## 🔒 Interceptors Axios

### Request Interceptor

Adiciona automaticamente o token JWT em todas as requisições:

```typescript
Authorization: Bearer<token>;
```

### Response Interceptor

Intercepta erros 401 (não autorizado):

- Remove token e dados do localStorage
- Redireciona para `/login`

## 🎨 Páginas Criadas

### `/login`

- Formulário de login com validação
- Exibição de erros
- Link para página de registro
- Redirecionamento após login bem-sucedido

### `/register`

- Formulário de registro com validação
- Validação de senha (mínimo 6 caracteres)
- Confirmação de senha
- Link para página de login
- Redirecionamento após registro bem-sucedido

### `/dashboard`

- Página protegida (requer autenticação)
- Exibe informações do usuário
- Botão de logout
- Navbar com nome do usuário

## 🔄 Persistência de Autenticação

O sistema verifica automaticamente no carregamento se existe um token válido:

1. Verifica `localStorage` por `token` e `user`
2. Se existir, tenta validar chamando `/auth/profile`
3. Se válido, restaura o estado de autenticação
4. Se inválido, limpa o localStorage

Isso permite que o usuário permaneça logado mesmo após fechar o navegador.

## 📦 Tipos TypeScript

Todos os tipos estão fortemente tipados:

```typescript
interface User {
  id: string;
  username: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}
```

## 🚦 Exemplo de Criação de Nova Rota Protegida

```tsx
// Em router.tsx
const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks",
  component: Tasks,
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
});

// Adicionar ao routeTree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  tasksRoute, // Nova rota
]);
```

## ⚠️ Importante

- O token JWT é armazenado no localStorage
- Para produção, considere usar httpOnly cookies para maior segurança
- Ajuste a URL da API conforme seu ambiente (.env)
- As rotas do backend devem corresponder aos endpoints usados
  comum3/3 desbloqueadas •

## 🎉 Pronto!

O sistema de autenticação está completo e pronto para uso. Você pode:

- Adicionar novas rotas protegidas
- Personalizar as páginas de login/registro
- Adicionar mais funcionalidades ao AuthContext
- Integrar com outros serviços
