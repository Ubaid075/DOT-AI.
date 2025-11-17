import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Header from './components/Header';
import ToastContainer from './components/Toast';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { theme } = useTheme();
  const { undo, redo, canUndo, canRedo } = useAuth();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (isCtrlOrCmd && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if (isCtrlOrCmd && event.key === 'y') {
        event.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);


  return (
    <div className={`font-sans min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      <div 
        className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white min-h-screen"
        style={{
          paddingLeft: 'env(safe-area-inset-left, 0rem)',
          paddingRight: 'env(safe-area-inset-right, 0rem)',
        }}
      >
        <Header />
        <main 
          className="px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: `calc(5rem + env(safe-area-inset-top, 0rem))` }}
        >
          <Outlet />
        </main>
        <footer 
          className="text-center pt-8 mt-12 text-gray-500 dark:text-gray-400 text-sm"
          style={{ paddingBottom: `calc(2rem + env(safe-area-inset-bottom, 0rem))` }}
        >
          <p>© 2025 DOT Ai Images. All rights reserved.</p>
        </footer>
        <ToastContainer />
      </div>
    </div>
  );
};

export default App;