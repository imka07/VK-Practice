'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  role: 'participant' | 'organizer';
  created_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // Используем maybeSingle вместо single

        if (error) {
          console.error('Error loading profile:', error);
          setProfile(null);
        } else if (data) {
          setProfile(data);
        } else {
          // Профиль не найден - можно создать автоматически
          console.log('Profile not found, creating...');
          await createProfileIfNotExists();
        }
      } catch (err) {
        console.error('Unexpected error loading profile:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    async function createProfileIfNotExists() {
      if (!user) return;

      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
      const role = user.user_metadata?.role || 'participant';

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          role,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        setProfile(data);
      }
    }

    loadProfile();
  }, [user, supabase]);

  return { profile, loading };
}
