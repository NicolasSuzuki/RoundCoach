import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Field } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { Notice } from '../../components/ui/notice';
import { StatusBadge } from '../../components/ui/status-badge';
import { Textarea } from '../../components/ui/textarea';
import { matchService } from '../../services/match.service';
import { riotContentService } from '../../services/riot-content.service';
import { getErrorMessage } from '../../utils/http-error';
import { formatDate } from '../../utils/format';
import type { MatchResult } from '../../types/match';

export function MatchesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    map: '',
    agent: '',
    result: 'WIN' as MatchResult,
    score: '',
    matchDate: '',
    notes: '',
  });

  const matchesQuery = useQuery({
    queryKey: ['matches'],
    queryFn: matchService.list,
  });

  const riotContentQuery = useQuery({
    queryKey: ['riot-content'],
    queryFn: () => riotContentService.getContent(),
  });

  const createMatchMutation = useMutation({
    mutationFn: matchService.create,
    onSuccess: async (match) => {
      await queryClient.invalidateQueries({ queryKey: ['matches'] });
      navigate(`/matches/${match.id}`);
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    createMatchMutation.mutate({
      ...form,
      map: form.map.trim(),
      agent: form.agent.trim(),
      score: form.score.trim(),
      matchDate: new Date(form.matchDate).toISOString(),
      notes: form.notes.trim() || undefined,
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
      <Card>
        <h1 className="text-2xl font-bold text-ink">Nova partida</h1>
        <p className="mt-2 text-sm text-ink/60">
          Registre a partida primeiro. O VOD e a analise entram logo depois.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <Field label="Mapa">
            {riotContentQuery.data?.maps.length ? (
              <select
                className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
                value={form.map}
                onChange={(event) =>
                  setForm((current) => ({ ...current, map: event.target.value }))
                }
                required
              >
                <option value="">Selecione um mapa</option>
                {riotContentQuery.data.maps.map((map) => (
                  <option key={map.id} value={map.name}>
                    {map.name}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="match-map"
                required
                value={form.map}
                onChange={(event) =>
                  setForm((current) => ({ ...current, map: event.target.value }))
                }
              />
            )}
          </Field>

          <Field label="Agente">
            {riotContentQuery.data?.agents.length ? (
              <select
                className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
                value={form.agent}
                onChange={(event) =>
                  setForm((current) => ({ ...current, agent: event.target.value }))
                }
                required
              >
                <option value="">Selecione um agente</option>
                {riotContentQuery.data.agents.map((agent) => (
                  <option key={agent.id} value={agent.name}>
                    {agent.name}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="match-agent"
                required
                value={form.agent}
                onChange={(event) =>
                  setForm((current) => ({ ...current, agent: event.target.value }))
                }
              />
            )}
          </Field>

          <Field label="Resultado">
            <select
              className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
              value={form.result}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  result: event.target.value as MatchResult,
                }))
              }
            >
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
            </select>
          </Field>

          <Field label="Placar">
            <Input
              id="match-score"
              required
              value={form.score}
              onChange={(event) =>
                setForm((current) => ({ ...current, score: event.target.value }))
              }
            />
          </Field>

          <Field label="Data da partida">
            <Input
              id="match-date"
              required
              type="datetime-local"
              value={form.matchDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  matchDate: event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Notas">
            <Textarea
              id="match-notes"
              rows={4}
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </Field>

          {createMatchMutation.isError ? (
            <Notice tone="error" title="Nao foi possivel criar a partida.">
              {getErrorMessage(
                createMatchMutation.error,
                'Revise os campos e tente novamente.',
              )}
            </Notice>
          ) : null}

          <Button type="submit" disabled={createMatchMutation.isPending}>
            {createMatchMutation.isPending ? 'Salvando...' : 'Criar partida'}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink">Partidas registradas</h2>
            <p className="text-sm text-ink/60">
              Clique em uma partida para subir VOD e acompanhar a analise.
            </p>
          </div>
          <span className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink">
            {matchesQuery.data?.meta.total ?? 0} partidas
          </span>
        </div>

        <p className="mb-6 text-xs uppercase tracking-[0.22em] text-ink/45">
          Riot content source: {riotContentQuery.data?.source ?? 'loading'}
        </p>

        <div className="grid gap-4">
          {riotContentQuery.isError ? (
            <Notice tone="warning" title="Conteudo da Riot indisponivel no momento.">
              Os campos continuam funcionando normalmente com preenchimento manual.
            </Notice>
          ) : null}

          {matchesQuery.isLoading ? (
            <Notice title="Carregando partidas...">
              Assim que a lista chegar, voce pode abrir qualquer partida para seguir com o VOD.
            </Notice>
          ) : null}

          {matchesQuery.isError ? (
            <Notice tone="error" title="Nao foi possivel carregar as partidas.">
              {getErrorMessage(
                matchesQuery.error,
                'Tente recarregar a pagina para atualizar a lista.',
              )}
            </Notice>
          ) : null}

          {!matchesQuery.isLoading &&
          !matchesQuery.isError &&
          (matchesQuery.data?.data.length ?? 0) === 0 ? (
            <Notice title="Sua lista ainda esta vazia.">
              Crie a primeira partida ao lado para iniciar o fluxo de analise.
            </Notice>
          ) : null}

          {matchesQuery.data?.data.map((match) => (
            <Link
              key={match.id}
              to={`/matches/${match.id}`}
              className="rounded-[24px] border border-ink/10 bg-sand/70 p-5 transition hover:border-ember hover:bg-white"
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
