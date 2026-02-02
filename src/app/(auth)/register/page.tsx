'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Radio, RadioGroup } from '@/components/ui/Radio';
import { registerAction } from './actions';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<'participant' | 'organizer'>('participant');

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    formData.set('role', role);
    
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success && result?.message) {
        setSuccess(result.message);
      }
    });
  }

  return (
    <Card className="p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Регистрация
        </h1>
        <p className="text-gray-600">Создайте аккаунт для начала работы</p>
      </div>

      {error && (
        <Alert variant="error" title="Ошибка регистрации" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" title="Успешно!" className="mb-6">
          {success}
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-4">
        <Input
          label="Имя пользователя"
          name="username"
          type="text"
          required
          placeholder="john_doe"
          autoComplete="username"
          disabled={isPending}
          helperText="Минимум 3 символа"
        />

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
          autoComplete="new-password"
          disabled={isPending}
          helperText="Минимум 6 символов"
        />

        <RadioGroup label="Я хочу зарегистрироваться как:">
          <Radio
            name="role"
            value="participant"
            label="Участник (проходить квизы)"
            checked={role === 'participant'}
            onChange={() => setRole('participant')}
            disabled={isPending}
          />
          <Radio
            name="role"
            value="organizer"
            label="Организатор (создавать квизы)"
            checked={role === 'organizer'}
            onChange={() => setRole('organizer')}
            disabled={isPending}
          />
        </RadioGroup>

        <Button type="submit" className="w-full" loading={isPending}>
          Зарегистрироваться
        </Button>

        <div className="text-center space-y-2">
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/login">Уже есть аккаунт? Войти</Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/">Вернуться на главную</Link>
          </Button>
        </div>
      </form>
    </Card>
  );
}
