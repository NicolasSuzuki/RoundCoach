# Worker Pipeline

## Objetivo

Fase intermediaria entre stub puro e processamento real de video.

## Pipeline atual

1. API publica job em `vod-processing`
2. payload inclui:
   - `vodId`
   - `matchId`
   - `userId`
   - `map`
   - `agent`
   - `result`
   - `score`
3. worker consome via BullMQ
4. worker espera `PROCESSING_DELAY_MS`
5. worker roda simulacao deterministica
6. worker monta `summary`
7. worker envia callback interno

## Determinismo

O seed usa:

- `userId`
- `matchId`
- `vodId`
- `map`
- `agent`
- `result`
- `score`

Isso garante:

- reproducibilidade
- mesma partida produz o mesmo resultado
- mudancas de contexto produzem variacao plausivel

## Fontes de variacao

- agente
- mapa
- resultado
- score da partida

## Retry e falha

- BullMQ usa `attempts: 3`
- jobs concluidos e falhos sao mantidos com limite de remocao
- falha do callback gera log claro no worker

## Logging atual

- `ready`
- `completed`
- `failed`

Padrao desejado:

- sempre incluir `jobId`
- sempre incluir contexto suficiente para diagnostico rapido

## Futuro

Proxima fase:

- extracao de frames
- ffmpeg
- heuristicas por evento de round
- depois visao computacional real
