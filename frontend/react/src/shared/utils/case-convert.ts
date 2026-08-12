const uppercaseLetterPattern = /\p{Lu}/gu;
const underscorePattern = /_([a-z])/g;

const toSnakeCaseKey = (key: string): string =>
  key.replace(uppercaseLetterPattern, (match: string, offset: number) =>
    offset > 0 ? `_${match.toLowerCase()}` : match.toLowerCase(),
  );

const toCamelCaseKey = (key: string): string =>
  key.replace(underscorePattern, (_, char) => char.toUpperCase());

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const convertKeysToSnakeCase = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeysToSnakeCase(item));
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[toSnakeCaseKey(key)] = convertKeysToSnakeCase(value[key]);
    }
    return result;
  }
  return value;
};

export const convertKeysToCamelCase = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeysToCamelCase(item));
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[toCamelCaseKey(key)] = convertKeysToCamelCase(value[key]);
    }
    return result;
  }
  return value;
};
