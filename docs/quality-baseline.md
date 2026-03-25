# Quality Baseline

## Objetivo

Congelar um padrao minimo antes de abrir mais features.

## Regras atuais

### API

- controllers finos
- services com regra
- repositories com acesso ao banco
- DTOs explicitos
- `HttpExceptionFilter` global
- `OwnershipGuard` global
- response envelope previsivel com `data`

### Worker

- jobs deterministas
- logs legiveis
- falha nao silenciosa
- retry configurado via BullMQ

### Web

- GET via React Query
- mutacoes via React Query
- `Notice` como feedback visual padrao
- `getErrorMessage` para mensagens consistentes

## Comandos de qualidade

Na raiz:

```bash
npm run quality:check
```

## Convencoes recomendadas

### Commits

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `chore:`
- `test:`

### Branches

- `feature/...`
- `fix/...`
- `refactor/...`
- `docs/...`

### Logs

- incluir contexto minimo (`jobId`, `vodId`, `matchId`) quando aplicavel
- evitar log silencioso ou generico demais

### Respostas HTTP

- sempre `data` no sucesso
- metadados de lista em `meta`
- erros via filtro global

## Criticos para manter

- nao duplicar regra de score no frontend
- nao duplicar heuristica de insight fora do domain da API
- nao mover logica pesada para controllers
