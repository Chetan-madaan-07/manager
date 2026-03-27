import React, { useState, useEffect } from 'react';
import styles from './TaskModal.module.css';
import type { CreateTaskPayload, Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateTaskPayload) => Promise<void>;
  defaultDate?: string;
  initialData?: Task; // <--- NEW: Accept existing task data
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultDate,
  initialData 
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: Pre-fill the form when the modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDate(initialData?.taskDate || defaultDate || new Date().toISOString().slice(0, 10));
      setTaskTime(initialData?.taskTime || '');
      setDescription(initialData?.description || '');
      setPriority(initialData?.priority || 'medium');
    }
  }, [isOpen, initialData, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({ 
        title, 
        date, 
        taskTime: taskTime || undefined, 
        description: description || undefined, 
        priority 
      });
      onClose();
    } catch (error) {
      console.error("Failed to save task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{initialData ? 'Edit Task' : 'Add New Task'}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label>Task Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What needs to be done?"
              required 
              autoFocus
            />
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Time (Optional)</label>
              <input 
                type="time" 
                value={taskTime} 
                onChange={(e) => setTaskTime(e.target.value)} 
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Priority</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Description (Optional)</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Add extra details..."
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Saving...' : (initialData ? 'Update Task' : 'Save Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};