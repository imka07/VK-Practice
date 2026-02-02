'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import { logoutAction } from '@/app/(auth)/login/actions';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const isLoading = authLoading || profileLoading;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          Quiz Platform
        </Link>

        <nav className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span>{profile?.username || user.email}</span>
              </div>
              {profile?.role === 'organizer' && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Панель</Link>
                </Button>
              )}
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Регистрация</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
