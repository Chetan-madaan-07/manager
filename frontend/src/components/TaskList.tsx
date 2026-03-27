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

  // Grab the tasks for the day, or an empty array
  const rawTasks = byDate[selectedDate] ?? [];
  const isReadOnly = selectedDate < today;

  // --- NEW: Multi-level Sorting Logic ---
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  
  const tasks = [...rawTasks].sort((a, b) => {
    // 1. Sort by Priority (High -> Medium -> Low)
    const weightA = priorityWeight[a.priority || 'medium'];
    const weightB = priorityWeight[b.priority || 'medium'];
    if (weightA !== weightB) {
      return weightB - weightA; 
    }

    // 2. Sort by Time (Earlier -> Later)
    if (a.taskTime && b.taskTime) {
      return a.taskTime.localeCompare(b.taskTime);
    }
    // If one has a time and the other doesn't, put the timed one first
    if (a.taskTime && !b.taskTime) return -1;
    if (!a.taskTime && b.taskTime) return 1;

    // 3. First come, first serve (Fallback based on creation date)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  // ---------------------------------------

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