import { useState } from 'react';
import type { Task, CreateTaskPayload } from '../types';
import { toggleTask, deleteTask, updateTask } from '../api/tasks.api'; // <--- Import updateTask
import { TaskModal } from './TaskModal'; // <--- Import the modal
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  isReadOnly: boolean;
  onChanged: () => void;
}

function formatTime(timeString?: string) {
  if (!timeString) return null;
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch (e) {
    return timeString;
  }
}

export default function TaskItem({ task, isReadOnly, onChanged }: TaskItemProps) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // <--- Edit state

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

  // NEW: Handle saving the edited task
  async function handleEditSave(payload: CreateTaskPayload) {
    try {
      await updateTask(task.id, payload);
      onChanged();
    } catch (err) {
      console.error('Update failed:', err);
      throw err;
    }
  }

  const checkboxId = `task-checkbox-${task.id}`;
  const displayTime = formatTime(task.taskTime);
  const priorityClass = task.priority ? styles[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`] : styles.priorityMedium;

  return (
    <>
      <li className={`${styles.item} ${toggling || deleting ? styles.loading : ''}`}>
        <div className={styles.contentWrapper}>
          <input
            id={checkboxId}
            type="checkbox"
            className={styles.checkbox}
            checked={task.completed}
            disabled={isReadOnly || toggling}
            onChange={handleToggle}
          />
          
          <div className={styles.details}>
            <label
              htmlFor={checkboxId}
              className={`${styles.title} ${task.completed ? styles.titleCompleted : ''}`}
            >
              {task.title}
            </label>
            
            <div className={styles.metadata}>
              <span className={`${styles.badge} ${priorityClass}`}>
                {task.priority || 'Medium'}
              </span>
              
              {displayTime && (
                <span className={styles.timeText}>
                  ⏱ {displayTime}
                </span>
              )}
            </div>

            {task.description && (
              <p className={`${styles.description} ${task.completed ? styles.textCompleted : ''}`}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className={styles.actionButtons}>
            {/* Edit Button */}
            <button
              className={styles.editBtn}
              onClick={() => setIsEditModalOpen(true)}
              disabled={deleting}
              aria-label={`Edit ${task.title}`}
            >
              ✎
            </button>
            {/* Existing Delete Button */}
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={deleting}
              aria-label={`Delete ${task.title}`}
            >
              ✕
            </button>
          </div>
        )}
      </li>

      {/* Render the modal for this specific task */}
      <TaskModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleEditSave}
        initialData={task}
      />
    </>
  );
}
