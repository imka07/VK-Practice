-- ========================================
-- REALTIME TABLES MIGRATION (SIMPLIFIED)
-- ========================================

-- 1. Таблица состояния квиза
CREATE TABLE IF NOT EXISTS quiz_state (
  quiz_id UUID PRIMARY KEY REFERENCES quizzes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  current_question_index INTEGER DEFAULT 0 NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Таблица участников квиза
CREATE TABLE IF NOT EXISTS quiz_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0 NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, user_id)
);

-- Добавляем score, если таблица уже существует
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_participants' AND column_name = 'score'
  ) THEN
    ALTER TABLE quiz_participants ADD COLUMN score INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- 3. Таблица ответов участников
CREATE TABLE IF NOT EXISTS participant_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answer TEXT[] NOT NULL,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, question_id, user_id)
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_quiz_state_quiz_id ON quiz_state(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_participants_quiz_id ON quiz_participants(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_participants_user_id ON quiz_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_participants_score ON quiz_participants(quiz_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_participant_answers_quiz_id ON participant_answers(quiz_id);
CREATE INDEX IF NOT EXISTS idx_participant_answers_user_id ON participant_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_participant_answers_question_id ON participant_answers(question_id);

-- ========================================
-- RLS POLICIES (Упрощенные)
-- ========================================

-- quiz_state policies
ALTER TABLE quiz_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view quiz state" ON quiz_state;
CREATE POLICY "Users can view quiz state"
  ON quiz_state FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage quiz state" ON quiz_state;
CREATE POLICY "Authenticated users can manage quiz state"
  ON quiz_state FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- quiz_participants policies
ALTER TABLE quiz_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view quiz participants" ON quiz_participants;
CREATE POLICY "Users can view quiz participants"
  ON quiz_participants FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can join quizzes" ON quiz_participants;
CREATE POLICY "Users can join quizzes"
  ON quiz_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own participation" ON quiz_participants;
CREATE POLICY "Users can update their own participation"
  ON quiz_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- participant_answers policies
ALTER TABLE participant_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view quiz answers" ON participant_answers;
CREATE POLICY "Users can view quiz answers"
  ON participant_answers FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can submit their answers" ON participant_answers;
CREATE POLICY "Users can submit their answers"
  ON participant_answers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ========================================
-- REALTIME SUBSCRIPTIONS
-- ========================================

-- Включаем Realtime для таблиц
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_state;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE participant_answers;

-- ========================================
-- TRIGGERS
-- ========================================

-- Автоматическое обновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quiz_state_updated_at ON quiz_state;
CREATE TRIGGER update_quiz_state_updated_at
  BEFORE UPDATE ON quiz_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
