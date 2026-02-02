'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { Plus, Play, Edit, Trash2, Users } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  room_code: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  questions_count?: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (profile?.role !== 'organizer') {
        router.push('/');
        return;
      }
      loadQuizzes();
    }
  }, [user, profile, authLoading, profileLoading]);

  async function loadQuizzes() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions:questions(count)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const quizzesWithCount = data.map((quiz: any) => ({
        ...quiz,
        questions_count: quiz.questions[0]?.count || 0,
      }));

      setQuizzes(quizzesWithCount);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuiz(id: string) {
    if (!confirm('Вы уверены, что хотите удалить этот квиз?')) return;

    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);

      if (error) throw error;

      setQuizzes(quizzes.filter((q) => q.id !== id));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Ошибка при удалении квиза');
    }
  }

  if (authLoading || profileLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Загрузка панели..." />
      </div>
    );
  }

  const statusColors: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {
    draft: 'secondary',
    active: 'success',
    paused: 'warning',
    completed: 'primary',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Черновик',
    active: 'Активный',
    paused: 'На паузе',
    completed: 'Завершен',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Панель организатора
          </h1>
          <p className="text-gray-600">Управление квизами и мероприятиями</p>
        </div>
        <Link href="/quiz/create">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Создать квиз
          </Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <Alert variant="info" title="У вас пока нет квизов">
          Создайте свой первый квиз, чтобы начать проводить интерактивные мероприятия!
        </Alert>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col">
              <Card.Header>
                <div className="flex items-start justify-between mb-2">
                  <Card.Title className="flex-1">{quiz.title}</Card.Title>
                  <Badge variant={statusColors[quiz.status] as any}>
                    {statusLabels[quiz.status]}
                  </Badge>
                </div>
                {quiz.description && (
                  <Card.Description className="line-clamp-2">
                    {quiz.description}
                  </Card.Description>
                )}
              </Card.Header>

              <Card.Content>
                <div className="space-y-2 text-sm text-gray-600">
                  {quiz.category && (
                    <div>Категория: <span className="font-medium">{quiz.category}</span></div>
                  )}
                  <div>Код комнаты: <span className="font-mono font-bold text-primary-600">{quiz.room_code}</span></div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Вопросов: {quiz.questions_count}
                  </div>
                  <div className="text-xs text-gray-500">
                    Создан: {new Date(quiz.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </Card.Content>

              <Card.Footer className="mt-auto">
                <div className="flex gap-2 w-full">
                  <Link href={`/quiz/${quiz.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-1" />
                      Редактировать
                    </Button>
                  </Link>
                  {quiz.status === 'draft' && quiz.questions_count > 0 && (
                    <Link href={`/quiz/${quiz.id}/host`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <Play className="w-4 h-4 mr-1" />
                        Запустить
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteQuiz(quiz.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
