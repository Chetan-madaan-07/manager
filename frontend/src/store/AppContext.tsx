import React, { createContext, useContext, useReducer } from 'react';
import type { User, Task } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
}

interface TasksState {
  byDate: Record<string, Task[]>;
  selectedDate: string;
  loading: boolean;
  error: string | null;
}

interface AppState {
  auth: AuthState;
  tasks: TasksState;
}

type Action =
  | { type: 'SET_AUTH'; payload: { user: User; accessToken: string } }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_TASKS'; payload: { date: string; tasks: Task[] } }
  | { type: 'ADD_TASK'; payload: { task: Task } }
  | { type: 'UPDATE_TASK'; payload: { task: Task } }
  | { type: 'DELETE_TASK'; payload: { taskId: string; taskDate: string } }
  | { type: 'SET_SELECTED_DATE'; payload: { date: string } }
  | { type: 'SET_TASKS_LOADING'; payload: { loading: boolean } }
  | { type: 'SET_TASKS_ERROR'; payload: { error: string | null } };

// Use local date to avoid UTC timezone mismatch (toISOString() returns UTC)
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const initialState: AppState = {
  auth: {
    user: null,
    accessToken: null,
  },
  tasks: {
    byDate: {},
    selectedDate: localToday(),
    loading: false,
    error: null,
  },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, auth: { user: action.payload.user, accessToken: action.payload.accessToken } };
    case 'CLEAR_AUTH':
      return { ...state, auth: { user: null, accessToken: null } };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          byDate: { ...state.tasks.byDate, [action.payload.date]: action.payload.tasks },
        },
      };
    case 'ADD_TASK': {
      const { task } = action.payload;
      const existing = state.tasks.byDate[task.taskDate] ?? [];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          byDate: { ...state.tasks.byDate, [task.taskDate]: [...existing, task] },
        },
      };
    }
    case 'UPDATE_TASK': {
      const { task } = action.payload;
      const existing = state.tasks.byDate[task.taskDate] ?? [];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          byDate: {
            ...state.tasks.byDate,
            [task.taskDate]: existing.map((t) => (t.id === task.id ? task : t)),
          },
        },
      };
    }
    case 'DELETE_TASK': {
      const { taskId, taskDate } = action.payload;
      const existing = state.tasks.byDate[taskDate] ?? [];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          byDate: {
            ...state.tasks.byDate,
            [taskDate]: existing.filter((t) => t.id !== taskId),
          },
        },
      };
    }
    case 'SET_SELECTED_DATE':
      return { ...state, tasks: { ...state.tasks, selectedDate: action.payload.date } };
    case 'SET_TASKS_LOADING':
      return { ...state, tasks: { ...state.tasks, loading: action.payload.loading } };
    case 'SET_TASKS_ERROR':
      return { ...state, tasks: { ...state.tasks, error: action.payload.error } };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
}
