# RoundCoach Workspace

Workspace local do RoundCoach com:

- `roundcoach-api`
- `roundcoach-worker`
- `roundcoach-web`

## Subir tudo

Na pasta `roundCoach`:

```bash
npm run bootstrap
```

Ou, se quiser acompanhar os logs em foreground:

```bash
npm run up
```

Servicos expostos:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- Web: `http://localhost:5173`
- Worker health: `http://localhost:3002/health`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Scripts da raiz

```bash
npm run up
npm run up:detached
npm run bootstrap
npm run down
npm run logs
npm run ps
npm run migrate
npm run reset
npm run quality:check
```

Resumo:

- `up`: sobe tudo com build
- `up:detached`: sobe tudo em background
- `bootstrap`: sobe os servicos e aplica migrations
- `down`: derruba os containers
- `logs`: acompanha logs agregados
- `ps`: lista os servicos
- `migrate`: aplica migrations manualmente
- `reset`: derruba containers e remove volumes do compose
- `quality:check`: roda lint/build/test dos repos principais

## Fluxo atual do produto

1. criar conta
2. opcionalmente preencher perfil
3. criar partida
4. adicionar ou editar VOD
5. processar
6. API publica job no Redis
7. worker consome
8. callback interno conclui a analysis
9. dashboard e match detail refletem progresso

## Documentacao

Documentacao consolidada em [docs/architecture.md](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\docs\architecture.md):

- [core-product-objective.md](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\docs\core-product-objective.md)
- [architecture.md](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\docs\architecture.md)
- [product-flow.md](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\docs\product-flow.md)
- [scoring-rules.md](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\docs\scoring-rules.md)
- [insight-rules.md](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\docs\insight-rules.md)
- [worker-pipeline.md](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\docs\worker-pipeline.md)
- [local-setup.md](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\docs\local-setup.md)
- [quality-baseline.md](C:\Users\Suzuki\OneDrive\Documentos\dev\roundCoach\docs\quality-baseline.md)
