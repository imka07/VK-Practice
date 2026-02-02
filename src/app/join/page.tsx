'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { joinQuizAction } from './actions';

export default function JoinQuizPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await joinQuizAction(formData);
      if (result?.error) {
        setError(result.error);
      }
      // Redirect происходит в action
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Присоединиться к квизу
          </h1>
          <p className="text-gray-600">
            Введите код комнаты, чтобы начать игру
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-6">
          <Input
            label="Код комнаты"
            name="room_code"
            placeholder="ABC123"
            required
            disabled={isPending}
            className="text-center text-2xl font-mono uppercase tracking-wider"
            maxLength={6}
            autoComplete="off"
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isPending}
          >
            Присоединиться
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Нет кода? Спросите у организатора</p>
        </div>
      </Card>
    </div>
  );
}
