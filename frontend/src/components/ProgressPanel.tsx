import styles from './ProgressPanel.module.css';
import { useAppContext } from '../store/AppContext';
import type { Task } from '../types';

interface Props {
  selectedDate: string;
}

function computeProgress(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const remaining = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, remaining, percentage };
}

function StatsRow({ total, completed, remaining }: { total: number; completed: number; remaining: number }) {
  return (
    <p className={styles.stats}>
      <span>{total} total</span>
      <span className={styles.dot}>·</span>
      <span>{completed} done</span>
      <span className={styles.dot}>·</span>
      <span>{remaining} left</span>
    </p>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className={styles.barTrack} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.barFill} style={{ width: `${percentage}%` }} />
    </div>
  );
}

export default function ProgressPanel({ selectedDate }: Props) {
  const { state } = useAppContext();
  const tasks = state.tasks.byDate[selectedDate] ?? [];
  const { total, completed, remaining, percentage } = computeProgress(tasks);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>Progress</span>
        <span className={styles.percentage}>{percentage}%</span>
      </div>
      <ProgressBar percentage={percentage} />
      <StatsRow total={total} completed={completed} remaining={remaining} />
      {percentage === 100 && total > 0 && (
        <p className={styles.celebration}>All done for today! 🎉</p>
      )}
    </div>
  );
}
