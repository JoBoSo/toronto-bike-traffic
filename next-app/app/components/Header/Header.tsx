"use client";

import styles from "@/components/Header/Header.module.scss";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Map', href: '/' },
    { name: 'Analytics', href: '/analytics' },
  ];

  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>Toronto Bike Traffic</h1>
      <div className={styles.pageButtonContainer}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          
          return (
            <Link key={link.href} href={link.href}>
              <button className={`
                ${styles.pageButton} 
                ${isActive ? styles.pageButtonActive : ''}
              `}>
                {link.name}
              </button>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

