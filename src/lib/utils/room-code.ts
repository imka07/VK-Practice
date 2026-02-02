/**
 * Генерирует уникальный 6-значный код комнаты
 * Исключает символы, которые можно спутать: O, 0, I, 1
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Проверяет валидность кода комнаты
 */
export function isValidRoomCode(code: string): boolean {
  const pattern = /^[A-HJ-NP-Z2-9]{6}$/;
  return pattern.test(code);
}
