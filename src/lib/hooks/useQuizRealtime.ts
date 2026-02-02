'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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

    // Загружаем начальное состояние
    loadQuizState();
    loadParticipants();

    // Подписываемся на Realtime канал
    const quizChannel = supabase.channel(`quiz:${quizId}`);

    // Слушаем изменения состояния квиза
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
      // Слушаем изменения участников
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

      if (error && error.code !== 'PGRST116') throw error;
      setQuizState(data);
    } catch (error) {
      console.error('Error loading quiz state:', error);
    }
  }

  async function loadParticipants() {
    try {
      // Получаем участников
      const { data: participantsData, error: participantsError } = await supabase
        .from('quiz_participants')
        .select('id, user_id, score, joined_at')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false });

      if (participantsError) throw participantsError;

      if (!participantsData || participantsData.length === 0) {
        setParticipants([]);
        return;
      }

      // Получаем профили для всех участников
      const userIds = participantsData.map(p => p.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Объединяем данные
      const participantsWithUsernames = participantsData.map((p) => {
        const profile = profilesData?.find(prof => prof.id === p.user_id);
        return {
          id: p.id,
          user_id: p.user_id,
          username: profile?.username || 'Аноним',
          score: p.score,
          joined_at: p.joined_at,
        };
      });

      setParticipants(participantsWithUsernames);
    } catch (error) {
      console.error('Error loading participants:', error);
      setParticipants([]);
    }
  }

  async function startQuiz() {
    setLoading(true);
    try {
      // Обновляем статус квиза
      await supabase
        .from('quizzes')
        .update({ status: 'active' })
        .eq('id', quizId);

      // Создаем или обновляем состояние квиза
      const { error } = await supabase
        .from('quiz_state')
        .upsert({
          quiz_id: quizId,
          status: 'active',
          current_question_index: 0,
          started_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Ошибка при запуске квиза');
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
