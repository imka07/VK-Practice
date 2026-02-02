'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Spinner';
import { QuestionForm } from '@/components/quiz/QuestionForm';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  room_code: string;
  status: string;
}

interface Question {
  id: string;
  question_text: string;
  question_image_url: string | null;
  question_type: 'single_choice' | 'multiple_choice' | 'text';
  correct_answers: string[];
  options: string[] | null;
  order_index: number;
}

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const supabase = createClient();

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

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm('Удалить этот вопрос?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Ошибка при удалении вопроса');
    }
  }

  function handleEditQuestion(question: Question) {
    setEditingQuestion(question);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingQuestion(null);
    loadQuestions();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Загрузка квиза..." />
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к панели
          </Button>
        </Link>
      </div>

      <Card className="p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600">{quiz.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Код комнаты:</div>
            <div className="text-2xl font-mono font-bold text-primary-600">
              {quiz.room_code}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            Вопросов: <span className="font-semibold">{questions.length}</span>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить вопрос
          </Button>
        </div>
      </Card>

      {showForm && (
        <QuestionForm
          quizId={quiz.id}
          question={editingQuestion}
          onClose={handleFormClose}
          nextOrderIndex={questions.length}
        />
      )}

      {questions.length === 0 && !showForm ? (
        <Alert variant="info" title="Нет вопросов">
          Добавьте хотя бы один вопрос, чтобы запустить квиз.
        </Alert>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onEdit={() => handleEditQuestion(question)}
              onDelete={() => handleDeleteQuestion(question.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
