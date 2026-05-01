# Patch Notes - 2026-05-01

## Resumo

Este ciclo consolidou a base do RoundCoach para VALORANT com importacao local de partidas, scoreboard detalhado, diagnostico agregado das ultimas partidas, plano de treino persistido e a primeira camada de geracao textual com provider configuravel.

## Entregas

### Importacao local de partidas do VALORANT

- Script local para importar partidas recentes a partir da sessao do cliente.
- Normalizacao de mapa, agente e queue.
- Filtro padrao para partidas competitivas.
- Persistencia de snapshot bruto da partida importada.
- Persistencia de jogadores do scoreboard por partida.
- Marcacao do jogador atual no scoreboard importado.

### Scoreboard e leitura de partida

- Tela da partida com scoreboard importado por time.
- Destaque visual para a linha do jogador atual.
- Tooltips nos cards de metricas explicando calculo e significado.
- Base para leitura orientada pelos dados do scoreboard em vez de texto mockado.

### Motor de analise da partida

- `MatchAnalysisEngineService` para derivar metricas a partir do scoreboard importado.
- Correcao de edge case para `firstDeaths = 0`.
- Testes unitarios cobrindo a leitura principal.

### Diagnostico agregado do dashboard

- `PlayerDiagnosisEngineService` analisa ate 20 partidas concluidas.
- Diagnostico usando score medio, score recente, tendencia, consistencia, fraqueza principal, forca principal e foco sugerido.
- Exclusao de ruido ao considerar queue competitiva quando houver snapshot importado.

### Plano de treino

- `TrainingEngineService` e modulo de `training-plans`.
- Persistencia de plano atual com foco, intensidade, justificativa, micro meta e planos diarios.
- Dashboard consumindo o plano atual pronto para exibicao.

### Escrita de coach com provider configuravel

- `CoachWriterService` com fallback deterministico.
- Integracao inicial com OpenAI `responses`.
- Configuracao expandida para provider generico:
  - `openai`
  - `ollama`
- Adaptacao para `chat/completions` do Ollama quando o provider local estiver ativo.
- Logs de fallback para diagnosticar falha de geracao.

### Performance e controle de custo

- Snapshot persistido do resumo agregado do dashboard por usuario.
- Assinatura baseada em:
  - ultimas analises concluidas
  - perfil do usuario
  - total de partidas
- Quando a assinatura nao muda, o dashboard devolve o snapshot salvo e evita nova geracao textual.

### Dashboard web

- Revisao visual da area de diagnostico agregado e coach atual.
- Layout mais legivel para foco semanal, micro meta e rotinas de warmup/in-game/review.
- Indicador visual da origem do texto:
  - `Texto por IA`
  - `Texto deterministico`

## Estado atual

- Importacao local de partidas competitivas: funcional.
- Scoreboard importado e destacado: funcional.
- Diagnostico agregado das ultimas 20 partidas: funcional.
- Snapshot persistido do dashboard: funcional.
- OpenAI: configurado, mas dependente de billing/quota.
- Ollama: configurado no backend e acessivel pelo container, mas ainda precisa endurecer o parse de JSON para evitar fallback em respostas malformadas.

## Proximos passos

1. Persistir snapshot textual da analise da partida para evitar regeneracao do resumo, treino rapido e foco da proxima partida.
2. Endurecer a integracao com Ollama:
   - melhorar parsing de JSON
   - reduzir respostas malformadas
   - validar fluxo completo no dashboard
3. Invalidar snapshots de forma explicita quando:
   - nova analise concluir
   - perfil do usuario mudar
   - plano de treino ativo mudar
4. Refinar coerencia entre:
   - scoreboard
   - metricas calculadas
   - texto exibido
5. Melhorar observabilidade:
   - expor motivo do fallback na UI ou em endpoint de debug
   - registrar provider usado por geracao
6. Evoluir UX:
   - status de geracao
   - estados vazios mais claros
   - loading mais contextual
