# Local Setup

## Pre-requisitos

- Docker Desktop
- Node.js 20+
- npm

## Bootstrap

Na raiz do workspace:

```bash
npm run bootstrap
```

Isso:

1. sobe `postgres`, `redis`, `api`, `worker` e `web`
2. aplica migrations na API

## Acessos

- Web: `http://localhost:5173`
- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`
- Worker health: `http://localhost:3002/health`

## Scripts uteis

```bash
npm run up
npm run up:detached
npm run down
npm run logs
npm run ps
npm run migrate
npm run reset
npm run quality:check
```

## Observacoes

- `reset` remove volumes do compose; use quando quiser limpar banco e redis locais
- a API roda `prisma migrate deploy` automaticamente no container
- quando houver mudanca de schema, rode `npx prisma generate` no `roundcoach-api`

## Teste manual minimo

1. criar conta
2. criar partida
3. adicionar VOD
4. processar
5. voltar ao dashboard
