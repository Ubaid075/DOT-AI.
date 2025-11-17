import { useState, useCallback } from 'react';

export const useHistory = <T,>(initialState: T) => {
  const [state, setStateInternal] = useState({
    past: [] as T[],
    present: initialState,
    future: [] as T[],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;
    setStateInternal(currentState => {
      const newFuture = [currentState.present, ...currentState.future];
      const [newPresent, ...newPast] = currentState.past.slice().reverse();
      return {
        past: newPast.reverse(),
        present: newPresent,
        future: newFuture,
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    setStateInternal(currentState => {
      const [newPresent, ...newFuture] = currentState.future;
      const newPast = [...currentState.past, currentState.present];
      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, [canRedo]);

  const setState = useCallback((newState: T) => {
    setStateInternal(currentState => {
      // Prevent adding to history if state is identical
      if (JSON.stringify(newState) === JSON.stringify(currentState.present)) {
        return currentState;
      }
      const newPast = [...currentState.past, currentState.present];
      return {
        past: newPast,
        present: newState,
        future: [],
      };
    });
  }, []);

  return {
    state: state.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
