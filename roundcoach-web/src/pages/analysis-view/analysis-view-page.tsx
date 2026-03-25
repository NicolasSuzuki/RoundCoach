import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/card';
import { StatusBadge } from '../../components/ui/status-badge';
import { analysisService } from '../../services/analysis.service';
import { formatScore } from '../../utils/format';

export function AnalysisViewPage() {
  const { matchId = '' } = useParams();

  const analysisQuery = useQuery({
    queryKey: ['analysis', matchId],
    queryFn: () => analysisService.getByMatchId(matchId),
    refetchInterval: (query) => {
      const status = query.state.data?.processingStatus;
      return status === 'PROCESSING' ? 2500 : false;
    },
  });

  const analysis = analysisQuery.data;

  return (
    <div className="grid gap-6">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-ember">Analysis</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">
            Leitura fake da partida
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge value={analysis?.processingStatus ?? 'PENDING'} />
          <Link
            to={`/matches/${matchId}`}
            className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink hover:bg-white"
          >
            Voltar
          </Link>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Deaths First" value={formatScore(analysis?.deathsFirst)} />
        <MetricCard label="Entry Kills" value={formatScore(analysis?.entryKills)} />
        <MetricCard
          label="Crosshair Score"
          value={formatScore(analysis?.avgCrosshairScore)}
        />
        <MetricCard
          label="Utility Usage"
          value={formatScore(analysis?.utilityUsageScore)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        <MetricCard
          label="Positioning Score"
          value={formatScore(analysis?.positioningScore)}
          className="h-full"
        />
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Summary</p>
          <p className="mt-4 text-base leading-7 text-ink/80">
            {analysis?.summary ??
              'A analise ainda nao foi concluida. Assim que o worker responder, este resumo aparece aqui.'}
          </p>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{label}</p>
      <p className="mt-4 text-4xl font-bold text-ink">{value}</p>
    </Card>
  );
}
