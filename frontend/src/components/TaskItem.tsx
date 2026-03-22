import { useState } from 'react';
import type { Task } from '../types';
import { toggleTask, deleteTask } from '../api/tasks.api';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  isReadOnly: boolean;
  onChanged: () => void;
}

export default function TaskItem({ task, isReadOnly, onChanged }: TaskItemProps) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleToggle() {
    if (isReadOnly || toggling) return;
    setToggling(true);
    try {
      await toggleTask(task.id);
      onChanged();
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      onChanged();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  }

  const checkboxId = `task-checkbox-${task.id}`;

  return (
    <li className={`${styles.item} ${toggling || deleting ? styles.loading : ''}`}>
      <input
        id={checkboxId}
        type="checkbox"
        className={styles.checkbox}
        checked={task.completed}
        disabled={isReadOnly || toggling}
        onChange={handleToggle}
      />
      <label
        htmlFor={checkboxId}
        className={`${styles.title} ${task.completed ? styles.titleCompleted : ''}`}
      >
        {task.title}
      </label>
      {!isReadOnly && (
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          disabled={deleting}
          aria-label={`Delete ${task.title}`}
        >
          ✕
        </button>
      )}
    </li>
  );
}
