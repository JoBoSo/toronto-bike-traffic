import styles from "@/components/Header/Header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>Toronto Bike Traffic</h1>
    </header>
  );
}

