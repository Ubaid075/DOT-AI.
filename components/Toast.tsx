
import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { useToast, toast } from '../hooks/useToast';

const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast: t }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.remove(t.id);
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [t.id]);

  const baseClasses = "flex items-center w-full max-w-xs p-4 my-2 text-gray-500 bg-white rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-800 transition-all duration-300 transform";
  
  const typeClasses = {
    success: 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200',
    error: 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200',
  };

  const Icon = () => {
    const iconBase = "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg";
    if (t.type === 'success') {
      return (
        <div className={`${iconBase} ${typeClasses.success}`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
        </div>
      );
    }
    return (
      <div className={`${iconBase} ${typeClasses.error}`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.693a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </div>
    );
  };

  return (
    <div className={baseClasses} role="alert">
        <Icon />
        <div className="ml-3 text-sm font-normal">{t.message}</div>
        <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" onClick={() => toast.remove(t.id)}>
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.693a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
    const { toasts, subscribe } = useToast();

    useEffect(() => {
        return subscribe();
    }, [subscribe]);

    return (
        <div className="fixed top-20 right-0 z-50 p-4 space-y-2">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} />
            ))}
        </div>
    );
};

export default ToastContainer;
