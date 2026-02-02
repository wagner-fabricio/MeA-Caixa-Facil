# Setup do Banco de Dados - M&A Caixa Fácil

## Opção 1: Supabase (Recomendado para produção)

### 1. Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta (se não tiver)
3. Clique em "New Project"
4. Escolha:
   - Nome: `mea-caixa-facil`
   - Database Password: (escolha uma senha forte)
   - Region: South America (São Paulo)
5. Aguarde a criação (2-3 minutos)

### 2. Obter connection string
1. No projeto criado, vá em "Settings" → "Database"
2. Copie a "Connection string" (URI)
3. Substitua `[YOUR-PASSWORD]` pela senha que você escolheu

### 3. Configurar .env.local
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 4. Rodar migrações
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Opção 2: PostgreSQL Local (Para desenvolvimento)

### 1. Instalar PostgreSQL
- Windows: [Download PostgreSQL](https://www.postgresql.org/download/windows/)
- Instale com senha padrão: `postgres`

### 2. Criar banco de dados
```sql
CREATE DATABASE mea_caixa_facil;
```

### 3. Configurar .env.local
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mea_caixa_facil"
```

### 4. Rodar migrações
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Google OAuth Setup

### 1. Acessar Google Cloud Console
1. Vá para [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto: "M&A Caixa Fácil"

### 2. Configurar OAuth
1. Vá em "APIs & Services" → "Credentials"
2. Clique em "Create Credentials" → "OAuth client ID"
3. Configure:
   - Application type: Web application
   - Name: M&A Caixa Fácil
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://seu-dominio.com/api/auth/callback/google` (produção)

### 3. Copiar credenciais
Copie o Client ID e Client Secret para `.env.local`:

```bash
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret"
```

---

## NextAuth Secret

Gere um secret aleatório:

```bash
# No PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
```

Adicione ao `.env.local`:

```bash
NEXTAUTH_SECRET="seu-secret-gerado"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Verificar Setup

```bash
# Testar conexão com banco
npx prisma db push

# Ver banco de dados no navegador
npx prisma studio
```

---

## Arquivo .env.local completo

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/mea_caixa_facil"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"

# Google OAuth
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret"
```
