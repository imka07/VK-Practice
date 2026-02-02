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
import { PlusCircle, Edit, Trash2, Play } from 'lucide-react';

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
      console.log('No user, redirecting to login');
      router.push('/login');
      return;
    }

    // Проверяем role
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
        console.log('Not organizer, redirecting to home');
        setIsOrganizer(false);
        router.push('/');
        return;
      }

      setIsOrganizer(true);
      loadQuizzes();
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsOrganizer(false);
      router.push('/');
    }
  }

  async function loadQuizzes() {
    try {
      console.log('Loading quizzes...');
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading quizzes:', error);
        throw error;
      }
      
      console.log('Loaded quizzes:', data);
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
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
      console.error('Error deleting quiz:', error);
      alert('Ошибка при удалении квиза');
    }
  }

  if (authLoading || loading || isOrganizer === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Загружка..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Панель организатора</h1>
          <p className="text-gray-600 mt-2">Управление квизами и мероприятиями</p>
        </div>

        {quizzes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              У вас пока нет квизов
            </h2>
            <p className="text-gray-600 mb-6">
              Создайте свой первый квиз чтобы начать
            </p>
            <Link href="/quiz/create">
              <Button size="lg">
                <PlusCircle className="w-5 h-5 mr-2" />
                Создать первый квиз
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="mb-8 flex justify-end">
              <Link href="/quiz/create">
                <Button size="lg">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Создать квиз
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow">
                  <Card.Header className="p-0 mb-4 border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Card.Title className="text-xl mb-2">{quiz.title}</Card.Title>
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
                            : quiz.status === 'completed'
                            ? 'secondary'
                            : 'default'
                        }
                      >
                        {quiz.status === 'draft' && 'Черновик'}
                        {quiz.status === 'active' && 'Активный'}
                        {quiz.status === 'completed' && 'Завершен'}
                      </Badge>
                    </div>
                  </Card.Header>

                  <Card.Content className="p-0 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Категория:</span>
                      <span className="font-medium">{quiz.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Код комнаты:</span>
                      <span className="font-mono font-bold text-primary-600">
                        {quiz.room_code}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Создан:</span>
                      <span>{new Date(quiz.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </Card.Content>

                  <Card.Footer className="p-0 mt-4 pt-4 border-t flex gap-2">
                    <Link href={`/quiz/${quiz.id}/host`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Запустить
                      </Button>
                    </Link>
                    <Link href={`/quiz/${quiz.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(quiz.id)}
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
