'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import { logoutAction } from '@/app/(auth)/login/actions';
import { LogOut, User, Sparkles } from 'lucide-react';

export function Header() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const isLoading = authLoading || profileLoading;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Квизы от VK
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-xl" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 text-sm text-gray-700">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{profile?.username || user.email?.split('@')[0]}</span>
              </div>
              {profile?.role === 'organizer' && (
                <Button variant="outline" size="sm" asChild className="border-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                  <Link href="/dashboard">Панель</Link>
                </Button>
              )}
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" type="submit" className="hover:bg-red-50 hover:text-red-600 transition-all duration-300">
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="border-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                <Link href="/login">Войти</Link>
              </Button>
              <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/register">Регистрация</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
