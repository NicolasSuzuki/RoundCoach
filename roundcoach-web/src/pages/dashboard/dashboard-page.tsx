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
  entry: 'Entrada e abertura',
  no_data: 'Sem dados ainda',
};

const trendLabels: Record<'up' | 'down' | 'stable', string> = {
  up: 'Subindo',
  down: 'Caindo',
  stable: 'Estavel',
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

  const summary = summaryQuery.data;
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
                : 'Score medio, tendencia por partida, principal fraqueza e treino sugerido na mesma tela.'}
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
                O dashboard e a tela da partida passam a mostrar progresso e foco.
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
            {summary ? focusLabels[summary.focusSuggestion] ?? summary.focusSuggestion : '--'}
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

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-ember">
            Observacao geral
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink">
            O que mais pede atencao agora
          </h2>
          <p className="mt-4 text-base leading-7 text-ink/80">
            {summary?.observation ??
              'Processe mais partidas para liberar um insight mais claro sobre sua evolucao.'}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <InsightBox
              label="Principal fraqueza"
              value={metricLabels[summary?.mainWeakness ?? 'no_data'] ?? '--'}
            />
            <InsightBox
              label="Principal forca"
              value={metricLabels[summary?.mainStrength ?? 'no_data'] ?? '--'}
            />
            <InsightBox
              label="Area da semana"
              value={metricLabels[summary?.weeklyWeakness ?? 'no_data'] ?? '--'}
            />
            <InsightBox
              label="Forca recorrente"
              value={metricLabels[summary?.recurringStrength ?? 'no_data'] ?? '--'}
            />
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-ember">
            Treino sugerido
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Plano rapido de hoje</h2>
          <div className="mt-5 grid gap-3">
            {(summary?.recommendedTraining?.length
              ? summary.recommendedTraining
              : [
                  'Crie e processe a primeira partida para liberar um treino sugerido.',
                ]).map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-ink/10 bg-white/70 p-4 text-sm text-ink/80"
              >
                {item}
              </div>
            ))}
          </div>
          {summary?.profileMainAgents?.length ? (
            <div className="mt-5 rounded-3xl bg-sand/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/50">
                Agentes principais
              </p>
              <p className="mt-2 text-sm text-ink/80">
                {summary.profileMainAgents.join(', ')}
              </p>
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
                    {match.map} · {match.agent}
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
