npm install# Guia de Início Rápido - M&A Caixa Fácil

## 🚀 Começar em 5 minutos

### 1. Instalar dependências
```bash
cd "c:\Users\wagne\OneDrive\Documentos\Sites\MeA Caixa Facil\mea-caixa-facil"
npm install
```

### 2. Configurar banco de dados local (mais rápido para testar)

**Opção A: PostgreSQL Local**
```bash
# Se você tem PostgreSQL instalado
# Crie o banco:
# psql -U postgres
# CREATE DATABASE mea_caixa_facil;
# \q

# Configure .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mea_caixa_facil"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-change-in-production"
GOOGLE_CLIENT_ID="optional-for-now"
GOOGLE_CLIENT_SECRET="optional-for-now"
```

**Opção B: Supabase (recomendado)**
- Veja [SETUP.md](./SETUP.md) para instruções completas

### 3. Rodar migrações
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Testar o parser NLP
```bash
npx ts-node tests/parser.test.ts
```

### 5. Rodar o app
```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📝 Primeiro Uso

1. **Landing Page**: http://localhost:3000
2. **Criar Conta**: Clique em "Começar Grátis"
3. **Preencher dados**:
   - Nome, email, senha
   - Nome do negócio (ex: "Barbearia do João")
   - Tipo: Barbearia
4. **Dashboard**: Você será redirecionado automaticamente
5. **Registrar transação**:
   - Clique em "Registrar Transação"
   - Digite: "Corte 35"
   - Veja a prévia automática
   - Confirme

---

## 🎤 Testar Voz

1. Use Chrome ou Edge (Safari tem suporte limitado)
2. Permita acesso ao microfone
3. Clique no ícone de microfone
4. Fale: "Recebi cinquenta reais de um corte"
5. O app transcreve e interpreta automaticamente

---

## ⚠️ Problemas Comuns

### Erro de conexão com banco
```bash
# Verifique se o PostgreSQL está rodando
# Windows: Services → PostgreSQL
# Ou use Supabase (mais fácil)
```

### Google OAuth não funciona
- É opcional para desenvolvimento
- Você pode usar email/senha normalmente
- Para habilitar, veja [SETUP.md](./SETUP.md)

### Erro no Prisma
```bash
npx prisma generate
npx prisma db push
```

---

## 📊 Próximos Passos

Após testar o MVP básico, você pode:
- [ ] Adicionar gráficos (Recharts)
- [ ] Implementar alertas inteligentes
- [ ] Criar testes automatizados
- [ ] Deploy para Vercel

Veja [task.md](../../.gemini/antigravity/brain/699bfc79-d8ef-465e-a910-45df5289caff/task.md) para o roadmap completo.
