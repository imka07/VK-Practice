'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, Edit, Trash2, Play, Sparkles } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  room_code: string;
  status: string;
  time_per_question: number;
  points_per_question: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    checkUserRole();
  }, [user, authLoading]);

  async function checkUserRole() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single();

      if (error || data?.role !== 'organizer') {
        setIsOrganizer(false);
        router.push('/');
        return;
      }

      setIsOrganizer(true);
      loadQuizzes();
    } catch (error) {
      setIsOrganizer(false);
      router.push('/');
    }
  }

  async function loadQuizzes() {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить этот квиз?')) return;

    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) throw error;
      setQuizzes(quizzes.filter((q) => q.id !== id));
    } catch (error) {
      alert('Ошибка при удалении квиза');
    }
  }

  if (authLoading || loading || isOrganizer === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loading text="Загрузка..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold gradient-text-blue mb-2">Панель организатора</h1>
          <p className="text-gray-600">Управление квизами и мероприятиями</p>
        </div>

        {quizzes.length === 0 ? (
          <Card className="p-12 text-center glass border-0 shadow-xl animate-fade-in-up animation-delay-200">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 text-white mb-6 animate-float">
              <Sparkles className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold gradient-text-blue mb-3">
              У вас пока нет квизов
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Создайте свой первый квиз чтобы начать
            </p>
            <Link href="/quiz/create">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <PlusCircle className="w-5 h-5 mr-2" />
                Создать первый квиз
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="mb-8 flex justify-end animate-fade-in-up animation-delay-200">
              <Link href="/quiz/create">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Создать квиз
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz, index) => (
                <Card 
                  key={quiz.id} 
                  className="group p-6 glass border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" 
                  style={{animationDelay: `${(index * 0.1) + 0.4}s`}}
                >
                  <Card.Header className="p-0 mb-4 border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Card.Title className="text-xl mb-2 group-hover:text-blue-600 transition-colors">{quiz.title}</Card.Title>
                        {quiz.description && (
                          <Card.Description className="text-sm">
                            {quiz.description}
                          </Card.Description>
                        )}
                      </div>
                      <Badge
                        variant={
                          quiz.status === 'active'
                            ? 'success'
                            : quiz.status === 'paused'
                            ? 'warning'
                            : quiz.status === 'completed'
                            ? 'secondary'
                            : 'default'
                        }
                        className="shadow-md"
                      >
                        {quiz.status === 'draft' && 'Черновик'}
                        {quiz.status === 'active' && 'Активный'}
                        {quiz.status === 'paused' && 'Пауза'}
                        {quiz.status === 'completed' && 'Завершен'}
                      </Badge>
                    </div>
                  </Card.Header>

                  <Card.Content className="p-0 space-y-3 text-sm">
                    <div className="flex justify-between px-3 py-2 rounded-lg bg-blue-50/50">
                      <span className="text-gray-600">Категория:</span>
                      <span className="font-medium text-gray-900">{quiz.category}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 rounded-lg bg-purple-50/50">
                      <span className="text-gray-600">Код комнаты:</span>
                      <span className="font-mono font-bold gradient-text-purple">
                        {quiz.room_code}
                      </span>
                    </div>
                    <div className="flex justify-between px-3 py-2 rounded-lg bg-pink-50/50">
                      <span className="text-gray-600">Создан:</span>
                      <span className="font-medium text-gray-900">{new Date(quiz.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </Card.Content>

                  <Card.Footer className="p-0 mt-6 pt-4 border-t border-gray-200 flex gap-2">
                    <Link href={`/quiz/${quiz.id}/host`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md">
                        <Play className="w-4 h-4 mr-2" />
                        Запустить
                      </Button>
                    </Link>
                    <Link href={`/quiz/${quiz.id}/edit`}>
                      <Button variant="outline" size="sm" className="border-2 hover:border-blue-500 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(quiz.id)}
                      className="shadow-md hover:shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Card.Footer>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
