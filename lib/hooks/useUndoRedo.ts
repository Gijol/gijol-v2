import { useState, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  future: T[];
}

export function useUndoRedo<T>(initialState: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    future: [],
  });

  // Call this BEFORE making a change
  const takeSnapshot = useCallback((currentState: T) => {
    setHistory((prev) => ({
      past: [...prev.past, currentState],
      future: [],
    }));
  }, []);

  const undo = useCallback(
    (currentState: T): T | null => {
      const { past, future } = history;
      if (past.length === 0) return null;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      setHistory({
        past: newPast,
        future: [currentState, ...future],
      });

      return previous;
    },
    [history],
  );

  const redo = useCallback(
    (currentState: T): T | null => {
      const { past, future } = history;
      if (future.length === 0) return null;

      const next = future[0];
      const newFuture = future.slice(1);

      setHistory({
        past: [...past, currentState],
        future: newFuture,
      });

      return next;
    },
    [history],
  );

  return {
    takeSnapshot,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
