import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  return (
    <Card className="p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Регистрация
        </h1>
        <p className="text-gray-600">Создайте аккаунт для начала работы</p>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Страница в разработке (Этап 2)
        </p>
        <div className="space-y-3">
          <Button className="w-full" variant="outline" asChild>
            <Link href="/">Вернуться на главную</Link>
          </Button>
          <Button className="w-full" variant="ghost" asChild>
            <Link href="/login">Уже есть аккаунт? Войти</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
