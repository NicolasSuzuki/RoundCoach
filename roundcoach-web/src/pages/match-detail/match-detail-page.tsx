import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Notice } from '../../components/ui/notice';
import { StatusBadge } from '../../components/ui/status-badge';
import { analysisService } from '../../services/analysis.service';
import { matchService } from '../../services/match.service';
import { vodService } from '../../services/vod.service';
import { getErrorMessage } from '../../utils/http-error';
import { formatDate, formatScore } from '../../utils/format';

export function MatchDetailPage() {
  const queryClient = useQueryClient();
  const { matchId = '' } = useParams();

  const matchQuery = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => matchService.getById(matchId),
  });

  const vodsQuery = useQuery({
    queryKey: ['vods', matchId],
    queryFn: () => vodService.listByMatch(matchId),
  });

  const analysisQuery = useQuery({
    queryKey: ['analysis', matchId],
    queryFn: () => analysisService.getByMatchId(matchId),
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.processingStatus;
      return status === 'PROCESSING' ? 2500 : false;
    },
  });

  const processMutation = useMutation({
    mutationFn: (vodId: string) => vodService.process(vodId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vods', matchId] }),
        queryClient.invalidateQueries({ queryKey: ['analysis', matchId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'evolution'] }),
      ]);
    },
  });

  const vod = vodsQuery.data?.data[0];
  const analysis = analysisQuery.data;
  const coach = analysis?.coach;
  const scoreboardPlayers = matchQuery.data?.scoreboardPlayers ?? [];
  const groupedScoreboard = scoreboardPlayers.reduce(
    (accumulator, player) => {
      accumulator[player.teamId] ??= [];
      accumulator[player.teamId].push(player);
      return accumulator;
    },
    {} as Record<string, typeof scoreboardPlayers>,
  );
  const isProcessing = analysis?.processingStatus === 'PROCESSING';
  const isFailed =
    analysis?.processingStatus === 'FAILED' || vod?.status === 'FAILED';
  const canProcess = Boolean(vod) && !processMutation.isPending && !isProcessing;
  const processLabel =
    vod?.status === 'PROCESSED' || analysis?.processingStatus === 'COMPLETED'
      ? 'Reprocessar VOD'
      : 'Processar VOD';

  if (matchQuery.isLoading) {
    return (
      <Notice title="Carregando partida...">
        Assim que os dados chegarem, voce vai ver o VOD, o status e a analise no mesmo lugar.
      </Notice>
    );
  }

  if (matchQuery.isError || !matchQuery.data) {
    return (
      <Notice tone="error" title="Nao foi possivel abrir esta partida.">
        {getErrorMessage(
          matchQuery.error,
          'Verifique se a partida ainda existe e tente novamente.',
        )}
      </Notice>
    );
  }

  return (
    <div className="grid gap-6">
      {processMutation.isError ? (
        <Notice tone="error" title="Nao foi possivel iniciar o processamento.">
          {getErrorMessage(
            processMutation.error,
            'Tente novamente em alguns segundos.',
          )}
        </Notice>
      ) : null}

      {isProcessing ? (
        <Notice tone="warning" title="Analise em processamento.">
          O worker ja recebeu o job. Esta tela atualiza sozinha assim que o resultado chegar.
        </Notice>
      ) : null}

      {isFailed ? (
        <Notice tone="error" title="O processamento falhou nesta tentativa.">
          Revise os dados do VOD e tente reprocessar. Se o problema persistir, ajuste a URL e tente de novo.
        </Notice>
      ) : null}

      {analysisQuery.isError && !analysis ? (
        <Notice tone="warning" title="A analise ainda nao esta disponivel.">
          {getErrorMessage(
            analysisQuery.error,
            'Processe o VOD para liberar os insights desta partida.',
          )}
        </Notice>
      ) : null}

      {!vod ? (
        <Notice title="Falta adicionar o VOD.">
          O proximo passo aqui e preencher os dados do video para liberar o processamento da analise.
        </Notice>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr,0.9fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-ember">
                Match Detail
              </p>
              <h1 className="mt-3 text-3xl font-bold text-ink">
                {matchQuery.data.map} · {matchQuery.data.agent}
              </h1>
              <p className="mt-2 text-sm text-ink/60">
                {formatDate(matchQuery.data.matchDate)}
              </p>
            </div>
            <StatusBadge value={matchQuery.data.result} />
          </div>

          <div className="mt-8 grid gap-4 rounded-[28px] bg-sand/70 p-5 md:grid-cols-3">
            <InfoBlock label="Placar" value={matchQuery.data.score} mono />
            <InfoBlock label="Resultado" value={matchQuery.data.result} />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">
                Analise
              </p>
              <div className="mt-2">
                <StatusBadge value={analysis?.processingStatus ?? 'PENDING'} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={`/matches/${matchId}/vod`}
              className="rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink hover:bg-white"
            >
              {vod ? 'Editar dados do VOD' : 'Adicionar dados do VOD'}
            </Link>
            <Button
              disabled={!canProcess}
              onClick={() => vod && processMutation.mutate(vod.id)}
            >
              {processMutation.isPending ? 'Enfileirando...' : processLabel}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-ink">Estado do VOD</h2>
          {vodsQuery.isLoading ? (
            <Notice className="mt-6" title="Carregando VOD...">
              Assim que os dados chegarem, o status aparece aqui.
            </Notice>
          ) : null}
          {vodsQuery.isError ? (
            <Notice className="mt-6" tone="error" title="Nao foi possivel carregar o VOD.">
              {getErrorMessage(vodsQuery.error, 'Tente atualizar a pagina.')}
            </Notice>
          ) : null}
          {vod ? (
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl bg-signal p-5">
                <p className="text-sm font-semibold text-ink">{vod.fileName}</p>
                <p className="mt-2 text-xs text-ink/60">{vod.fileUrl}</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-ink/10 p-4">
                <span className="text-sm text-ink/60">Status</span>
                <StatusBadge value={vod.status} />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-ink/10 p-4">
                <span className="text-sm text-ink/60">Duracao</span>
                <span className="font-mono text-sm text-ink">
                  {vod.durationSeconds ? `${vod.durationSeconds}s` : '--'}
                </span>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      {scoreboardPlayers.length > 0 ? (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-ember">
                Scoreboard importado
              </p>
              <h2 className="mt-2 text-2xl font-bold text-ink">
                Performance dos jogadores
              </h2>
            </div>
            <span className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink">
              {scoreboardPlayers.length} jogadores
            </span>
          </div>

          <div className="mt-6 grid gap-6">
            {Object.entries(groupedScoreboard).map(([teamId, players]) => (
              <div key={teamId} className="overflow-hidden rounded-[24px] border border-ink/10">
                <div className="flex items-center justify-between bg-ink px-4 py-3 text-sand">
                  <p className="text-sm font-semibold">Time {teamId}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-sand/60">
                    ACS ordenado
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[860px] w-full border-collapse text-sm">
                    <thead className="bg-sand/80 text-xs uppercase tracking-[0.12em] text-ink/55">
                      <tr>
                        <th className="px-4 py-3 text-left">Jogador</th>
                        <th className="px-4 py-3 text-left">Agente</th>
                        <th className="px-4 py-3 text-right">ACS</th>
                        <th className="px-4 py-3 text-right">K</th>
                        <th className="px-4 py-3 text-right">D</th>
                        <th className="px-4 py-3 text-right">A</th>
                        <th className="px-4 py-3 text-right">K/D</th>
                        <th className="px-4 py-3 text-right">ADR</th>
                        <th className="px-4 py-3 text-right">HS%</th>
                        <th className="px-4 py-3 text-right">FK</th>
                        <th className="px-4 py-3 text-right">FD</th>
                        <th className="px-4 py-3 text-right">MK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...players]
                        .sort((left, right) => right.acs - left.acs)
                        .map((player) => (
                          <tr
                            key={player.id}
                            className={`border-t border-ink/10 ${
                              player.isCurrentUser
                                ? 'bg-signal/70 ring-2 ring-inset ring-ember/30'
                                : 'bg-white/70'
                            }`}
                          >
                            <td className="px-4 py-3 font-semibold text-ink">
                              {player.gameName}
                              {player.isCurrentUser ? (
                                <span className="ml-2 rounded-full bg-ember px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
                                  Voce
                                </span>
                              ) : null}
                              {player.tagLine ? (
                                <span className="ml-1 text-xs text-ink/45">
                                  #{player.tagLine}
                                </span>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 text-ink/70">{player.agent}</td>
                            <td className="px-4 py-3 text-right font-semibold text-ink">
                              {formatNumber(player.acs)}
                            </td>
                            <td className="px-4 py-3 text-right text-ink">{player.kills}</td>
                            <td className="px-4 py-3 text-right text-ink">{player.deaths}</td>
                            <td className="px-4 py-3 text-right text-ink">{player.assists}</td>
                            <td className="px-4 py-3 text-right font-semibold text-ink">
                              {formatNumber(player.kills / Math.max(1, player.deaths))}
                            </td>
                            <td className="px-4 py-3 text-right text-ink/70">
                              {formatOptionalNumber(player.adr)}
                            </td>
                            <td className="px-4 py-3 text-right text-ink/70">
                              {formatOptionalNumber(player.headshotPercentage)}
                            </td>
                            <td className="px-4 py-3 text-right text-ink/70">
                              {player.firstKills}
                            </td>
                            <td className="px-4 py-3 text-right text-ink/70">
                              {player.firstDeaths}
                            </td>
                            <td className="px-4 py-3 text-right text-ink/70">
                              {player.multiKills}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ember">
              Analise da partida
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">
              Insight consolidado logo abaixo
            </h2>
          </div>
          <StatusBadge value={analysis?.processingStatus ?? 'PENDING'} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Overall Score"
            value={formatScore(analysis?.overallScore)}
            description="Nota geral calculada a partir dos scores de crosshair, utilidade, posicionamento, sobrevivencia inicial e entrada."
          />
          <MetricCard
            label="Deaths First"
            value={formatScore(analysis?.deathsFirst)}
            description="Quantidade de rounds em que voce foi a primeira morte. Em partidas importadas, vem dos primeiros duelos do scoreboard."
          />
          <MetricCard
            label="Entry Kills"
            value={formatScore(analysis?.entryKills)}
            description="Quantidade de rounds em que voce abriu vantagem com a primeira kill. Em partidas importadas, vem dos primeiros duelos."
          />
          <MetricCard
            label="Crosshair Score"
            value={formatScore(analysis?.avgCrosshairScore)}
            description="Score estimado com base em ACS, HS%, saldo de K/D e impacto mecanico no scoreboard."
          />
          <MetricCard
            label="Utility Usage"
            value={formatScore(analysis?.utilityUsageScore)}
            description="Score estimado com base em assists, ADR e contexto de vitoria ou derrota. Nao mede lineups ou timing de utilidade ainda."
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px,1fr]">
          <MetricCard
            label="Positioning Score"
            value={formatScore(analysis?.positioningScore)}
            description="Score estimado com base em K/D, ADR, resultado da partida e first deaths. Ainda nao substitui review de VOD."
          />
          <div className="rounded-[28px] bg-sand/70 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/50">Summary</p>
            <p className="mt-4 text-base leading-7 text-ink/80">
              {analysis?.summary ??
                'A analise ainda nao foi concluida. Assim que o worker responder, os insights aparecem aqui automaticamente.'}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <CoachPanel
            title="Foco da proxima partida"
            heading={coach?.weaknessLabel ?? 'Analise pendente'}
            text={
              coach?.weaknessText ??
              'Assim que a analise terminar, este bloco vai apontar o ganho mais acessivel desta partida e transformar os numeros em proxima acao.'
            }
          />
          <div className="rounded-[28px] border border-ink/10 bg-white/75 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/50">
              Treino rapido sugerido
            </p>
            <div className="mt-4 grid gap-3">
              {(coach?.recommendedTraining ?? [
                'Processar o VOD para liberar o insight.',
                'Voltar a esta tela em alguns segundos.',
                'Comparar o foco da partida com o foco do dashboard.',
              ]).map((item) => (
                <div
                  key={item}
                  className="rounded-3xl bg-sand/70 p-4 text-sm text-ink/80"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <CoachHighlight
            toneClass="bg-[#eef7ea]"
            label="Forca principal"
            heading={coach?.strengthLabel ?? 'Base em construcao'}
            text={
              coach?.strengthText ??
              'Assim que o processamento terminar, o sistema destaca o ponto que ja sustentou melhor a partida para voce repetir com mais consistencia.'
            }
          />
          <CoachHighlight
            toneClass="bg-[#fff3dd]"
            label="Ajuste prioritario"
            heading={coach?.weaknessLabel ?? 'Ajuste aguardando leitura'}
            text={
              coach?.weaknessText ??
              'O ajuste prioritario aparece aqui logo depois da analise, sempre em formato de melhoria pratica e objetiva.'
            }
          />
          <CoachHighlight
            toneClass="bg-[#f3efe8]"
            label="Micro meta da proxima fila"
            heading={coach?.weaknessLabel ?? 'Uma partida, um foco'}
            text={
              coach?.microGoal ??
              'A ideia aqui e sair com uma meta simples para a proxima fila, sem sobrecarregar sua leitura.'
            }
          />
        </div>
      </Card>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{label}</p>
      <p className={`mt-2 text-2xl font-semibold text-ink ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-[24px] border border-ink/10 bg-white/70 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">{label}</p>
      <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
      <div className="pointer-events-none absolute left-4 right-4 top-[calc(100%-8px)] z-20 rounded-2xl bg-ink px-4 py-3 text-xs leading-5 text-sand opacity-0 shadow-xl transition group-hover:translate-y-2 group-hover:opacity-100">
        {description}
      </div>
    </div>
  );
}

function CoachPanel({
  title,
  heading,
  text,
}: {
  title: string;
  heading: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-ink/10 bg-white/75 p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">{title}</p>
      <h3 className="mt-3 text-2xl font-bold text-ink">{heading}</h3>
      <p className="mt-4 text-sm leading-7 text-ink/80">{text}</p>
    </div>
  );
}

function CoachHighlight({
  toneClass,
  label,
  heading,
  text,
}: {
  toneClass: string;
  label: string;
  heading: string;
  text: string;
}) {
  return (
    <div className={`rounded-[28px] p-6 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">{label}</p>
      <h3 className="mt-3 text-xl font-bold text-ink">{heading}</h3>
      <p className="mt-3 text-sm leading-7 text-ink/75">{text}</p>
    </div>
  );
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : '--';
}

function formatOptionalNumber(value?: number | null) {
  return value == null ? '--' : formatNumber(value);
}
