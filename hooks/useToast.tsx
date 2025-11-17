

import { useState, useCallback } from 'react';
import { ToastMessage } from '../types';

let toastId = 0;

const subscribers = new Set<(toasts: ToastMessage[]) => void>();

let toasts: ToastMessage[] = [];

const notify = () => {
  subscribers.forEach((callback) => callback(toasts));
};

export const toast = {
  success: (message: string) => {
    toasts = [...toasts, { id: toastId++, message, type: 'success' }];
    notify();
  },
  error: (message: string) => {
    toasts = [...toasts, { id: toastId++, message, type: 'error' }];
    notify();
  },
  remove: (id: number) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

export const useToast = () => {
  const [currentToasts, setCurrentToasts] = useState(toasts);

  const subscribe = useCallback(() => {
    const callback = (newToasts: ToastMessage[]) => setCurrentToasts(newToasts);
    subscribers.add(callback);
    // FIX: Ensure the cleanup function returns void. `Set.prototype.delete()` returns a boolean.
    return () => {
      subscribers.delete(callback);
    };
  }, []);

  return { toasts: currentToasts, subscribe };
};
