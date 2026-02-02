'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio, RadioGroup } from '@/components/ui/Radio';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { Spinner, Loading } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function UIKitPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">UI Kit</h1>
          <p className="text-gray-600">
            Библиотека компонентов для Quiz Platform
          </p>
        </div>

        {/* Buttons */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Inputs */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input
              label="Email"
              type="email"
              placeholder="example@mail.com"
              helperText="Мы никогда не поделимся вашей почтой"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
            />
            <Input
              label="Disabled"
              placeholder="Disabled input"
              disabled
            />
            <Input
              label="With Error"
              placeholder="john@example.com"
              error="Неверный формат email"
            />
            <Textarea
              label="Description"
              placeholder="Введите описание квиза..."
              rows={4}
              helperText="Минимум 10 символов"
            />
          </div>
        </Card>

        {/* Select */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Select</h2>
          <div className="space-y-4 max-w-md">
            <Select label="Category" required>
              <option value="">Выберите категорию</option>
              <option value="general">Общие знания</option>
              <option value="science">Наука</option>
              <option value="history">История</option>
              <option value="sports">Спорт</option>
            </Select>
            <Select label="Difficulty" helperText="Выберите уровень сложности">
              <option value="easy">Легкий</option>
              <option value="medium">Средний</option>
              <option value="hard">Сложный</option>
            </Select>
          </div>
        </Card>

        {/* Checkboxes & Radio */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Checkboxes & Radio</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Checkboxes</h3>
              <div className="space-y-2">
                <Checkbox label="Одиночный выбор" />
                <Checkbox label="Множественный выбор" />
                <Checkbox label="Текстовый ответ" />
                <Checkbox label="Disabled" disabled />
                <Checkbox label="Checked" defaultChecked />
              </div>
            </div>
            <div>
              <RadioGroup label="Тип вопроса">
                <Radio name="questionType" value="single" label="Single choice" />
                <Radio name="questionType" value="multiple" label="Multiple choice" />
                <Radio name="questionType" value="text" label="Text answer" />
              </RadioGroup>
            </div>
          </div>
        </Card>

        {/* Alerts */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
          <div className="space-y-4">
            <Alert variant="info" title="Info Alert">
              Это информационное сообщение для пользователя.
            </Alert>
            <Alert variant="success" title="Success!">
              Квиз успешно создан и готов к запуску.
            </Alert>
            <Alert variant="warning" title="Warning">
              Не забудьте добавить вопросы перед запуском квиза.
            </Alert>
            <Alert variant="error" title="Error" onClose={() => {}}>
              Произошла ошибка при сохранении. Попробуйте еще раз.
            </Alert>
          </div>
        </Card>

        {/* Badges */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Paused</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Card>

        {/* Spinners */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Spinners</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Sizes</h3>
              <div className="flex items-center gap-6">
                <Spinner size="sm" className="text-primary-600" />
                <Spinner size="md" className="text-primary-600" />
                <Spinner size="lg" className="text-primary-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Loading Component</h3>
              <Loading text="Загрузка квизов..." />
            </div>
          </div>
        </Card>

        {/* Cards */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <Card.Header>
                <Card.Title>Default Card</Card.Title>
                <Card.Description>Card description text</Card.Description>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-gray-600">
                  This is the content area of the card.
                </p>
              </Card.Content>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Card.Header>
                <Card.Title>Hover Card</Card.Title>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-gray-600">
                  Hover over this card to see the effect.
                </p>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Card with Footer</Card.Title>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-gray-600">Some content here.</p>
              </Card.Content>
              <Card.Footer>
                <Button size="sm" variant="outline">Action</Button>
              </Card.Footer>
            </Card>
          </div>
        </Card>

        {/* Modal */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Modal</h2>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Создание нового квиза"
          >
            <div className="space-y-4">
              <Input label="Название" placeholder="Введите название квиза" />
              <Select label="Категория">
                <option value="">Выберите категорию</option>
                <option value="general">Общие знания</option>
                <option value="science">Наука</option>
              </Select>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={() => setModalOpen(false)}>Создать</Button>
              </div>
            </div>
          </Modal>
        </Card>
      </div>
    </div>
  );
}
