import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { questionId, userId } = await request.json();

    // 1. Получаем вопрос с правильным ответом
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('correct_answer, question_type')
      .eq('id', questionId)
      .single();

    if (questionError) throw questionError;

    if (!question.correct_answer || question.correct_answer.length === 0) {
      return NextResponse.json({ 
        error: 'Question has no correct answer defined' 
      }, { status: 400 });
    }

    // 2. Получаем ответ участника
    const { data: answer, error: answerError } = await supabase
      .from('participant_answers')
      .select('answer, answered_at')
      .eq('quiz_id', params.id)
      .eq('question_id', questionId)
      .eq('user_id', userId)
      .single();

    if (answerError) throw answerError;

    // 3. Проверяем правильность ответа
    let isCorrect = false;
    
    if (question.question_type === 'multiple_choice') {
      // Для множественного выбора сравниваем массивы
      const userAnswer = [...answer.answer].sort();
      const correctAnswer = [...question.correct_answer].sort();
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    } else if (question.question_type === 'text') {
      // Для текстовых ответов - без учета регистра и пробелов
      const userAnswer = answer.answer[0]?.trim().toLowerCase() || '';
      const correctAnswer = question.correct_answer[0]?.trim().toLowerCase() || '';
      isCorrect = userAnswer === correctAnswer;
    } else {
      // Для одиночного выбора
      isCorrect = answer.answer[0] === question.correct_answer[0];
    }

    // 4. Обновляем статус ответа
    await supabase
      .from('participant_answers')
      .update({ is_correct: isCorrect })
      .eq('quiz_id', params.id)
      .eq('question_id', questionId)
      .eq('user_id', userId);

    // 5. Если ответ правильный - начисляем очки
    let pointsAwarded = 0;
    if (isCorrect) {
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('points_per_question')
        .eq('id', params.id)
        .single();

      pointsAwarded = quiz?.points_per_question || 10;

      // Вызываем функцию увеличения счета
      const { error: scoreError } = await supabase.rpc('increment_participant_score', {
        p_quiz_id: params.id,
        p_user_id: userId,
        p_points: pointsAwarded,
      });

      if (scoreError) {
        console.error('Error incrementing score:', scoreError);
        throw scoreError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      isCorrect,
      pointsAwarded
    });

  } catch (error) {
    console.error('Error checking answer:', error);
    return NextResponse.json({ 
      error: 'Failed to check answer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
