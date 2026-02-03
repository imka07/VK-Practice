/**
 * Формула подсчета очков
 * Базовые очки * (время оставшееся / время на вопрос)
 * Чем быстрее ответ, тем больше очков
 */
export function calculateScore(
  basePoints: number,
  timePerQuestion: number,
  answerTime: number
): number {
  if (answerTime <= 0 || answerTime > timePerQuestion) {
    return basePoints; // Минимальные очки если ответил в последнюю секунду
  }

  const timeRemaining = timePerQuestion - answerTime;
  const timeBonus = timeRemaining / timePerQuestion;
  
  // Базовые очки + бонус за скорость (до 2х базовых очков)
  return Math.round(basePoints + (basePoints * timeBonus));
}

/**
 * Проверка правильности ответа
 */
export function checkAnswer(
  userAnswer: string[],
  correctAnswer: string[],
  questionType: 'single_choice' | 'multiple_choice' | 'text'
): boolean {
  if (!userAnswer || userAnswer.length === 0) {
    return false;
  }

  if (questionType === 'text') {
    // Для текстовых ответов сравниваем без учета регистра и пробелов
    const normalizedUser = userAnswer[0]?.toLowerCase().trim() || '';
    const normalizedCorrect = correctAnswer[0]?.toLowerCase().trim() || '';
    return normalizedUser === normalizedCorrect;
  }

  if (questionType === 'multiple_choice') {
    // Для множественного выбора проверяем полное совпадение
    if (userAnswer.length !== correctAnswer.length) {
      return false;
    }
    const sortedUser = [...userAnswer].sort();
    const sortedCorrect = [...correctAnswer].sort();
    return sortedUser.every((answer, idx) => answer === sortedCorrect[idx]);
  }

  // single_choice
  return userAnswer[0] === correctAnswer[0];
}
