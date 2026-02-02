'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/hooks/useAuth';

export default function HomePage() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-6xl mb-6">🎮</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Добро пожаловать в Quiz Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Создавайте и проводите интерактивные квизы в режиме реального времени
          </p>

          {!user ? (
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">Зарегистрироваться</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Войти
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              {profile?.role === 'organizer' ? (
                <Link href="/dashboard">
                  <Button size="lg">Перейти к панели</Button>
                </Link>
              ) : (
                <Link href="/join">
                  <Button size="lg">Присоединиться к квизу</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold mb-2">Легкое создание</h3>
            <p className="text-gray-600">
              Создавайте квизы с разными типами вопросов за несколько минут
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold mb-2">Реальное время</h3>
            <p className="text-gray-600">
              Все участники видят вопросы одновременно
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Лидерборд</h3>
            <p className="text-gray-600">
              Соревнуйтесь с другими участниками
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
