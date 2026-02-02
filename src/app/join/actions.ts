'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatRoomCode } from '@/lib/utils/room-code';

export async function joinQuizAction(formData: FormData) {
  const supabase = await createClient();

  // Проверяем авторизацию
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Вместо redirect возвращаем ошибку
    return { error: 'Необходима авторизация', needsAuth: true };
  }

  const roomCode = formatRoomCode(String(formData.get('room_code') || ''));

  if (!roomCode || roomCode.length !== 6) {
    return { error: 'Неверный формат кода. Введите 6 символов' };
  }

  // Ищем квиз по коду
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, status')
    .eq('room_code', roomCode)
    .maybeSingle();

  if (quizError || !quiz) {
    return { error: 'Квиз с таким кодом не найден' };
  }

  if (quiz.status === 'completed') {
    return { error: 'Этот квиз уже завершен' };
  }

  // Проверяем, не участвует ли уже
  const { data: existingParticipant } = await supabase
    .from('quiz_participants')
    .select('id')
    .eq('quiz_id', quiz.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existingParticipant) {
    // Добавляем участника
    const { error: joinError } = await supabase
      .from('quiz_participants')
      .insert({
        quiz_id: quiz.id,
        user_id: user.id,
        score: 0,
      });

    if (joinError) {
      console.error('Error joining quiz:', joinError);
      return { error: 'Ошибка при присоединении к квизу' };
    }
  }

  // Редирект на страницу участника
  redirect(`/quiz/${quiz.id}/play`);
}
