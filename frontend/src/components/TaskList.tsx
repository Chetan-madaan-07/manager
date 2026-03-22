import { useAppContext } from '../store/AppContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorBanner from './ErrorBanner';
import TaskItem from './TaskItem';
import styles from './TaskList.module.css';

interface TaskListProps {
  selectedDate: string;
  onTaskChanged: () => void;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TaskList({ selectedDate, onTaskChanged }: TaskListProps) {
  const { state } = useAppContext();
  const { loading, error, byDate } = state.tasks;
  const today = localToday();

  const tasks = byDate[selectedDate] ?? [];
  const isReadOnly = selectedDate < today;

  if (error) return <ErrorBanner message={error} />;
  if (loading && tasks.length === 0) return <LoadingSpinner />;
  if (tasks.length === 0) return <p className={styles.empty}>No tasks for this day.</p>;

  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} isReadOnly={isReadOnly} onChanged={onTaskChanged} />
      ))}
    </ul>
  );
}
