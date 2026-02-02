/**
 * Типы вопросов и их сложность
 */
export type QuestionType = 'single_choice' | 'multiple_choice' | 'text';

/**
 * Вычисляет количество баллов за правильный ответ
 * на основе типа вопроса и базовых очков
 */
export function calculateScore(params: {
  questionType: QuestionType;
  isCorrect: boolean;
  basePoints: number;
}): number {
  if (!params.isCorrect) return 0;
  
  const typeMultiplier: Record<QuestionType, number> = {
    single_choice: 1.0,      // 100% базовых очков
    multiple_choice: 1.5,    // 150% (сложнее)
    text: 2.0,               // 200% (самый сложный)
  };
  
  return Math.round(params.basePoints * typeMultiplier[params.questionType]);
}

/**
 * Примеры:
 * - Single choice (базовые 10 очков) = 10 очков
 * - Multiple choice (базовые 10 очков) = 15 очков
 * - Text answer (базовые 10 очков) = 20 очков
 */
