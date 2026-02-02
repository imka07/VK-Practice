'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string;
  role: 'organizer' | 'participant';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Получаем текущую сессию
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      // Загружаем профиль если есть пользователь
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Подписываемся на изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      console.log('Loading profile for user:', userId);
      
      const { data, error, status, statusText } = await supabase
        .from('profiles')
        .select('id, username, role')
        .eq('id', userId)
        .single();

      console.log('Profile query result:', { data, error, status, statusText });

      if (error) {
        console.error('Error loading profile:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        
        // Если профиля нет - создадим базовый (fallback)
        if (error.code === 'PGRST116') {
          console.log('Profile not found, user needs to complete registration');
          setProfile({
            id: userId,
            username: 'User',
            role: 'participant'
          });
        } else {
          setProfile(null);
        }
      } else {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Exception in loadProfile:', error);
      setProfile(null);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }

  return { user, profile, loading };
}
