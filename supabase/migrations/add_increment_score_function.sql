-- ========================================
-- ФУНКЦИЯ ДЛЯ УВЕЛИЧЕНИЯ СЧЕТА УЧАСТНИКА
-- ========================================

-- Удаляем старую функцию если есть
DROP FUNCTION IF EXISTS increment_participant_score(UUID, UUID, INTEGER);

-- Создаем функцию для атомарного увеличения счета
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
