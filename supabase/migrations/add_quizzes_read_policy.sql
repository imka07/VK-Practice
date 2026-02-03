-- ========================================
-- RLS ПОЛИТИКИ ДЛЯ ЧТЕНИЯ КВИЗОВ И ВОПРОСОВ
-- ========================================

-- Включаем RLS для quizzes если еще не включено
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Все авторизованные пользователи могут читать квизы
DROP POLICY IF EXISTS "Authenticated users can read quizzes" ON quizzes;
CREATE POLICY "Authenticated users can read quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (true);

-- Включаем RLS для questions если еще не включено
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Все авторизованные пользователи могут читать вопросы
DROP POLICY IF EXISTS "Authenticated users can read questions" ON questions;
CREATE POLICY "Authenticated users can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);
