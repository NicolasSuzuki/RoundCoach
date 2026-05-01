# RoundCoach API

API do MVP do RoundCoach, um companion app seguro para evolucao no VALORANT com foco em analise pos-partida, upload de VODs e processamento assincrono.

O produto nao:

- le memoria do jogo
- injeta codigo
- automatiza gameplay
- interage em tempo real com a partida

O escopo atual cobre apenas registro manual, VOD gravado pelo usuario, fila fake em processo e consolidacao de analysis.

## Arquitetura

O produto segue a organizacao multi-repo:

- `roundcoach-api`: regra de negocio, auth, CRUD e coordenacao do fluxo
- `roundcoach-web`: interface do usuario
- `roundcoach-worker`: processamento pesado e integracao futura com BullMQ
- `roundcoach-infra`: ambiente, deploy e observabilidade

Neste repositorio:

- NestJS
- Prisma
- PostgreSQL
- JWT
- Swagger
- fila `stub` para processamento fake local

## Modulos atuais

- `auth`
- `users`
- `matches`
- `vods`
- `analyses`
- `training-plans`
- `health`
- `queue`

## Fluxo de processamento de VOD

Fluxo implementado hoje:

1. usuario cria uma `match`
2. usuario cria um `vod` opcionalmente vinculado a essa partida
3. usuario chama `POST /api/v1/vods/:id/process`
4. a API muda o `vod.status` para `PROCESSING`
5. a API cria ou atualiza a `analysis` com `processingStatus=PROCESSING`
6. com `QUEUE_PROVIDER=stub`, a propria API simula um worker em background
7. com `QUEUE_PROVIDER=bullmq`, a API publica um job real no Redis
8. o `roundcoach-worker` consome o job e chama o endpoint interno
9. a `analysis` e atualizada para `COMPLETED` com metricas fake
10. o `vod.status` e atualizado para `PROCESSED`
11. o `training-engine` pode transformar o historico recente em um plano de treino ativo

Fluxo futuro:

- substituir metricas fake por processamento real de video no worker
- enriquecer o treino com contexto mais profundo de VOD

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/roundcoach?schema=public
JWT_SECRET=super-secret-change-me
JWT_EXPIRES_IN=1d
APP_NAME=RoundCoach API
CORS_ORIGIN=http://localhost:3001
QUEUE_PROVIDER=stub
REDIS_URL=redis://localhost:6379
INTERNAL_API_TOKEN=roundcoach-internal-dev-token
RIOT_API_KEY=
RIOT_API_REGION=eu
```

Observacoes:

- `QUEUE_PROVIDER=stub` completa o processamento de forma fake na propria API.
- `QUEUE_PROVIDER=bullmq` publica jobs no Redis para o `roundcoach-worker`.
- `INTERNAL_API_TOKEN` protege o endpoint interno usado pelo worker.
- `QUEUE_NAME` define o nome compartilhado da fila BullMQ.
- `RIOT_API_KEY` habilita o consumo oficial de `VAL-CONTENT-V1`.
- sem `RIOT_API_KEY`, a API responde fallback local para mapas e agentes.

## Training Recommendation Engine

O nucleo de treino personalizado vive dentro do proprio `roundcoach-api`.

Estrutura principal:

- `src/domain/training-engine`
- `src/modules/training-plans`

O motor:

1. busca o perfil do jogador
2. usa as ultimas partidas com `analysis COMPLETED`
3. gera diagnostico deterministico
4. escolhe prioridade, foco e intensidade
5. monta plano diario, foco semanal e micro meta
6. persiste um `training_plan` ativo

Regras importantes:

- o plano anterior ativo vira `SUPERSEDED` quando um novo e gerado
- `GET /api/v1/training-plans/current` gera sob demanda se ainda nao houver plano
- `GET /api/v1/dashboard/training-plan` consome o plano atual sem mover a regra para o modulo de dashboard

## Como rodar localmente

1. Instale dependencias:

```bash
npm install
```

2. Suba o PostgreSQL com Docker:

```bash
docker compose up -d postgres
```

3. Gere o client do Prisma:

```bash
npm run prisma:generate
```

4. Aplique as migrations:

```bash
npm run prisma:migrate:dev
```

5. Rode a API:

```bash
npm run start:dev
```

API e Swagger:

- API: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

## Rodando tudo com Docker Compose

```bash
docker compose up --build -d
```

Servicos publicados:

- API em `http://localhost:3000`
- PostgreSQL em `localhost:5432`

