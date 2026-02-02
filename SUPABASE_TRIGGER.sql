-- Trigger для автоматического создания профиля при регистрации
-- Запустите этот SQL в Supabase SQL Editor

-- Функция для создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Игнорируем, если профиль уже существует
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаляем старый триггер если существует
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Создаем новый триггер
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Комментарий
COMMENT ON FUNCTION public.handle_new_user() IS 'Автоматически создает профиль при регистрации пользователя';
