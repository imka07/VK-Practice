import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Users, Zap, Trophy, Code } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Quiz Platform
            </h1>
            <p className="text-xl mb-8 text-primary-100 animate-slide-up">
              Платформа для проведения интерактивных квизов в реальном времени
            </p>
            <div className="flex gap-4 justify-center animate-slide-up">
              <Button size="lg" variant="secondary">
                Создать квиз
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Присоединиться
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Возможности платформы</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold mb-2">Realtime</h3>
              <p className="text-sm text-gray-600">
                Все участники видят вопросы одновременно
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-success-600" />
              </div>
              <h3 className="font-semibold mb-2">До 10 участников</h3>
              <p className="text-sm text-gray-600">
                Поддержка небольших групп для мероприятий
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-warning-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-warning-600" />
              </div>
              <h3 className="font-semibold mb-2">Лидерборд</h3>
              <p className="text-sm text-gray-600">
                Система подсчета баллов и определения победителей
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-error-600" />
              </div>
              <h3 className="font-semibold mb-2">Код комнаты</h3>
              <p className="text-sm text-gray-600">
                Простое присоединение по 6-значному коду
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Создайте свой первый квиз или присоединитесь к существующему по коду комнаты
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Начать сейчас</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
