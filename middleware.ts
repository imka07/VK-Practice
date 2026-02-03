import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Обновляем сессию
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Маршруты только для организаторов
  const organizerRoutes = ['/dashboard', '/quiz/create'];
  const isOrganizerRoute = organizerRoutes.some(route => pathname.startsWith(route));

  // Маршруты требующие авторизации (любая роль)
  const isQuizEditRoute = pathname.startsWith('/quiz/') && pathname.includes('/edit');
  const isQuizHostRoute = pathname.startsWith('/quiz/') && pathname.includes('/host');
  const isProtectedRoute = isOrganizerRoute || isQuizEditRoute || isQuizHostRoute;

  // Маршруты только для неавторизованных
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  // Редирект на логин если не авторизован и пытается попасть на защищенный маршрут
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Редирект в зависимости от роли если уже авторизован и пытается попасть на login/register
  if (isAuthRoute && session) {
    // Получаем роль пользователя
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role === 'organizer') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Проверяем роль для маршрутов организатора
  if (isOrganizerRoute && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Если не организатор - редирект на главную
    if (profile?.role !== 'organizer') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
