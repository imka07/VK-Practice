'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { gradeCurrentQuestion } from '@/lib/actions/gradeAnswers';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface QuizState {
  quiz_id: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  current_question_index: number;
  started_at: string | null;
  ended_at: string | null;
}

interface Participant {
  id: string;
  user_id: string;
  username: string;
  score: number;
  joined_at: string;
}

export function useQuizRealtime(quizId: string) {
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!quizId) return;

    loadQuizState();
    loadParticipants();

    const quizChannel = supabase.channel(`quiz:${quizId}`);

    quizChannel
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'quiz_state', filter: `quiz_id=eq.${quizId}` },
        (payload) => {
          console.log('Quiz state changed:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setQuizState(payload.new as QuizState);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_participants', filter: `quiz_id=eq.${quizId}` },
        (payload) => {
          console.log('Participants changed:', payload);
          loadParticipants();
        }
      )
      .subscribe();

    setChannel(quizChannel);

    return () => {
      quizChannel.unsubscribe();
    };
  }, [quizId]);

  async function loadQuizState() {
    try {
      const { data, error } = await supabase
        .from('quiz_state')
        .select('*')
        .eq('quiz_id', quizId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading quiz state:', error);
        throw error;
      }
      console.log('Loaded quiz state:', data);
      setQuizState(data);
    } catch (error) {
      console.error('Error loading quiz state:', error);
    }
  }

  async function loadParticipants() {
    try {
      const { data: participantsData, error: participantsError } = await supabase
        .from('quiz_participants')
        .select('id, user_id, username, score, joined_at')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false });

      if (participantsError) throw participantsError;

      console.log('Loaded participants:', participantsData);
      setParticipants(participantsData || []);
    } catch (error) {
      console.error('Error loading participants:', error);
      setParticipants([]);
    }
  }

  async function startQuiz() {
    setLoading(true);
    try {
      console.log('Starting quiz:', quizId);

      // Обновляем статус квиза
      const { error: quizUpdateError } = await supabase
        .from('quizzes')
        .update({ status: 'active' })
        .eq('id', quizId);

      if (quizUpdateError) {
        console.error('Error updating quiz status:', quizUpdateError);
        throw quizUpdateError;
      }

      // Создаем или обновляем состояние квиза
      const stateData = {
        quiz_id: quizId,
        status: 'active' as const,
        current_question_index: 0,
        started_at: new Date().toISOString(),
      };

      const { error: stateError } = await supabase
        .from('quiz_state')
        .upsert(stateData, { onConflict: 'quiz_id' })
        .select();

      if (stateError) {
        console.error('Error upserting quiz state:', stateError);
        throw stateError;
      }

      console.log('Quiz started successfully');
      await loadQuizState();
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      const errorMsg = error?.message || error?.code || 'Неизвестная ошибка';
      alert(`Ошибка при запуске квиза: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }

  async function pauseQuiz() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quiz_state')
        .update({ status: 'paused' })
        .eq('quiz_id', quizId);

      if (error) throw error;

      await supabase
        .from('quizzes')
        .update({ status: 'paused' })
        .eq('id', quizId);
    } catch (error) {
      console.error('Error pausing quiz:', error);
    } finally {
      setLoading(false);
    }
  }

  async function nextQuestion() {
    setLoading(true);
    try {
      const currentIndex = quizState?.current_question_index || 0;
      
      // Сначала оцениваем текущий вопрос
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questions && questions[currentIndex]) {
        console.log('Grading question:', questions[currentIndex].id);
        await gradeCurrentQuestion(quizId, questions[currentIndex].id);
        // Обновляем лидерборд
        await loadParticipants();
      }
      
      // Затем переходим к следующему
      const { error } = await supabase
        .from('quiz_state')
        .update({ current_question_index: currentIndex + 1 })
        .eq('quiz_id', quizId);

      if (error) throw error;
    } catch (error) {
      console.error('Error moving to next question:', error);
    } finally {
      setLoading(false);
    }
  }

  async function endQuiz() {
    setLoading(true);
    try {
      // Оцениваем последний вопрос перед завершением
      const currentIndex = quizState?.current_question_index || 0;
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questions && questions[currentIndex]) {
        console.log('Grading final question:', questions[currentIndex].id);
        await gradeCurrentQuestion(quizId, questions[currentIndex].id);
        await loadParticipants();
      }

      const { error } = await supabase
        .from('quiz_state')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('quiz_id', quizId);

      if (error) throw error;

      await supabase
        .from('quizzes')
        .update({ status: 'completed' })
        .eq('id', quizId);
    } catch (error) {
      console.error('Error ending quiz:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    quizState,
    participants,
    loading,
    startQuiz,
    pauseQuiz,
    nextQuestion,
    endQuiz,
  };
}
