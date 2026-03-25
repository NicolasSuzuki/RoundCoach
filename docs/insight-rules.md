# Insight Rules

## Objetivo

Garantir que partidas parecidas gerem leituras parecidas.

Implementacao atual:

- [insight-engine.ts](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\roundcoach-api\src\domain\insight-engine\insight-engine.ts)

## Saidas geradas

- `strengthKey`
- `strengthLabel`
- `strengthText`
- `weaknessKey`
- `weaknessLabel`
- `weaknessText`
- `focusSuggestion`
- `microGoal`
- `recommendedTraining`
- `summary`
- `scenario`

## Cenarios atuais

- `fragile_openings`
- `good_prep_low_conversion`
- `balanced_mid`
- `mechanics_ahead_of_discipline`
- `stable_round_presence`
- `proactive_impact`
- `structured_but_passive`
- `high_baseline`
- `single_focus_improvement`

## Regra-base

1. extrair metricas normalizadas
2. ordenar pior e melhor metrica
3. detectar cenario
4. produzir texto deterministico

## Regras de tom

- evitar linguagem punitiva
- transformar fraqueza em ganho possivel
- manter treino acionavel
- preferir micro meta a lista genérica de conselhos

## Regra de manutencao

Se um cenario novo for adicionado:

1. definir gatilho no `detectScenario`
2. definir `summary`
3. revisar `weaknessText`, `strengthText` e `microGoal`
4. atualizar testes
5. atualizar este documento
