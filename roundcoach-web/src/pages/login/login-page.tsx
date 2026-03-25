import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Field } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setSession(data);
      navigate('/dashboard');
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate(form);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember">
            RoundCoach
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink">
            Entre para revisar suas partidas
          </h1>
          <p className="mt-2 text-sm text-ink/70">
            Login rapido para abrir dashboard, partidas e analises fake.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <Field label="Email">
            <Input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </Field>
          <Field label="Senha">
            <Input
              required
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </Field>
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
          </Button>
          {loginMutation.error ? (
            <p className="text-sm text-rose-700">Nao foi possivel fazer login.</p>
          ) : null}
        </form>

        <p className="mt-6 text-sm text-ink/70">
          Ainda nao tem conta?{' '}
          <Link to="/register" className="font-semibold text-pine">
            Criar conta
          </Link>
        </p>
      </Card>
    </div>
  );
}
