-- Добавляем поле score в таблицу quiz_participants, если его нет
ALTER TABLE quiz_participants 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0 NOT NULL;

-- Создаем индекс для быстрой сортировки по счету
CREATE INDEX IF NOT EXISTS idx_quiz_participants_score 
ON quiz_participants(quiz_id, score DESC);
