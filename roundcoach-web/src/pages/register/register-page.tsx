import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Field } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setSession(data);
      navigate('/dashboard');
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registerMutation.mutate(form);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember">
            Create Account
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink">
            Comece a montar seu historico
          </h1>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <Field label="Nome">
            <Input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </Field>
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
          <Button type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Criando...' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink/70">
          Ja tem conta?{' '}
          <Link to="/login" className="font-semibold text-pine">
            Fazer login
          </Link>
        </p>
      </Card>
    </div>
  );
}
