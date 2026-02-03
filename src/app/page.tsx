'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Sparkles, Zap, Trophy, ArrowRight } from 'lucide-react';

interface Profile {
  role: 'organizer' | 'participant';
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      if (!user) return; // Guard against null
      
      setLoadingProfile(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setProfile(data);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [user]);

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Платформа для интерактивных квизов
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Квизы от VK
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 animate-fade-in-up animation-delay-200">
            Создавайте и проводите квизы в режиме реального времени
          </p>

          {!user ? (
            <div className="flex gap-4 justify-center animate-fade-in-up animation-delay-400">
              <Link href="/register">
                <Button size="lg" className="group shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Зарегистрироваться
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-2 hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-lg">
                  Войти
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center animate-fade-in-up animation-delay-400">
              {profile?.role === 'organizer' ? (
                <Link href="/dashboard">
                  <Button size="lg" className="group shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Перейти к панели
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link href="/join">
                  <Button size="lg" className="group shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Присоединиться к квизу
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 pb-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="group p-8 text-center bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-600">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Легкое создание
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Создавайте квизы с разными типами вопросов за несколько минут
            </p>
          </Card>

          <Card className="group p-8 text-center bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-800">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Реальное время
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Все участники видят вопросы одновременно
            </p>
          </Card>

          <Card className="group p-8 text-center bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-1000">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              Лидерборд
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Соревнуйтесь с другими участниками
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
