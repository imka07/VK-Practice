# Настройка Supabase Storage для изображений квизов

После создания таблиц в Supabase, необходимо настроить Storage bucket для хранения изображений вопросов.

## Шаг 1: Создание Storage Bucket

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Storage** в боковом меню
4. Нажмите **New bucket**
5. Заполните:
   - **Name**: `quiz-images`
   - **Public bucket**: ✅ (отметьте чекбокс)
   - **File size limit**: `5MB` (необязательно)
   - **Allowed MIME types**: `image/*` (необязательно)
6. Нажмите **Save**

## Шаг 2: Настройка политик RLS для Storage

Перейдите в **SQL Editor** и выполните следующий SQL:

```sql
-- Разрешаем загрузку файлов только авторизованным пользователям
CREATE POLICY "Authenticated users can upload quiz images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'quiz-images' AND
  auth.role() = 'authenticated'
);

-- Разрешаем публичное чтение изображений
CREATE POLICY "Public can view quiz images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'quiz-images');

-- Разрешаем удаление только авторизованным пользователям
CREATE POLICY "Authenticated users can delete their quiz images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'quiz-images' AND
  auth.role() = 'authenticated'
);
```

## Шаг 3: Проверка настроек

1. Перейдите в **Storage** → **quiz-images**
2. Убедитесь, что bucket отмечен как **Public**
3. Проверьте политики в **Policies** вкладке

## 📝 Использование в коде

Пример загрузки изображения:

```typescript
const { data, error } = await supabase.storage
  .from('quiz-images')
  .upload(`${quizId}/${Date.now()}.jpg`, file);

if (!error) {
  const { data: { publicUrl } } = supabase.storage
    .from('quiz-images')
    .getPublicUrl(data.path);
  
  console.log('Image URL:', publicUrl);
}
```

## ⚠️ Требования к файлам

- **Типы файлов**: JPG, PNG, GIF, WebP
- **Максимальный размер**: 5MB
- **Структура папок**: `{quizId}/{timestamp}.{ext}`

## ✅ Готово!

Теперь вы можете загружать изображения к вопросам квиза!
