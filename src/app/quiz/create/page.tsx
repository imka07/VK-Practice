'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { createQuizAction } from './actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateQuizPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createQuizAction(formData);
      if (result?.error) {
        setError(result.error);
      }
      // Redirect происходит в action
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к панели
          </Button>
        </Link>
      </div>

      <Card className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Создание нового квиза
          </h1>
          <p className="text-gray-600">
            Заполните основную информацию о квизе. Вопросы можно будет добавить на следующем шаге.
          </p>
        </div>

        {error && (
          <Alert variant="error" title="Ошибка" className="mb-6">
            {error}
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-6">
          <Input
            label="Название квиза"
            name="title"
            required
            placeholder="Например: Общие знания"
            disabled={isPending}
          />

          <Textarea
            label="Описание"
            name="description"
            placeholder="Краткое описание квиза (необязательно)"
            rows={3}
            disabled={isPending}
          />

          <Select
            label="Категория"
            name="category"
            disabled={isPending}
          >
            <option value="">Выберите категорию</option>
            <option value="general">Общие знания</option>
            <option value="science">Наука</option>
            <option value="history">История</option>
            <option value="geography">География</option>
            <option value="sports">Спорт</option>
            <option value="entertainment">Развлечения</option>
            <option value="tech">Технологии</option>
            <option value="other">Другое</option>
          </Select>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Время на вопрос (секунды)"
              name="time_per_question"
              type="number"
              min="10"
              max="300"
              defaultValue="30"
              required
              disabled={isPending}
              helperText="От 10 до 300 секунд"
            />

            <Input
              label="Базовые очки за вопрос"
              name="points_per_question"
              type="number"
              min="1"
              max="100"
              defaultValue="10"
              required
              disabled={isPending}
              helperText="От 1 до 100 баллов"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={isPending}
            >
              Создать квиз
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
