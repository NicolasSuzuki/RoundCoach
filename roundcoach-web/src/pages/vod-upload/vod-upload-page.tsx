import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Field } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { Notice } from '../../components/ui/notice';
import { vodService } from '../../services/vod.service';
import { getErrorMessage } from '../../utils/http-error';

export function VodUploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { matchId = '' } = useParams();
  const [form, setForm] = useState({
    fileName: '',
    fileUrl: '',
    durationSeconds: '',
  });

  const vodsQuery = useQuery({
    queryKey: ['vods', matchId],
    queryFn: () => vodService.listByMatch(matchId),
  });

  const existingVod = vodsQuery.data?.data[0];

  useEffect(() => {
    if (!existingVod) {
      return;
    }

    setForm({
      fileName: existingVod.fileName,
      fileUrl: existingVod.fileUrl,
      durationSeconds: existingVod.durationSeconds
        ? String(existingVod.durationSeconds)
        : '',
    });
  }, [existingVod]);

  const saveVodMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        matchId,
        fileName: form.fileName.trim(),
        fileUrl: form.fileUrl.trim(),
        durationSeconds: form.durationSeconds ? Number(form.durationSeconds) : undefined,
      };

      if (existingVod) {
        return vodService.update(existingVod.id, payload);
      }

      return vodService.create(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vods', matchId] });
      navigate(`/matches/${matchId}`);
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveVodMutation.mutate();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <p className="text-xs uppercase tracking-[0.28em] text-ember">
          {existingVod ? 'VOD Edit' : 'VOD Input'}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink">
          {existingVod ? 'Editar dados do VOD' : 'Adicionar dados do VOD'}
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          O backend atual trabalha com URL do arquivo. Use uma URL publica ou
          mock para validar o fluxo.
        </p>

        {vodsQuery.isLoading ? (
          <Notice className="mt-6" title="Carregando dados do VOD...">
            Se esta partida ja tiver um video, os campos serao preenchidos automaticamente.
          </Notice>
        ) : null}

        {vodsQuery.isError ? (
          <Notice className="mt-6" tone="error" title="Nao foi possivel carregar o VOD atual.">
            {getErrorMessage(vodsQuery.error, 'Tente atualizar a pagina.')}
          </Notice>
        ) : null}

        <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
          <Field label="Nome do arquivo">
            <Input
              required
              value={form.fileName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fileName: event.target.value }))
              }
            />
          </Field>
          <Field label="URL do VOD" hint="Ex.: https://storage.local/meu-vod.mp4">
            <Input
              required
              type="url"
              value={form.fileUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, fileUrl: event.target.value }))
              }
            />
          </Field>
          <Field label="Duracao em segundos">
            <Input
              type="number"
              value={form.durationSeconds}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  durationSeconds: event.target.value,
                }))
              }
            />
          </Field>
          {saveVodMutation.isError ? (
            <Notice tone="error" title="Nao foi possivel salvar os dados do VOD.">
              {getErrorMessage(
                saveVodMutation.error,
                'Revise os campos e tente novamente.',
              )}
            </Notice>
          ) : null}
          <div className="flex gap-3">
            <Button type="submit" disabled={saveVodMutation.isPending}>
              {saveVodMutation.isPending
                ? 'Salvando...'
                : existingVod
                  ? 'Salvar alteracoes'
                  : 'Salvar VOD'}
            </Button>
            <button
              type="button"
              onClick={() => navigate(`/matches/${matchId}`)}
              className="rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-white"
            >
              Voltar
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
