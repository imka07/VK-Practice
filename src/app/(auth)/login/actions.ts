'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  // Валидация
  if (!email || !password) {
    return { error: 'Заполните все поля' };
  }

  // Вход через Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Неверный email или пароль' };
  }

  // Получаем профиль пользователя
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  // Редиректим в зависимости от роли
  if (profile?.role === 'organizer') {
    redirect('/dashboard');
  } else {
    redirect('/');
  }
}
