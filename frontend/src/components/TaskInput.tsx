import { useState } from 'react';
import { createTask } from '../api/tasks.api';
import ErrorBanner from './ErrorBanner';
import { TaskModal } from './TaskModal';
import type { CreateTaskPayload } from '../types';
import styles from './TaskInput.module.css';

interface TaskInputProps {
  selectedDate: string;
  onTaskAdded: () => void;
}

export default function TaskInput({ selectedDate, onTaskAdded }: TaskInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveTask(payload: CreateTaskPayload) {
    setError(null);
    try {
      await createTask(payload);
      onTaskAdded(); // Triggers the parent to refresh the task list
      // Note: The modal automatically closes itself on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err; // Throws back to the modal so it stops its "Saving..." spinner
    }
  }

  return (
    <div className={styles.container}>
      {error && <ErrorBanner message={error} />}
      
      <button 
        type="button" 
        className={styles.openModalButton} 
        onClick={() => setIsModalOpen(true)}
      >
        + Add New Task
      </button>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask}
        defaultDate={selectedDate} // Pre-fills the modal's date picker with the current dashboard date
      />
    </div>
  );
}