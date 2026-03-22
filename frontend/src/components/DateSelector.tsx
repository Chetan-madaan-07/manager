import { useAppContext } from '../store/AppContext';
import styles from './DateSelector.module.css';

interface DateSelectorProps {
  onDateChange: (date: string) => void;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function DateSelector({ onDateChange }: DateSelectorProps) {
  const { state } = useAppContext();
  const today = localToday();
  const selectedDate = state.tasks.selectedDate || today;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onDateChange(e.target.value);
  }

  return (
    <div className={styles.wrapper}>
      <label htmlFor="date-selector" className={styles.label}>Date</label>
      <input
        id="date-selector"
        type="date"
        className={styles.input}
        value={selectedDate}
        max={today}
        onChange={handleChange}
      />
    </div>
  );
}
