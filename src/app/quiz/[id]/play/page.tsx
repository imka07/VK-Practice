'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Spinner';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useQuizRealtime } from '@/lib/hooks/useQuizRealtime';
import { Clock, Trophy, Users } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  room_code: string;
  time_per_question: number;
}

interface Question {
  id: string;
  question_text: string;
  question_image_url: string | null;
  question_type: 'single_choice' | 'multiple_choice' | 'text';
  options: string[] | null;
}

export default function PlayQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const { quizState, participants } = useQuizRealtime(params.id as string);

  useEffect(() => {
    // Убрали проверку авторизации - разрешаем анонимное участие
    loadQuiz();
    loadQuestions();
  }, []);

  useEffect(() => {
    // Сбрасываем ответ при смене вопроса
    setSelectedAnswer([]);
    setTextAnswer('');
    setSubmitted(false);
  }, [quizState?.current_question_index]);

  async function loadQuiz() {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, room_code, time_per_question')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setQuiz(data);
    } catch (error) {
      console.error('Error loading quiz:', error);
      router.push('/');
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

  async function handleSubmitAnswer() {
    if (!currentQuestion) return;

    const answer = currentQuestion.question_type === 'text' ? [textAnswer] : selectedAnswer;

    if (answer.length === 0) {
      alert('Выберите ответ');
      return;
    }

    try {
      // Если пользователь авторизован, отправляем ответ
      if (user) {
        const { error } = await supabase
          .from('participant_answers')
          .insert({
            quiz_id: params.id,
            question_id: currentQuestion.id,
            user_id: user.id,
            answer: answer,
          });

        if (error) throw error;
      }
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Ошибка при отправке ответа');
    }
  }

  function handleAnswerSelect(option: string) {
    if (submitted) return;

    if (currentQuestion?.question_type === 'single_choice') {
      setSelectedAnswer([option]);
    } else if (currentQuestion?.question_type === 'multiple_choice') {
      if (selectedAnswer.includes(option)) {
        setSelectedAnswer(selectedAnswer.filter((a) => a !== option));
      } else {
        setSelectedAnswer([...selectedAnswer, option]);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Загрузка..." />
      </div>
    );
  }

  if (!quiz) return null;

  const currentQuestion = questions[quizState?.current_question_index || 0];
  const isActive = quizState?.status === 'active';
  const isCompleted = quizState?.status === 'completed';
  const myParticipant = participants.find((p) => p.user_id === user?.id);
  const myRank = participants.findIndex((p) => p.user_id === user?.id) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">Комната: {quiz.room_code}</p>
            </div>
            {user && myParticipant && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold">{myParticipant.score || 0}</span>
                </div>
                <Badge variant="secondary">
                  #{myRank} место
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Waiting Screen */}
        {!isActive && !isCompleted && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold mb-2">Ожидание начала...</h2>
            <p className="text-gray-600 mb-6">
              Организатор скоро запустит квиз
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span>Участников: {participants.length}</span>
            </div>
          </Card>
        )}

        {/* Active Quiz */}
        {isActive && currentQuestion && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="primary">
                  Вопрос {(quizState?.current_question_index || 0) + 1} / {questions.length}
                </Badge>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{quiz.time_per_question}с</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                  {currentQuestion.question_text}
                </h2>

                {currentQuestion.question_image_url && (
                  <img
                    src={currentQuestion.question_image_url}
                    alt="Question"
                    className="max-w-full h-auto rounded-lg"
                  />
                )}

                {/* Single/Multiple Choice */}
                {currentQuestion.question_type !== 'text' && currentQuestion.options && (
                  <div className="space-y-3 mt-6">
                    {currentQuestion.options.map((option, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleAnswerSelect(option)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAnswer.includes(option)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        } ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          {currentQuestion.question_type === 'single_choice' ? (
                            <Radio
                              name="answer"
                              value={option}
                              checked={selectedAnswer.includes(option)}
                              onChange={() => {}} // handled by div onClick
                              disabled={submitted}
                            />
                          ) : (
                            <Checkbox
                              checked={selectedAnswer.includes(option)}
                              onChange={() => {}} // handled by div onClick
                              disabled={submitted}
                            />
                          )}
                          <span className="font-medium">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Answer */}
                {currentQuestion.question_type === 'text' && (
                  <div className="mt-6">
                    <Input
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Введите ваш ответ..."
                      disabled={submitted}
                    />
                  </div>
                )}

                <Button
                  onClick={handleSubmitAnswer}
                  size="lg"
                  className="w-full mt-6"
                  disabled={submitted || (currentQuestion.question_type === 'text' ? !textAnswer : selectedAnswer.length === 0)}
                >
                  {submitted ? '✅ Ответ отправлен' : 'Отправить ответ'}
                </Button>

                {submitted && (
                  <p className="text-center text-sm text-gray-600">
                    Ожидайте следующего вопроса...
                  </p>
                )}
              </div>
            </Card>

            {/* Leaderboard */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Лидерборд</h3>
              <div className="space-y-2">
                {participants.slice(0, 5).map((participant, idx) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      participant.user_id === user?.id ? 'bg-primary-50 border-2 border-primary-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="font-medium">{participant.username}</span>
                    </div>
                    <span className="font-bold">{participant.score}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Completed Screen */}
        {isCompleted && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">
              {myRank === 1 ? '🏆' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎉'}
            </div>
            <h2 className="text-3xl font-bold mb-2">Квиз завершен!</h2>
            {user && myParticipant && (
              <>
                <p className="text-xl text-gray-600 mb-4">
                  Вы заняли {myRank}-е место
                </p>
                <p className="text-2xl font-bold text-primary-600 mb-6">
                  Ваш счет: {myParticipant.score || 0} очков
                </p>
              </>
            )}
            <Link href="/">
              <Button size="lg">
                Вернуться на главную
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
