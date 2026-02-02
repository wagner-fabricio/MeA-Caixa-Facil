# M&A Caixa Fácil - MVP

Controle financeiro simplificado para pequenos negócios (barbearias, salões, oficinas).

## 🚀 Funcionalidades

- ✅ Autenticação (Google + Email/Senha)
- ✅ Registro de transações por texto ou voz
- ✅ Parser NLP inteligente (detecta tipo e categoria automaticamente)
- ✅ Dashboard com resumo diário
- ✅ Categorização automática
- ✅ Multi-negócios por usuário
- ⏳ Gráficos e analytics (em desenvolvimento)
- ⏳ Alertas inteligentes (em desenvolvimento)

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15, React, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js
- **Voice**: Web Speech API
- **Charts**: Recharts
- **Deployment**: Vercel + Supabase

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar banco de dados (ver SETUP.md)
npx prisma migrate dev
npx prisma generate

# Rodar em desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuração

Veja [SETUP.md](./SETUP.md) para instruções detalhadas de:
- Configuração do banco de dados (Supabase ou local)
- Google OAuth
- Variáveis de ambiente

## 📱 PWA

O app é instalável como PWA em dispositivos móveis.

## 🧪 Testes

```bash
# Rodar testes
npm test

# Lighthouse audit
npm run lighthouse
```

## 🚀 Deploy

```bash
# Deploy para Vercel
vercel --prod
```

## 📝 Licença

Propriedade de M&A Caixa Fácil © 2026
