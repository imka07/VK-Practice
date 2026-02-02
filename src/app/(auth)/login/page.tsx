import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  return (
    <Card className="p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Вход в Quiz Platform
        </h1>
        <p className="text-gray-600">Войдите, чтобы продолжить</p>
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
            <Link href="/register">Нет аккаунта? Регистрация</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
