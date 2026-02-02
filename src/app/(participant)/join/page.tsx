import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function JoinQuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Присоединиться к квизу
          </h1>
          <p className="text-gray-600">Введите код комнаты</p>
        </div>

        <Alert variant="info" className="mb-6">
          Эта функция будет реализована на Этапе 4 (Realtime)
        </Alert>

        <div className="space-y-4">
          <Input
            label="Код комнаты"
            placeholder="ABC123"
            maxLength={6}
            disabled
          />
          <Button className="w-full" disabled>
            Присоединиться
          </Button>
        </div>
      </Card>
    </div>
  );
}