Depois de subir a stack pela primeira vez, aplique as migrations:

```bash
docker compose exec api npx prisma migrate deploy
```

## Respostas e convencoes

- endpoints de leitura simples respondem com `{ data }`
- listagens paginadas respondem com `{ data, meta }`
- `meta` contem `page`, `limit`, `total` e `totalPages`
- erros HTTP seguem formato consistente via filter global

## Paginacao e filtros

Listagens com paginacao:

- `GET /api/v1/matches?page=1&limit=20`
- `GET /api/v1/vods?page=1&limit=20`

Filtros basicos em matches:

- `map`
- `agent`
- `result`
- `fromDate`
- `toDate`

Exemplo:

```http
GET /api/v1/matches?page=1&limit=10&map=Ascent&result=WIN
```

Filtros em VODs:

- `status`
- `matchId`

## Ownership e seguranca

Rotas autenticadas com recurso identificavel por `:id` ou `:matchId` passam por um guard global de ownership. Isso evita acesso cruzado entre usuarios em:

- `matches`
- `vods`
- `analyses`

Validacoes de regra continuam nos services para cenarios internos e fluxos que usam IDs no corpo do request.

## Endpoint interno do worker

Endpoint:

```http
POST /api/v1/internal/analysis-result
```

Header obrigatorio:

```http
x-internal-token: <INTERNAL_API_TOKEN>
```

Payload exemplo:

```json
{
  "vodId": "cm9vod123456",
  "matchId": "cm9match123456",
  "processingStatus": "COMPLETED",
  "deathsFirst": 4,
  "entryKills": 7,
  "crosshairScore": 72.4,
  "utilityUsageScore": 68.9,
  "positioningScore": 74.2,
  "summary": "Boa disciplina de mira, mas exposicao excessiva em entradas."
}
```

Efeito:

- atualiza a `analysis`
- muda o `vod.status` para `PROCESSED` ou `FAILED`
- preserva o contrato que o worker futuro vai usar

## Endpoints principais

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Users

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`

### Matches

- `POST /api/v1/matches`
- `GET /api/v1/matches`
- `GET /api/v1/matches/:id`
- `PATCH /api/v1/matches/:id`
- `DELETE /api/v1/matches/:id`

### VODs

- `POST /api/v1/vods`
- `GET /api/v1/vods`
- `GET /api/v1/vods/:id`
- `POST /api/v1/vods/:id/process`

### Analyses

- `GET /api/v1/analyses/:id`
- `GET /api/v1/matches/:matchId/analysis`
- `POST /api/v1/internal/analysis-result`

### Training Plans

- `POST /api/v1/training-plans/generate`
- `GET /api/v1/training-plans/current`
- `GET /api/v1/dashboard/training-plan`

### Health

- `GET /api/v1/health`
- `GET /api/v1/health/ready`

### Riot Content

- `GET /api/v1/riot-content`

## Scripts

- `npm run build`
- `npm run start:dev`
- `npm run start:prod`
- `npm run lint`
- `npm run test`
- `npm run prisma:generate`
- `npm run prisma:migrate:dev`
- `npm run prisma:migrate:deploy`
- `npm run prisma:studio`

## Proximos passos recomendados

1. Criar o repositorio `roundcoach-worker`
2. Implementar BullMQ + Redis no worker
3. Substituir o `stub` por enfileiramento real quando `QUEUE_PROVIDER=bullmq`
4. Fazer o worker chamar `POST /api/v1/internal/analysis-result`
5. Adicionar seed opcional e testes e2e do fluxo completo
