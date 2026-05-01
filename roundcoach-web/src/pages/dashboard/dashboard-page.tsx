import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../../components/ui/card';
import { Notice } from '../../components/ui/notice';
import { StatusBadge } from '../../components/ui/status-badge';
import { dashboardService } from '../../services/dashboard.service';
import { matchService } from '../../services/match.service';
import { getErrorMessage } from '../../utils/http-error';
import { formatDate } from '../../utils/format';

const focusLabels: Record<string, string> = {
  improve_post_contact_positioning: 'Melhorar reposicionamento',
  improve_post_plant_positioning: 'Melhorar pos-plant',
  use_utility_before_peeking: 'Usar util antes do peek',
  stabilize_crosshair_placement: 'Estabilizar crosshair',
  avoid_first_death: 'Evitar first death',
  convert_opening_duels: 'Converter abertura',
  play_and_process_matches: 'Processar mais partidas',
};

const metricLabels: Record<string, string> = {
  positioning: 'Posicionamento',
  utility: 'Uso de utilidade',
  crosshair: 'Crosshair',
  survival: 'Sobrevivencia inicial',
  consistency: 'Consistencia',
  entry: 'Entrada e abertura',
  no_data: 'Sem dados ainda',
};

const trendLabels: Record<'up' | 'down' | 'stable', string> = {
  up: 'Subindo',
  down: 'Caindo',
  stable: 'Estavel',
};

const trainingTrendLabels: Record<string, string> = {
  improving: 'Em evolucao',
  stable: 'Estavel',
  declining: 'Pedindo ajuste',
};

const trainingIntensityLabels: Record<string, string> = {
  low: 'Carga leve',
  medium: 'Carga media',
  high: 'Carga alta',
};

