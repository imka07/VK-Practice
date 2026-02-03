'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Radio, RadioGroup } from '@/components/ui/Radio';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { createClient } from '@/lib/supabase/client';
import { X, Upload, Trash2 } from 'lucide-react';

interface QuestionFormProps {
  quizId: string;
  question?: any;
  onClose: () => void;
  nextOrderIndex: number;
}

export function QuestionForm({ quizId, question, onClose, nextOrderIndex }: QuestionFormProps) {
  const [questionType, setQuestionType] = useState<'single_choice' | 'multiple_choice' | 'text'>(
    question?.question_type || 'single_choice'
  );
  const [questionText, setQuestionText] = useState(question?.question_text || '');
  const [imageUrl, setImageUrl] = useState(question?.question_image_url || '');
  const [options, setOptions] = useState<string[]>(question?.options || ['', '', '', '']);
  // ❗ Исправлено: correct_answer вместо correct_answers
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(question?.correct_answer || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Можно загружать только изображения');
      return;
    }

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${quizId}/${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('quiz-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(data.path);

      setImageUrl(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Ошибка при загрузке изображения');
    } finally {
      setUploading(false);
    }
  }

  function handleOptionChange(index: number, value: string) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  function addOption() {
    setOptions([...options, '']);
  }

  function removeOption(index: number) {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    // Удаляем из правильных ответов если есть
    setCorrectAnswers(correctAnswers.filter((ans) => ans !== options[index]));
  }

  function handleCorrectAnswerToggle(option: string) {
    if (questionType === 'single_choice') {
      setCorrectAnswers([option]);
    } else {
      if (correctAnswers.includes(option)) {
        setCorrectAnswers(correctAnswers.filter((ans) => ans !== option));
      } else {
        setCorrectAnswers([...correctAnswers, option]);
      }
    }
  }

  async function handleSubmit() {
    setError(null);

    // Валидация
    if (!questionText.trim()) {
      setError('Введите текст вопроса');
      return;
    }

    if (questionType !== 'text') {
      const filledOptions = options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        setError('Добавьте минимум 2 варианта ответа');
        return;
      }

      if (correctAnswers.length === 0) {
        setError('Укажите правильный ответ');
        return;
      }
    }

    startTransition(async () => {
      try {
        const questionData = {
          quiz_id: quizId,
          question_text: questionText,
          question_image_url: imageUrl || null,
          question_type: questionType,
          // ❗ Исправлено: correct_answer вместо correct_answers
          correct_answer: questionType === 'text' ? [''] : correctAnswers,
          options: questionType === 'text' ? null : options.filter((opt) => opt.trim()),
          order_index: question?.order_index ?? nextOrderIndex,
        };

        if (question) {
          // Редактирование
          const { error: updateError } = await supabase
            .from('questions')
            .update(questionData)
            .eq('id', question.id);

          if (updateError) throw updateError;
        } else {
          // Создание
          const { error: insertError } = await supabase
            .from('questions')
            .insert(questionData);

          if (insertError) throw insertError;
        }

        onClose();
      } catch (err: any) {
        console.error('Save error:', err);
        setError(err.message || 'Ошибка при сохранении вопроса');
      }
    });
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">
          {question ? 'Редактирование вопроса' : 'Новый вопрос'}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="space-y-6">
        <RadioGroup label="Тип вопроса">
          <Radio
            name="questionType"
            value="single_choice"
            label="Одиночный выбор"
            checked={questionType === 'single_choice'}
            onChange={() => setQuestionType('single_choice')}
          />
          <Radio
            name="questionType"
            value="multiple_choice"
            label="Множественный выбор"
            checked={questionType === 'multiple_choice'}
            onChange={() => setQuestionType('multiple_choice')}
          />
          <Radio
            name="questionType"
            value="text"
            label="Текстовый ответ"
            checked={questionType === 'text'}
            onChange={() => setQuestionType('text')}
          />
        </RadioGroup>

        <Textarea
          label="Текст вопроса"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={3}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображение (необязательно)
          </label>
          {imageUrl ? (
            <div className="relative inline-block">
              <img src={imageUrl} alt="Question" className="max-w-md h-auto rounded-lg" />
              <Button
                variant="danger"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setImageUrl('')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div>
              <label className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Загрузка...' : 'Нажмите для загрузки изображения'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Максимум 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>

        {questionType !== 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Варианты ответов
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  {questionType === 'single_choice' ? (
                    <Radio
                      name="correct"
                      value={option}
                      checked={correctAnswers.includes(option)}
                      onChange={() => handleCorrectAnswerToggle(option)}
                      disabled={!option.trim()}
                    />
                  ) : (
                    <Checkbox
                      checked={correctAnswers.includes(option)}
                      onChange={() => handleCorrectAnswerToggle(option)}
                      disabled={!option.trim()}
                    />
                  )}
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Вариант ${index + 1}`}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-3"
              >
                + Добавить вариант
              </Button>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {questionType === 'single_choice'
                ? 'Отметьте правильный ответ'
                : 'Отметьте все правильные ответы'}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} loading={isPending}>
            {question ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
