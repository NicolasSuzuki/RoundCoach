# Architecture

## Workspace

O workspace e dividido em 3 repos ativos:

- `roundcoach-api`: regra de negocio, auth, persistencia, dashboard e contrato com worker
- `roundcoach-worker`: consumo da fila e simulacao deterministica de analise
- `roundcoach-web`: experiencia do usuario, dashboard, partidas, VOD e perfil

Infra local compartilhada:

- PostgreSQL
- Redis
- Docker Compose na raiz

## API

Estrutura predominante:

- `modules/`: controllers, dtos, entities, repositories, services
- `integrations/queue`: publicacao BullMQ
- `common/`: guardas, filtros, utils e compatibilidade
- `domain/`: regras centrais de score e insight engine

Decisao atual:

- controllers finos
- services com regra
- repositories com Prisma
- DTOs explicitos
- `OwnershipGuard` registrado globalmente em [app.module.ts](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\roundcoach-api\src\app.module.ts)

Observacao arquitetural:

- `dashboard.service.ts` concentra agregacao do dashboard, mas o calculo de score e a heuristica de insight ja foram extraidos para `domain/`
- `common/analysis` existe hoje como camada de compatibilidade; o caminho novo recomendado e `src/domain`

## Domain Layer

Camadas adicionadas:

- `src/domain/scoring`
- `src/domain/insight-engine`
- `src/domain/simulation`

Responsabilidades:

- `scoring`: normalizacao de metricas e `overallScore`
- `insight-engine`: `strength`, `weakness`, `focusSuggestion`, `microGoal`, `summary`
- `simulation`: worker intermediario fake, mas plausivel e deterministico

## Worker

Pipeline:

1. consome `vod-processing`
2. aguarda delay configurado
3. gera metricas via simulacao deterministica
4. monta `summary`
5. envia callback para `POST /api/v1/internal/analysis-result`

## Web

Estrutura predominante:

- `pages/`: telas por rota
- `services/`: acesso HTTP
- `components/ui`: primitives reutilizaveis
- `utils/`: formatacao e tratamento de erro
- `store/`: auth persistido em Zustand

Padrao atual:

- React Query para GET e mutacoes
- estado local simples por formulario
- `Notice` para feedback visual padronizado

## Riscos conhecidos

- bundle do web ainda grande; otimizar depois com code-splitting
- `dashboard.service.ts` ainda mistura acesso a dados e composicao do resumo; manter atento se crescer mais
- worker ainda nao faz processamento real de video