export function DashboardPage() {
  const matchesQuery = useQuery({
    queryKey: ['matches'],
    queryFn: matchService.list,
  });

  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardService.getSummary,
  });

  const evolutionQuery = useQuery({
    queryKey: ['dashboard', 'evolution'],
    queryFn: dashboardService.getEvolution,
  });

  const trainingPlanQuery = useQuery({
    queryKey: ['dashboard', 'training-plan'],
    queryFn: dashboardService.getTrainingPlan,
  });

  const summary = summaryQuery.data;
  const trainingPlan = trainingPlanQuery.data;
  const totalMatches = matchesQuery.data?.meta.total ?? 0;
  const hasAnalysedMatches = (summary?.totalAnalysedMatches ?? 0) > 0;
  const isFirstRun = !matchesQuery.isLoading && totalMatches === 0;
  const primaryCta = isFirstRun
    ? { to: '/matches', label: 'Criar primeira partida' }
    : { to: '/matches', label: 'Ver partidas' };

  return (
    <div className="grid gap-6">
      <Card className="bg-gradient-to-br from-ink to-pine text-sand">
        <p className="text-sm uppercase tracking-[0.3em] text-sand/60">
          Progress Panel
        </p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              {isFirstRun
                ? 'Seu primeiro passo no RoundCoach'
                : 'Seu painel de evolucao ja parece um coach'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-sand/70">
              {isFirstRun
                ? 'Crie uma partida, adicione um VOD e processe a analise para liberar seu painel de progresso.'
                : 'Score medio, tendencia, leitura do momento e treino acionavel na mesma tela.'}
            </p>
          </div>
          <Link
            to={primaryCta.to}
            className="rounded-full bg-sand px-5 py-3 text-sm font-semibold text-ink"
          >
            {primaryCta.label}
          </Link>
        </div>
        {summary?.profileCurrentGoal || summary?.profileCurrentFocus ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sand/60">
                Objetivo atual
              </p>
              <p className="mt-2 text-sm text-sand/90">
                {summary.profileCurrentGoal ??
                  'Defina um objetivo no perfil para personalizar o coach.'}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sand/60">
                Foco declarado
              </p>
              <p className="mt-2 text-sm text-sand/90">
                {summary.profileCurrentFocus ??
                  'Defina um foco atual para orientar os proximos ajustes.'}
              </p>
            </div>
          </div>
        ) : null}
      </Card>

      {summaryQuery.isError ? (
        <Notice tone="error" title="Nao foi possivel carregar o dashboard.">
          {getErrorMessage(
            summaryQuery.error,
            'Tente recarregar a pagina em alguns segundos.',
          )}
        </Notice>
      ) : null}

      {isFirstRun ? (
        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-ember">
            Primeira experiencia
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink">
            Voce entende o fluxo em menos de 20 segundos
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-sand/70 p-5">
              <p className="text-sm font-semibold text-ink">1. Crie uma partida</p>
              <p className="mt-2 text-sm text-ink/70">
                Registre mapa, agente, resultado e data da partida.
              </p>
            </div>
            <div className="rounded-[24px] bg-sand/70 p-5">
              <p className="text-sm font-semibold text-ink">2. Adicione o VOD</p>
              <p className="mt-2 text-sm text-ink/70">
                Use a URL do video para habilitar o processamento.
              </p>
            </div>
            <div className="rounded-[24px] bg-sand/70 p-5">
              <p className="text-sm font-semibold text-ink">3. Veja a leitura</p>
              <p className="mt-2 text-sm text-ink/70">
                O dashboard e a tela da partida passam a mostrar progresso, foco e treino.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/matches"
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-sand"
            >
              Criar primeira partida
            </Link>
            <Link
              to="/profile"
              className="rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink hover:bg-white"
            >
              Ajustar meu perfil
            </Link>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <MetricSummaryCard
          label="Partidas analisadas"
          value={summaryQuery.isLoading ? '--' : String(summary?.totalAnalysedMatches ?? 0)}
        />
        <MetricSummaryCard
          label="Score medio"
          value={summaryQuery.isLoading ? '--' : String(summary?.averageScore ?? 0)}
        />
        <MetricSummaryCard
          label="Media ultimas 5"
          value={summaryQuery.isLoading ? '--' : String(summary?.lastFiveAverageScore ?? 0)}
        />
        <MetricSummaryCard
          label="Tendencia"
          value={summary ? trendLabels[summary.trend] : '--'}
          caption="Ultimas partidas comparadas com a base anterior."
        />
        <Card>
          <p className="text-sm text-ink/60">Foco atual</p>
          <p className="mt-4 text-lg font-semibold text-ink">
            {trainingPlan
              ? metricLabels[trainingPlan.focusArea] ?? trainingPlan.focusArea
              : summary
                ? focusLabels[summary.focusSuggestion] ?? summary.focusSuggestion
                : '--'}
          </p>
          <div className="mt-3">
            <StatusBadge
              value={metricLabels[summary?.mainWeakness ?? 'no_data'] ?? 'PENDING'}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ember">
              Evolucao
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Score por partida</h2>
          </div>
          <span className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink">
            {evolutionQuery.data?.length ?? 0} pontos
          </span>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionQuery.data ?? []}>
              <CartesianGrid stroke="#d5dbe3" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#64748b" />
              <YAxis domain={[0, 100]} stroke="#64748b" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#dd6b20"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {!hasAnalysedMatches && !evolutionQuery.isLoading ? (
          <Notice className="mt-6" title="Seu grafico aparece depois da primeira analise.">
            Assim que voce processar um VOD, o score por partida comeca a mostrar sua evolucao.
          </Notice>
        ) : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr),minmax(0,1.28fr)]">
        <Card className="overflow-hidden">
          <div className="flex h-full flex-col">
            <p className="text-xs uppercase tracking-[0.22em] text-ember">
              Diagnostico agregado
            </p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-ink">
                  Leitura das ultimas {summary?.totalAnalysedMatches ?? 0} partidas
                </h2>
                <p className="mt-2 text-sm text-ink/55">
                  Prioridade calculada pelo historico recente, tendencia e consistencia.
                </p>
              </div>
              <StatusBadge
                value={summary ? trendLabels[summary.trend] : 'PENDING'}
              />
            </div>
            {summary ? (
              <div className="mt-4">
                <StatusBadge
                  value={
                    summary.coachWritingSource === 'ai'
                      ? 'Texto por IA'
                      : 'Texto deterministico'
                  }
                />
              </div>
            ) : null}
            <p className="mt-5 text-base leading-7 text-ink/80">
              {summary?.observation ??
                'Processe mais partidas para liberar um insight mais claro sobre sua evolucao.'}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InsightBox
                label="Maior gargalo"
                value={metricLabels[summary?.mainWeakness ?? 'no_data'] ?? '--'}
              />
              <InsightBox
                label="Base mais confiavel"
                value={metricLabels[summary?.mainStrength ?? 'no_data'] ?? '--'}
              />
              <InsightBox
                label="Foco da semana"
                value={metricLabels[summary?.weeklyWeakness ?? 'no_data'] ?? '--'}
              />
              <InsightBox
                label="Padrao positivo"
                value={metricLabels[summary?.recurringStrength ?? 'no_data'] ?? '--'}
              />
            </div>
            <div className="mt-auto pt-6">
              <div className="rounded-[28px] bg-pine/10 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-pine/70">
                  Proxima decisao
                </p>
                <p className="mt-3 text-sm leading-6 text-ink/75">
                  Use o plano ao lado como regra de fila: mantenha o ponto forte
                  ativo e force apenas um ajuste principal por partida.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-white via-white to-sand/70">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-ember">
                Coach atual
              </p>
              <h2 className="mt-2 text-2xl font-bold text-ink">
                Plano de treino da semana
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
                O foco abaixo transforma o diagnostico das partidas em aquecimento,
                regra de jogo e revisao curta.
              </p>
            </div>
            {trainingPlan ? (
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  value={
                    trainingPlan.coachWritingSource === 'ai'
                      ? 'Texto por IA'
                      : 'Texto deterministico'
                  }
                />
                <StatusBadge
                  value={trainingTrendLabels[trainingPlan.trend] ?? trainingPlan.trend}
                />
                <StatusBadge
                  value={trainingIntensityLabels[trainingPlan.intensity] ?? trainingPlan.intensity}
                />
              </div>
            ) : null}
          </div>

          {trainingPlanQuery.isError ? (
            <Notice className="mt-5" tone="error" title="Nao foi possivel carregar o plano de treino.">
              {getErrorMessage(
                trainingPlanQuery.error,
                'Tente recarregar a pagina para gerar ou atualizar o plano.',
              )}
            </Notice>
          ) : null}

          {trainingPlanQuery.isLoading ? (
            <Notice className="mt-5" title="Gerando leitura de treino...">
              O RoundCoach esta organizando um foco semanal e uma micro meta para sua proxima fila.
            </Notice>
          ) : null}

          {trainingPlan ? (
            <div className="mt-6 grid gap-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr),minmax(260px,0.75fr)]">
                <div className="rounded-[28px] bg-white p-5 ring-1 ring-ink/10">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge
                      value={metricLabels[trainingPlan.focusArea] ?? trainingPlan.focusArea}
                    />
                    <p className="text-xs uppercase tracking-[0.18em] text-ink/45">
                      Foco da semana
                    </p>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-ink">
                    {trainingPlan.weeklyFocusPlan.title}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-ink/75">
                    {trainingPlan.justification}
                  </p>
                  <div className="mt-5 grid gap-2">
                    {trainingPlan.weeklyFocusPlan.goals.map((goal) => (
                      <div
                        key={goal}
                        className="rounded-2xl bg-sand/70 px-4 py-3 text-sm leading-6 text-ink/80"
                      >
                        {goal}
                      </div>
                    ))}
                  </div>
                </div>

                <CoachHighlight
                  label="Micro meta da proxima fila"
                  value={trainingPlan.microGoal}
                  tone="primary"
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <TrainingColumn title="Warmup" items={trainingPlan.dailyTrainingPlan.warmup} />
                <TrainingColumn title="Durante a partida" items={trainingPlan.dailyTrainingPlan.inGame} />
                <TrainingColumn title="Review" items={trainingPlan.dailyTrainingPlan.review} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <CoachHighlight
                  label="Ponto forte para manter"
                  value={metricLabels[trainingPlan.mainStrength] ?? trainingPlan.mainStrength}
                />
                <CoachHighlight
                  label="Ajuste prioritario"
                  value={metricLabels[trainingPlan.mainWeakness] ?? trainingPlan.mainWeakness}
                />
              </div>

              {trainingPlan.isOnboarding ? (
                <Notice title="Plano inicial liberado.">
                  Conforme mais partidas forem analisadas, esse coach fica mais especifico e mais confiante nas recomendacoes.
                </Notice>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ember">
              Lista de partidas
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Historico recente</h2>
          </div>
          <Link
            to="/matches"
            className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink hover:bg-white"
          >
            Ver todas
          </Link>
        </div>
        <div className="grid gap-4">
          {matchesQuery.isLoading ? (
            <Notice title="Carregando suas partidas...">
              Assim que os dados chegarem, o historico recente aparece aqui.
            </Notice>
          ) : null}
          {matchesQuery.isError ? (
            <Notice tone="error" title="Nao foi possivel carregar suas partidas.">
              {getErrorMessage(
                matchesQuery.error,
                'Tente recarregar a pagina para atualizar o historico.',
              )}
            </Notice>
          ) : null}
          {!matchesQuery.isLoading && !matchesQuery.isError && totalMatches === 0 ? (
            <Notice title="Nenhuma partida registrada ainda.">
              Crie sua primeira partida para comecar o fluxo de VOD, processamento e analise.
            </Notice>
          ) : null}
          {matchesQuery.data?.data.map((match) => (
            <Link
              key={match.id}
              to={`/matches/${match.id}`}
              className="rounded-[24px] border border-ink/10 bg-sand/60 p-5 transition hover:border-ember hover:bg-white"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-ink">
                    {match.map} - {match.agent}
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    {formatDate(match.matchDate)}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge value={match.result} />
                  <p className="mt-2 font-mono text-sm text-ink">{match.score}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetricSummaryCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <Card>
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-4 text-4xl font-bold text-ink">{value}</p>
      {caption ? <p className="mt-3 text-sm text-ink/55">{caption}</p> : null}
    </Card>
  );
}

function InsightBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-sand/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">{label}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

function CoachHighlight({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'primary';
}) {
  const toneClass =
    tone === 'primary'
      ? 'bg-ink text-sand border-ink/10'
      : 'bg-white/80 text-ink border-ink/10';

  return (
    <div className={`rounded-[24px] border p-4 ${toneClass}`}>
      <p className={`text-xs uppercase tracking-[0.18em] ${tone === 'primary' ? 'text-sand/60' : 'text-ink/45'}`}>
        {label}
      </p>
      <p className="mt-3 text-sm font-semibold leading-6">{value}</p>
    </div>
  );
}

function TrainingColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[28px] border border-ink/10 bg-white/80 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">{title}</p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-2xl bg-sand/70 px-3 py-3 text-sm leading-6 text-ink/80">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
