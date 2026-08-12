import { useState, useEffect } from 'react';

/**
 * A custom hook to delay updating a value until a set timeout has passed.
 * Excellent for preventing API rate-limiting on search filters.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 1. Establish the trailing timer delay window
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 2. Clean up execution frame if value mutations occur during the window
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
