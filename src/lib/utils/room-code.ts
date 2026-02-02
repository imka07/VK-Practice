/**
 * Генерирует уникальный код комнаты для квиза
 * Формат: 6 символов (буквы верхнего регистра и цифры)
 * Пример: "ABC123", "XYZ789"
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}

/**
 * Проверяет валидность room code
 */
export function isValidRoomCode(code: string): boolean {
  const pattern = /^[A-Z0-9]{6}$/;
  return pattern.test(code);
}

/**
 * Форматирует room code в единый формат
 * Преобразует к верхнему регистру и удаляет пробелы
 */
export function formatRoomCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}
