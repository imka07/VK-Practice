'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function registerAction(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const username = String(formData.get('username') || '').trim();
  const role = String(formData.get('role') || 'participant');

  // Валидация
  if (!email || !password || !username) {
    return { error: 'Заполните все поля' };
  }

  if (password.length < 6) {
    return { error: 'Пароль должен быть не менее 6 символов' };
  }

  if (username.length < 3) {
    return { error: 'Имя пользователя должно быть не менее 3 символов' };
  }

  // Регистрация через Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Если требуется подтверждение email, показываем сообщение
  if (data.user && !data.session) {
    return {
      success: true,
      message: 'Проверьте вашу почту для подтверждения аккаунта',
    };
  }

  // Создаем профиль пользователя
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username,
        role: role as 'participant' | 'organizer',
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Не блокируем регистрацию, профиль можно создать позже
    }
  }

  redirect('/dashboard');
}
