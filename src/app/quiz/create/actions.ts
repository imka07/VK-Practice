'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateRoomCode } from '@/lib/utils/room-code';

export async function createQuizAction(formData: FormData) {
  const supabase = await createClient();

  // Проверяем авторизацию
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Необходима авторизация' };
  }

  // Проверяем роль
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'organizer') {
    return { error: 'Только организаторы могут создавать квизы' };
  }

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim() || null;
  const category = String(formData.get('category') || '').trim() || null;
  const timePerQuestion = parseInt(String(formData.get('time_per_question') || '30'));
  const pointsPerQuestion = parseInt(String(formData.get('points_per_question') || '10'));

  // Валидация
  if (!title) {
    return { error: 'Название квиза обязательно' };
  }

  if (title.length < 3) {
    return { error: 'Название должно быть не менее 3 символов' };
  }

  if (timePerQuestion < 10 || timePerQuestion > 300) {
    return { error: 'Время на вопрос должно быть от 10 до 300 секунд' };
  }

  if (pointsPerQuestion < 1 || pointsPerQuestion > 100) {
    return { error: 'Базовые очки должны быть от 1 до 100' };
  }

  // Генерируем уникальный код комнаты
  let roomCode = generateRoomCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from('quizzes')
      .select('room_code')
      .eq('room_code', roomCode)
      .maybeSingle();

    if (!existing) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    return { error: 'Не удалось сгенерировать уникальный код комнаты' };
  }

  // Создаем квиз
  const { data: quiz, error } = await supabase
    .from('quizzes')
    .insert({
      creator_id: user.id,
      title,
      description,
      category,
      room_code: roomCode,
      time_per_question: timePerQuestion,
      points_per_question: pointsPerQuestion,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating quiz:', error);
    return { error: 'Ошибка при создании квиза' };
  }

  // Редирект на страницу редактирования (добавление вопросов)
  redirect(`/quiz/${quiz.id}/edit`);
}
