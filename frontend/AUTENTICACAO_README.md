# 🚀 Frontend - Autenticação JWT Implementada

## ✅ O que foi implementado

1. **✅ AuthService** - Gerencia tokens no localStorage
2. **✅ ApiService** - Requisições com token automático
3. **✅ ProtectedRoute** - Guard de rotas protegidas
4. **✅ LoginPage** - Página de login
5. **✅ React Router** - Setup de rotas
6. **✅ Logout** - Botão na TopBar

---

## 📁 Arquivos Criados

```
src/
├── services/
│   ├── AuthService.ts          ← Login, tokens, logout
│   └── ApiService.ts           ← Requisições com token
├── components/
│   ├── ProtectedRoute.tsx       ← Guard de rotas
│   ├── LoginPage.tsx            ← Página de login
│   └── TopBar.tsx               ← ATUALIZADO com logout
├── styles/
│   └── login.css                ← Estilos de login
└── App.tsx                      ← ATUALIZADO com rotas
```

---

## 🚀 Como Usar

### 1. Instalar dependências
```bash
cd src/main/frontend
npm install
```

### 2. Iniciar o desenvolvimento
```bash
npm run dev
# Acesso: http://localhost:5173
```

### 3. Fluxo de Autenticação

1. **Acesse** http://localhost:5173/login
2. **Faça login** com email e senha
3. **Token é salvo** em `localStorage['auth_token']`
4. **Dashboard é renderizado** (rota protegida)
5. **Clique no ícone do usuário** → **Logout** para desconectar

---

## 🔄 Fluxo Técnico

### Login
```typescript
// LoginPage.tsx
const response = await AuthService.login({ email, password });
// Token salvo automaticamente
navigate('/');  // Redireciona para dashboard
```

### Proteção de Rota
```typescript
// App.tsx
<Route path="/" element={<ProtectedRoute component={AppLayout} />} />
```

ProtectedRoute verifica:
1. ✅ Existe token em localStorage?
2. ✅ Token é válido? (valida com backend)
3. ✅ Se tudo OK → renderiza AppLayout
4. ❌ Se não → redireciona para /login

### Requisições com Token
```typescript
// Qualquer componente
const response = await ApiService.get('/condominiums');
// Token adicionado automaticamente no header Authorization
```

### Logout
```typescript
// TopBar.tsx
AuthService.logout();  // Remove token de localStorage
navigate('/login');    // Redireciona para login
```

---

## 🧪 Teste Completo

### Backend (Terminal 1)
```bash
cd sindigo-app
./mvnw spring-boot:run
# http://localhost:8080
```

### Frontend (Terminal 2)
```bash
cd src/main/frontend
npm run dev
# http://localhost:5173
```

### No Browser
1. Acesse http://localhost:5173/login
2. Digite email e senha
3. Clique "Entrar"
4. Se houver erro, verifique:
   - Backend está rodando?
   - Credenciais corretas?
   - DevTools → Console para ver erros

---

## 🔐 LocalStorage

Token é armazenado em:
```
localStorage['auth_token'] = 'eyJ...'
```

Para verificar no DevTools:
- F12 → Application → Local Storage → localhost:5173
- Veja `auth_token` com o token JWT

---

## 🛠️ Configuração

### API URL
**Arquivo:** `AuthService.ts` e `ApiService.ts`
```typescript
private static readonly API_URL = 'http://localhost:8080';
```

Para produção, alterar para seu domínio.

---

## 📋 Endpoints Utilizados

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/auth/login` | POST | Fazer login |
| `/auth/validate` | GET | Validar token |
| `/condominiums` | GET | Exemplo (usa token) |

---

## ✨ Features

✅ Login com email/senha
✅ Token armazenado em localStorage
✅ Token adicionado em todas requisições
✅ Validação de token com backend
✅ Proteção de rotas
✅ Logout com remoção de token
✅ Redireciona para login se não autenticado
✅ Menu de usuário na TopBar

---

## 🎯 Próximos Passos

1. ⏭️ Implementar refresh token (renovação automática)
2. ⏭️ Adicionar loading states e skeleton loaders
3. ⏭️ Integrar mais endpoints da API
4. ⏭️ Adicionar notificações (toasts)
5. ⏭️ Criar páginas adicionais protegidas
6. ⏭️ Setup de CORS no backend (já feito!)

---

## ❓ Dúvidas

**P: Onde está o token?**
R: Em `localStorage['auth_token']` - veja no DevTools

**P: Por que a página diz "Carregando"?**
R: ProtectedRoute está validando o token com o backend

**P: Como adicionar novas rotas protegidas?**
R: Use `<Route path="/..." element={<ProtectedRoute component={MyComponent} />} />`

---

## 🎉 Tudo Pronto!

Seu frontend com autenticação JWT está funcionando!

✅ Login funciona
✅ Rotas protegidas funcionam
✅ Token é salvo e validado
✅ Logout funciona

**Boa sorte! 🚀**

