/**
 * Utility to convert camelCase keys to snake_case recursively for objects and arrays.
 */
export function camelToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnake(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
}
