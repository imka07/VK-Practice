import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель организатора
        </h1>
        <p className="text-gray-600">Управление квизами и мероприятиями</p>
      </div>

      <Alert variant="info" className="mb-6">
        Эта страница будет реализована на Этапе 3 (CRUD для квизов)
      </Alert>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Мои квизы</h3>
          <p className="text-sm text-gray-600 mb-4">Список всех созданных квизов</p>
          <Button variant="outline" disabled>Скоро</Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Создать квиз</h3>
          <p className="text-sm text-gray-600 mb-4">Новый интерактивный квиз</p>
          <Button variant="outline" disabled>Скоро</Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">История</h3>
          <p className="text-sm text-gray-600 mb-4">Проведенные мероприятия</p>
          <Button variant="outline" disabled>Скоро</Button>
        </Card>
      </div>
    </div>
  );
}
