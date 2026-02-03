'use server';

import { createClient } from '@/lib/supabase/server';
import { checkAnswer, calculateScore } from '@/lib/scoring/calculateScore';

/**
 * Оценивает ответы на текущий вопрос и обновляет баллы участников
 */
export async function gradeCurrentQuestion(quizId: string, questionId: string) {
  const supabase = await createClient();

  try {
    // Получаем информацию о квизе
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('time_per_question, points_per_question')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      console.error('Quiz not found:', quizError);
      return { error: 'Квиз не найден' };
    }

    // Получаем вопрос с правильным ответом
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, question_type, correct_answer')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      console.error('Question not found:', questionError);
      return { error: 'Вопрос не найден' };
    }

    // Получаем время начала вопроса
    const { data: quizState } = await supabase
      .from('quiz_state')
      .select('updated_at')
      .eq('quiz_id', quizId)
      .single();

    const questionStartTime = quizState?.updated_at ? new Date(quizState.updated_at).getTime() : Date.now();

    // Получаем все ответы на этот вопрос
    const { data: answers, error: answersError } = await supabase
      .from('participant_answers')
      .select('id, user_id, answer, answered_at')
      .eq('quiz_id', quizId)
      .eq('question_id', questionId);

    if (answersError) {
      console.error('Error fetching answers:', answersError);
      return { error: 'Ошибка получения ответов' };
    }

    if (!answers || answers.length === 0) {
      console.log('No answers to grade');
      return { success: true, gradedCount: 0 };
    }

    // Оцениваем каждый ответ
    for (const answer of answers) {
      const isCorrect = checkAnswer(
        answer.answer,
        question.correct_answer,
        question.question_type
      );

      // Рассчитываем время ответа
      const answerTime = answer.answered_at 
        ? Math.floor((new Date(answer.answered_at).getTime() - questionStartTime) / 1000)
        : quiz.time_per_question;

      // Рассчитываем очки
      const pointsEarned = isCorrect 
        ? calculateScore(quiz.points_per_question, quiz.time_per_question, answerTime)
        : 0;

      // Обновляем ответ с результатом
      await supabase
        .from('participant_answers')
        .update({
          is_correct: isCorrect,
          points_earned: pointsEarned,
        })
        .eq('id', answer.id);

      // Обновляем общий счет участника
      if (isCorrect) {
        await supabase.rpc('increment_participant_score', {
          p_quiz_id: quizId,
          p_user_id: answer.user_id,
          p_points: pointsEarned,
        });
      }
    }

    console.log(`Graded ${answers.length} answers for question ${questionId}`);
    return { success: true, gradedCount: answers.length };
  } catch (error) {
    console.error('Error grading answers:', error);
    return { error: 'Ошибка при оценивании' };
  }
}
