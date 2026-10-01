import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
      return typeof initialValue === "function" ? initialValue() : initialValue;
    } catch (err) {
      console.error("Failed to read localStorage key:", key, err);
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Failed to write localStorage key:", key, err);
    }
  }, [key, value]);

  return [value, setValue];
}
