'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Spinner';
import { createClient } from '@/lib/supabase/client';
import { useQuizRealtime } from '@/lib/hooks/useQuizRealtime';
import { ArrowLeft, Play, Pause, SkipForward, Users, Clock } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  room_code: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  time_per_question: number;
  points_per_question: number;
}

interface Question {
  id: string;
  question_text: string;
  question_image_url: string | null;
  question_type: 'single_choice' | 'multiple_choice' | 'text';
  options: string[] | null;
  order_index: number;
}

export default function HostQuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const {
    quizState,
    participants,
    startQuiz,
    pauseQuiz,
    nextQuestion,
    endQuiz,
    loading: realtimeLoading,
  } = useQuizRealtime(params.id as string);

  useEffect(() => {
    loadQuiz();
    loadQuestions();
  }, [params.id]);

  async function loadQuiz() {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setQuiz(data);
    } catch (error) {
      console.error('Error loading quiz:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function loadQuestions() {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', params.id)
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  }

  async function handleStartQuiz() {
    if (questions.length === 0) {
      alert('Добавьте хотя бы один вопрос перед началом квиза');
      return;
    }
    await startQuiz();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Загрузка квиза..." />
      </div>
    );
  }

  if (!quiz) return null;

  const currentQuestion = questions[quizState?.current_question_index || 0];
  const isActive = quizState?.status === 'active';
  const isPaused = quizState?.status === 'paused';
  const isCompleted = quizState?.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к панели
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">Код комнаты: <span className="font-mono font-bold text-primary-600">{quiz.room_code}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? 'success' : isPaused ? 'warning' : 'secondary'}>
                {isActive ? 'Активен' : isPaused ? 'На паузе' : isCompleted ? 'Завершен' : 'Черновик'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Controls */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Управление</h2>
              <div className="flex gap-3">
                {!isActive && !isCompleted && (
                  <Button 
                    onClick={handleStartQuiz} 
                    size="lg"
                    disabled={realtimeLoading || questions.length === 0}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Начать квиз
                  </Button>
                )}
                
                {isActive && (
                  <>
                    <Button 
                      onClick={pauseQuiz} 
                      variant="warning"
                      size="lg"
                      disabled={realtimeLoading}
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      Пауза
                    </Button>
                    <Button 
                      onClick={nextQuestion} 
                      size="lg"
                      disabled={realtimeLoading || (quizState?.current_question_index || 0) >= questions.length - 1}
                    >
                      <SkipForward className="w-5 h-5 mr-2" />
                      Следующий вопрос
                    </Button>
                  </>
                )}

                {isPaused && (
                  <Button 
                    onClick={startQuiz} 
                    size="lg"
                    disabled={realtimeLoading}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Продолжить
                  </Button>
                )}

                {(isActive || isPaused) && (
                  <Button 
                    onClick={endQuiz} 
                    variant="danger"
                    size="lg"
                    disabled={realtimeLoading}
                  >
                    Завершить квиз
                  </Button>
                )}
              </div>
            </Card>

            {/* Current Question */}
            {currentQuestion && (isActive || isPaused) && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Вопрос {(quizState?.current_question_index || 0) + 1} из {questions.length}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{quiz.time_per_question}с</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xl font-medium">
                    {currentQuestion.question_text}
                  </div>

                  {currentQuestion.question_image_url && (
                    <img
                      src={currentQuestion.question_image_url}
                      alt="Question"
                      className="max-w-md h-auto rounded-lg"
                    />
                  )}

                  {currentQuestion.question_type !== 'text' && currentQuestion.options && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {currentQuestion.options.map((option, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-gray-100 rounded-lg text-center font-medium"
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Waiting Screen */}
            {!isActive && !isPaused && !isCompleted && (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🎮</div>
                  <h2 className="text-2xl font-bold mb-2">Готовы начать?</h2>
                  <p className="text-gray-600 mb-6">
                    У вас {questions.length} {questions.length === 1 ? 'вопрос' : 'вопросов'}. 
                    Участники могут присоединиться по коду <span className="font-mono font-bold text-primary-600">{quiz.room_code}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Нажмите "Начать квиз" когда все будут готовы
                  </p>
                </div>
              </Card>
            )}

            {/* Completed Screen */}
            {isCompleted && (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-2xl font-bold mb-2">Квиз завершен!</h2>
                  <p className="text-gray-600 mb-6">
                    Участников: {participants.length}
                  </p>
                  <Link href="/dashboard">
                    <Button size="lg">
                      Вернуться к панели
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Participants */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Участники</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{participants.length}</span>
                </div>
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Ожидание участников...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {participants.map((participant, idx) => (
                    <div
                      key={participant.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <span className="font-medium">{participant.username}</span>
                      </div>
                      <Badge variant="secondary">{participant.score || 0}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
