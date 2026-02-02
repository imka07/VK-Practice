/**
 * Форматирует код комнаты: приводит к верхнему регистру и удаляет пробелы
 */
export function formatRoomCode(code: string): string {
  return code.toUpperCase().replace(/\s/g, '').trim();
}

/**
 * Генерирует случайный 6-символьный код комнаты
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
