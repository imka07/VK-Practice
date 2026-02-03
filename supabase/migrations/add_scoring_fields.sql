-- ========================================
-- ДОБАВЛЕНИЕ ПОЛЕЙ ДЛЯ ПОДСЧЕТА БАЛЛОВ
-- ========================================

-- Добавляем поля в participant_answers
ALTER TABLE participant_answers 
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ DEFAULT NOW();

-- Добавляем поле correct_answer в questions если его нет
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS correct_answer TEXT[] DEFAULT NULL;

-- Функция для увеличения счета
DROP FUNCTION IF EXISTS increment_participant_score(UUID, UUID, INTEGER);

CREATE OR REPLACE FUNCTION increment_participant_score(
  p_quiz_id UUID,
  p_user_id UUID,
  p_points INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE quiz_participants
  SET score = score + p_points
  WHERE quiz_id = p_quiz_id AND user_id = p_user_id;
END;
$$;
