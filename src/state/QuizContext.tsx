import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { quizReducer, initialState, type Action, type QuizState } from './quizReducer';

interface QuizContextValue {
  state: QuizState;
  dispatch: Dispatch<Action>;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  return <QuizContext.Provider value={{ state, dispatch }}>{children}</QuizContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
