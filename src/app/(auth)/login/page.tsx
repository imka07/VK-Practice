'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { loginAction } from './actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Вход в Quiz Platform
        </h1>
        <p className="text-gray-600">Войдите, чтобы продолжить</p>
      </div>

      {error && (
        <Alert variant="error" title="Ошибка входа" className="mb-6">
          {error}
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          autoComplete="email"
          disabled={isPending}
        />

        <Input
          label="Пароль"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isPending}
        />

        <Button type="submit" className="w-full" loading={isPending}>
          Войти
        </Button>

        <div className="text-center space-y-2">
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/register">
              Нет аккаунта? Зарегистрироваться
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/">Вернуться на главную</Link>
          </Button>
        </div>
      </form>
    </Card>
  );
}
