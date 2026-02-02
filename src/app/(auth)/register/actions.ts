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

  // Проверяем, не занято ли имя пользователя
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (existingProfile) {
    return { error: 'Это имя пользователя уже занято' };
  }

  // Регистрация через Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        role,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Если требуется подтверждение email, показываем сообщение
  if (authData.user && !authData.session) {
    return {
      success: true,
      message: 'Проверьте вашу почту для подтверждения аккаунта',
    };
  }

  // Создаем профиль пользователя
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        role: role as 'participant' | 'organizer',
      });

    if (profileError) {
      // Если профиль не создался из-за дублирования, игнорируем
      if (profileError.code !== '23505') {
        console.error('Profile creation error:', profileError);
        return { error: 'Ошибка создания профиля. Попробуйте войти.' };
      }
    }
  }

  redirect('/dashboard');
}
