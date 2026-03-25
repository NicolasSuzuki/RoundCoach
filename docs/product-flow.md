# Product Flow

## Fluxo principal

1. usuario cria conta
2. usuario faz login
3. opcionalmente preenche perfil
4. usuario cria partida
5. usuario adiciona VOD
6. usuario dispara processamento
7. API cria ou atualiza `analysis` como `PROCESSING`
8. API publica job no Redis
9. worker consome e processa
10. worker chama endpoint interno
11. API conclui `analysis` e marca `vod` como `PROCESSED`
12. dashboard e match detail refletem o resultado

## Primeira experiencia desejada

Em menos de 20 segundos o usuario deve entender:

- criar partida
- adicionar VOD
- processar
- voltar ao dashboard para ver progresso

## Superficies do produto

### Dashboard

- resumo de progresso
- grafico de score
- observacao geral
- treino sugerido
- historico recente

### Partidas

- criar partida
- abrir detalhe
- editar ou adicionar VOD
- processar ou reprocessar

### Match Detail

- status da analysis
- status do VOD
- metricas principais
- foco, forca, ajuste prioritario e micro meta

### Perfil

- elo atual
- objetivo
- agentes principais
- role principal
- foco atual

Esses dados personalizam o dashboard e o treino sugerido.
