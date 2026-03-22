import { useState } from 'react';
import { createTask } from '../api/tasks.api';
import LoadingSpinner from './LoadingSpinner';
import ErrorBanner from './ErrorBanner';
import styles from './TaskInput.module.css';

interface TaskInputProps {
  selectedDate: string;
  onTaskAdded: () => void;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TaskInput({ selectedDate, onTaskAdded }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (selectedDate !== localToday()) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await createTask(trimmed, selectedDate);
      setTitle('');
      onTaskAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <ErrorBanner message={error} />}
      <label htmlFor="task-title" className={styles.label}>New task</label>
      <div className={styles.row}>
        <input
          id="task-title"
          type="text"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          maxLength={255}
          disabled={loading}
          required
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Add'}
        </button>
      </div>
    </form>
  );
}
