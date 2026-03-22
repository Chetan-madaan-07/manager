import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { getTasks } from '../api/tasks.api';
import { logout } from '../api/auth.api';
import { clearAccessToken } from '../api/client';
import DateSelector from '../components/DateSelector';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import ProgressPanel from '../components/ProgressPanel';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const selectedDate = state.tasks.selectedDate;

  const fetchTasksForDate = useCallback(
    async (date: string) => {
      dispatch({ type: 'SET_TASKS_LOADING', payload: { loading: true } });
      dispatch({ type: 'SET_TASKS_ERROR', payload: { error: null } });
      try {
        const tasks = await getTasks(date);
        dispatch({ type: 'SET_TASKS', payload: { date, tasks } });
      } catch (err) {
        dispatch({
          type: 'SET_TASKS_ERROR',
          payload: { error: err instanceof Error ? err.message : 'Failed to load tasks' },
        });
      } finally {
        dispatch({ type: 'SET_TASKS_LOADING', payload: { loading: false } });
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchTasksForDate(selectedDate);
  }, [selectedDate]);

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    dispatch({ type: 'CLEAR_AUTH' });
    clearAccessToken();
    navigate('/auth');
  }

  function handleDateChange(date: string) {
    dispatch({ type: 'SET_SELECTED_DATE', payload: { date } });
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>✓</span>
          <span className={styles.appName}>TodoApp</span>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.controls}>
          <DateSelector onDateChange={handleDateChange} />
        </div>

        <div className={styles.content}>
          <section className={styles.tasksColumn}>
            <TaskInput selectedDate={selectedDate} onTaskAdded={() => fetchTasksForDate(selectedDate)} />
            <TaskList selectedDate={selectedDate} onTaskChanged={() => fetchTasksForDate(selectedDate)} />
          </section>

          <aside className={styles.progressColumn}>
            <ProgressPanel selectedDate={selectedDate} />
          </aside>
        </div>
      </main>
    </div>
  );
}
