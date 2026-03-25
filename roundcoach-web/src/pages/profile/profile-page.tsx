import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Field } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useAuthStore } from '../../store/auth.store';
import { usersService } from '../../services/users.service';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const accessToken = useAuthStore((state) => state.accessToken);

  const initialState = useMemo(
    () => ({
      name: user?.name ?? '',
      currentRank: user?.currentRank ?? '',
      currentGoal: user?.currentGoal ?? '',
      mainAgents: user?.mainAgents?.join(', ') ?? '',
      mainRole: user?.mainRole ?? '',
      currentFocus: user?.currentFocus ?? '',
    }),
    [user],
  );

  const [form, setForm] = useState(initialState);

  useEffect(() => {
    setForm(initialState);
  }, [initialState]);

  const updateMutation = useMutation({
    mutationFn: () =>
      usersService.updateMe({
        name: form.name,
        currentRank: form.currentRank.trim() || undefined,
        currentGoal: form.currentGoal.trim() || undefined,
        mainAgents: form.mainAgents
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        mainRole: form.mainRole.trim() || undefined,
        currentFocus: form.currentFocus.trim() || undefined,
      }),
    onSuccess: async (updatedUser) => {
      if (accessToken) {
        setSession({ accessToken, user: updatedUser });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
        queryClient.invalidateQueries({ queryKey: ['analysis'] }),
      ]);
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateMutation.mutate();
  }

  return (
    <div className="mx-auto max-w-4xl grid gap-6">
      <Card className="bg-gradient-to-br from-ink to-pine text-sand">
        <p className="text-sm uppercase tracking-[0.28em] text-sand/60">
          Player Profile
        </p>
        <h1 className="mt-3 text-4xl font-bold">Seu contexto de jogador</h1>
        <p className="mt-3 max-w-2xl text-sm text-sand/75">
          Rank, objetivo, role e foco atual ajudam o RoundCoach a deixar o
          dashboard e os treinos mais alinhados com o que voce realmente quer
          evoluir.
        </p>
      </Card>

      <Card>
        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome">
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Field>

            <Field label="Elo atual">
              <Input
                placeholder="Ex.: Ascendant 1"
                value={form.currentRank}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    currentRank: event.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Role principal">
              <Input
                placeholder="Ex.: Duelist"
                value={form.mainRole}
                onChange={(event) =>
                  setForm((current) => ({ ...current, mainRole: event.target.value }))
                }
              />
            </Field>

            <Field label="Agentes principais" hint="Separe por virgula">
              <Input
                placeholder="Ex.: Jett, Raze"
                value={form.mainAgents}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mainAgents: event.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <Field label="Objetivo atual">
            <Textarea
              rows={3}
              placeholder="Ex.: Subir para Immortal com mais consistencia em ranked"
              value={form.currentGoal}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  currentGoal: event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Foco atual">
            <Textarea
              rows={3}
              placeholder="Ex.: Evitar first death e melhorar meu reposicionamento"
              value={form.currentFocus}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  currentFocus: event.target.value,
                }))
              }
            />
          </Field>

          {updateMutation.isError ? (
            <p className="text-sm text-rose-700">
              Nao foi possivel atualizar seu perfil agora.
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button disabled={updateMutation.isPending} type="submit">
              {updateMutation.isPending ? 'Salvando...' : 'Salvar perfil'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
