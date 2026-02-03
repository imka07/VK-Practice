-- ========================================
-- НАСТРОЙКА СИСТЕМЫ ОЦЕНКИ
-- ========================================

-- 1. Добавляем correct_answer в questions если еще нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'correct_answer'
  ) THEN
    ALTER TABLE questions ADD COLUMN correct_answer TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;
END $$;

-- 2. Функция для увеличения счета
DROP FUNCTION IF EXISTS increment_participant_score(UUID, UUID, INTEGER);

CREATE OR REPLACE FUNCTION increment_participant_score(
  p_quiz_id UUID,
  p_user_id UUID,
  p_points INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE quiz_participants
  SET score = score + p_points
  WHERE quiz_id = p_quiz_id AND user_id = p_user_id;
END;
$$;

-- 3. Добавляем RLS политики для participant_answers UPDATE
DROP POLICY IF EXISTS "Organizers can update answers" ON participant_answers;
CREATE POLICY "Organizers can update answers"
  ON participant_answers FOR UPDATE
  TO authenticated
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  );

-- 4. Добавляем RLS политику для quiz_participants UPDATE (для организатора)
DROP POLICY IF EXISTS "Organizers can update participant scores" ON quiz_participants;
CREATE POLICY "Organizers can update participant scores"
  ON quiz_participants FOR UPDATE
  TO authenticated
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  );

-- 5. Добавляем username в quiz_participants если еще нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_participants' AND column_name = 'username'
  ) THEN
    ALTER TABLE quiz_participants ADD COLUMN username TEXT NOT NULL DEFAULT 'Аноним';
  END IF;
END $$;
