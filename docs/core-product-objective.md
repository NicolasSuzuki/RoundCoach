# Core Product Objective

RoundCoach e um companion app para jogadores competitivos de VALORANT.

O objetivo principal do produto e:

Gerar analise clara do desempenho do jogador e recomendar treino personalizado para acelerar sua evolucao competitiva.

RoundCoach nao deve ser tratado como apenas um tracker ou dashboard de estatisticas.

O valor principal do produto esta em transformar dados de partidas em orientacao pratica de melhoria.

## Visao do produto

RoundCoach opera em dois niveis de analise:

1. analise automatica de partidas
2. analise profunda por VOD

O sistema deve ajudar o jogador a:

- entender erros recorrentes
- entender pontos fortes
- acompanhar evolucao ao longo do tempo
- receber recomendacoes claras de treino

## Fontes de dados

O produto deve suportar:

1. importacao automatica de partidas via Riot API, quando disponivel e aprovada
2. registro manual de partidas
3. upload de VOD para analise aprofundada

## Motores principais

### Match Analysis Engine

Responsavel por:

- calcular `overallScore`
- calcular score por area
- gerar resumo da performance
- detectar tendencia de evolucao

Entradas:

- dados da partida
- metricas derivadas

Saidas:

- `overallScore`
- `strengths`
- `weaknesses`
- `focusArea`

### Insight Engine

Responsavel por:

- identificar padroes recorrentes
- detectar principal problema atual
- detectar principal forca
- gerar observacao geral do momento

Entradas:

- historico de partidas
- scores agregados
- frequencia de eventos relevantes

Saidas:

- `mainWeakness`
- `mainStrength`
- `weeklyFocus`
- `performanceTrend`

### Training Recommendation Engine

Este e o motor mais importante do produto.

Responsavel por:

- gerar treino diario personalizado
- gerar treino semanal
- sugerir micro metas para a proxima partida
- adaptar treino conforme evolucao

Entradas:

- diagnostico atual
- perfil do jogador
- historico recente

Saidas:

- `dailyTrainingPlan`
- `weeklyFocusPlan`
- `microGoals`

O treino deve ser:

- claro
- acionavel
- especifico
- baseado em problemas reais detectados

## Modos de uso

### Modo coach automatico

- sistema importa ou recebe partidas
- analise rapida e gerada
- dashboard mostra evolucao
- treino e atualizado automaticamente

### Modo review profunda

- usuario sobe VOD
- analise detalhada e gerada
- erros taticos sao destacados
- treino especifico e sugerido

## Objetivo do MVP

Permitir que o jogador:

- registre ou importe partidas
- obtenha analise consistente
- receba treino personalizado
- acompanhe evolucao no dashboard
- faca review profunda por VOD

## Metricas de sucesso do produto

- jogador processa multiplas partidas
- jogador retorna ao dashboard em dias diferentes
- jogador segue treino sugerido
- jogador percebe melhora na consistencia

## Mentalidade de engenharia

- analise e meio, nao fim
- dados sao meio, nao fim
- IA e meio, nao fim

O fim e:

Ajudar o jogador a evoluir de forma clara e pratica.

Toda decisao tecnica deve priorizar:

- confiabilidade da analise
- utilidade do treino
- clareza da evolucao
- simplicidade operacional
