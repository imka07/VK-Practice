/**
 * Типы базы данных
 * TODO: Сгенерировать автоматически из Supabase после создания миграций
 */

export type UserRole = 'participant' | 'organizer';

export type QuizStatus = 'draft' | 'active' | 'paused' | 'completed';

export type QuestionType = 'single_choice' | 'multiple_choice' | 'text';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Quiz {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  room_code: string;
  status: QuizStatus;
  time_per_question: number;
  points_per_question: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_image_url: string | null;
  question_type: QuestionType;
  correct_answers: string[];
  options: string[] | null;
  order_index: number;
  created_at: string;
}

export interface QuizParticipant {
  id: string;
  quiz_id: string;
  user_id: string;
  joined_at: string;
  total_score: number;
}

export interface ParticipantAnswer {
  id: string;
  quiz_id: string;
  question_id: string;
  user_id: string;
  answer: string | string[];
  is_correct: boolean;
  points_earned: number;
  answered_at: string;
}

export interface QuizState {
  id: string;
  quiz_id: string;
  current_question_id: string | null;
  question_started_at: string | null;
  participants_count: number;
  updated_at: string;
}
