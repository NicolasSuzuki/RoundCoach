# Scoring Rules

## Objetivo

Transformar as metricas da analysis em um `overallScore` consistente e previsivel.

Implementacao atual:

- [scoring-engine.ts](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\roundcoach-api\src\domain\scoring\scoring-engine.ts)

## Inputs

- `positioningScore`
- `utilityUsageScore`
- `avgCrosshairScore`
- `deathsFirst`
- `entryKills`

## Normalizacao

- `positioning`, `utility`, `crosshair`: usados em escala 0-100
- `survival`: `100 - deathsFirst * 11`
- `entry`: `entryKills * 8.5`

Todos os scores sao clampados para `0..100`.

## Pesos atuais

- `positioning`: `0.28`
- `utility`: `0.18`
- `crosshair`: `0.28`
- `survival`: `0.16`
- `entry`: `0.10`

## Formula

```txt
overallScore =
  positioning * 0.28 +
  utility * 0.18 +
  crosshair * 0.28 +
  survival * 0.16 +
  entry * 0.10
```

## Intencao do desenho

- mecanica e posicionamento pesam mais
- sobrevivencia importa, mas nao domina sozinha
- entrada impacta, mas nao deve distorcer a leitura inteira

## Regra de manutencao

Se os pesos mudarem:

1. atualizar `scoring-engine.ts`
2. revisar `insight-engine`
3. revisar testes
4. atualizar este documento
