'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit, Trash2, CheckCircle } from 'lucide-react';

interface QuestionCardProps {
  question: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function QuestionCard({ question, index, onEdit, onDelete }: QuestionCardProps) {
  const typeLabels: Record<string, string> = {
    single_choice: 'Одиночный выбор',
    multiple_choice: 'Множественный выбор',
    text: 'Текстовый ответ',
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold text-gray-500">
              Вопрос {index + 1}
            </span>
            <Badge variant="secondary">{typeLabels[question.question_type]}</Badge>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {question.question_text}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {question.question_image_url && (
        <img
          src={question.question_image_url}
          alt="Question"
          className="max-w-md h-auto rounded-lg mb-4"
        />
      )}

      {question.question_type !== 'text' && question.options && (
        <div className="space-y-2">
          {question.options.map((option: string, idx: number) => (
            <div
              key={idx}
              className={`flex items-center gap-2 p-3 rounded-lg ${
                question.correct_answers.includes(option)
                  ? 'bg-success-50 border border-success-200'
                  : 'bg-gray-50'
              }`}
            >
              {question.correct_answers.includes(option) && (
                <CheckCircle className="w-4 h-4 text-success-600" />
              )}
              <span className="text-sm">{option}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
