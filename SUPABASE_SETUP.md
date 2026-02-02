# Настройка Supabase для Quiz Platform

Пошаговая инструкция по настройке проекта Supabase для платформы квизов.

## Шаг 1: Создание проекта

1. Перейдите на [https://supabase.com](https://supabase.com)
2. Войдите или создайте аккаунт
3. Нажмите "New Project"
4. Заполните данные:
   - **Name**: `quiz-platform` (или любое другое имя)
   - **Database Password**: Придумайте надежный пароль и сохраните его
   - **Region**: Выберите ближайший регион (для России: Frankfurt или Stockholm)
   - **Pricing Plan**: Free tier (достаточно для разработки)
5. Нажмите "Create new project"
6. Дождитесь создания проекта (~2 минуты)

## Шаг 2: Получение API ключей

1. В левом меню проекта выберите **Settings** → **API**
2. Найдите секцию "Project API keys"
3. Скопируйте следующие данные:
   - **Project URL** (например: `https://xyzcompany.supabase.co`)
   - **anon/public key** (начинается с `eyJ...`)

4. Создайте файл `.env.local` в корне проекта:
```bash
cp .env.example .env.local
```

5. Заполните переменные:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Шаг 3: Настройка Authentication (для Этапа 2)

### Включение Email/Password авторизации:

1. Перейдите в **Authentication** → **Providers**
2. Убедитесь, что **Email** включен
3. Настройки по умолчанию:
   - ✅ Enable email confirmations (можно отключить для разработки)
   - ✅ Enable email signups

### (Опционально) Настройка OAuth провайдеров:

Для добавления входа через VK, Google и др.:

1. В разделе **Authentication** → **Providers**
2. Выберите нужный провайдер (например, Google)
3. Получите Client ID и Client Secret от провайдера
4. Вставьте их в форму Supabase

## Шаг 4: Настройка Storage (для изображений)

1. Перейдите в **Storage**
2. Нажмите "Create bucket"
3. Создайте bucket:
   - **Name**: `quiz-images`
   - **Public bucket**: ✅ (для публичного доступа к изображениям)
4. Нажмите "Create bucket"

### Настройка политик доступа:

```sql
-- Политика для чтения (все пользователи)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'quiz-images' );

-- Политика для загрузки (только авторизованные)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'quiz-images' AND
  auth.role() = 'authenticated'
);
```

## Шаг 5: Проверка подключения

1. Запустите проект локально:
```bash
npm run dev
```

2. Откройте консоль браузера (F12)
3. Откройте страницу [http://localhost:3000](http://localhost:3000)
4. Если нет ошибок с Supabase - подключение работает!

## Шаг 6: Настройка базы данных (Этап 2)

Создание таблиц будет выполнено на **Этапе 2** через миграции.

### Предварительный обзор схемы:

```sql
-- profiles (расширение профиля auth.users)
-- quizzes (квизы)
-- questions (вопросы)
-- quiz_participants (участники)
-- participant_answers (ответы)
-- quiz_state (состояние в realtime)
```

## Шаг 7: Realtime настройка (Этап 4)

### Включение Realtime для таблиц:

1. Перейдите в **Database** → **Replication**
2. Найдите таблицы, для которых нужен realtime:
   - `quizzes`
   - `quiz_state`
   - `quiz_participants`
   - `participant_answers`
3. Включите репликацию (toggle справа)

### Пример настройки в коде:

```typescript
const channel = supabase
  .channel(`quiz:${quizId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'quiz_state',
    filter: `quiz_id=eq.${quizId}`
  }, (payload) => {
    console.log('Quiz state updated:', payload);
  })
  .subscribe();
```

## Полезные ссылки

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Troubleshooting

### Ошибка: "Invalid API key"
- Проверьте, что скопировали правильный ключ (anon, не service_role)
- Убедитесь, что в `.env.local` нет лишних пробелов

### Ошибка: "CORS policy"
- Проверьте, что используете `NEXT_PUBLIC_` префикс для переменных
- Перезапустите dev сервер после изменения `.env.local`

### Storage не работает
- Проверьте, что bucket создан и публичный
- Проверьте политики доступа в Storage → Policies

### Realtime не обновляется
- Убедитесь, что репликация включена для таблицы
- Проверьте подписку на канал в коде
- Проверьте консоль браузера на ошибки

## Следующие шаги

✅ После завершения настройки Supabase переходите к **Этапу 2**:
- Создание миграций для таблиц БД
- Настройка Row Level Security (RLS)
- Интеграция авторизации в UI
