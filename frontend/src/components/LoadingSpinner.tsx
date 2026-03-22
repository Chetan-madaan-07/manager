import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.wrapper} role="status" aria-label="Loading">
      <span className={styles.spinner} />
    </div>
  );
}
