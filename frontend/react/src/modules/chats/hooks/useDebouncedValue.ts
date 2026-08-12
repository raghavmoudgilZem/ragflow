import { useState, useEffect } from 'react';

// Delays updating the returned value until `delay` ms after the last change.
// Used to prevent an API call on every search keystroke.
export const useDebouncedValue = <T>(value: T, delay = 400): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
