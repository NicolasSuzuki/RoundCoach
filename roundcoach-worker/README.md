# RoundCoach Worker

Worker fake do RoundCoach responsavel por consumir jobs de processamento de VOD e devolver o resultado para a API.

## Stack

- Node.js
- TypeScript
- BullMQ
- Redis
- Axios

## Responsabilidade

Este repo:

- consome a fila `vod-processing`
- simula tempo de processamento
- gera metricas fake
- chama `POST /api/v1/internal/analysis-result`

## Variaveis de ambiente

```env
PORT=3002
REDIS_URL=redis://localhost:6379
QUEUE_NAME=vod-processing
API_BASE_URL=http://localhost:3000/api/v1
INTERNAL_API_TOKEN=roundcoach-internal-dev-token
WORKER_CONCURRENCY=2
PROCESSING_DELAY_MS=3000
```

## Rodando localmente

1. Instale dependencias:

```bash
npm install
```

2. Copie `.env.example` para `.env`

3. Suba o Redis:

```bash
docker compose up -d redis
```

4. Rode o worker:

```bash
npm run start:dev
```

## Rodando com Docker

```bash
docker compose up --build
```

## Integracao com a API

O payload esperado pelo worker:

```json
{
  "vodId": "cmxxx",
  "matchId": "cmxxx",
  "userId": "cmxxx",
  "map": "Ascent",
  "agent": "Jett",
  "result": "WIN",
  "score": "13-10"
}
```

O callback enviado para a API:

```json
{
  "vodId": "cmxxx",
  "matchId": "cmxxx",
  "processingStatus": "COMPLETED",
  "deathsFirst": 4,
  "entryKills": 7,
  "crosshairScore": 72.4,
  "utilityUsageScore": 68.9,
  "positioningScore": 74.2,
  "summary": "Seu ganho mais imediato esta em sobreviver melhor ao primeiro contato. Nesta partida, crosshair, posicionamento e first death ficaram abaixo da media esperada ao mesmo tempo, o que explica rounds ficando caros cedo demais."
}
```
