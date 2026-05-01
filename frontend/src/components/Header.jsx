import styles from './Header.module.css'

export default function Header({ status, callCount }) {
  const isError = status === 'ERROR' || status === 'ESCALATED'
  const isActive = status !== 'READY' && status !== 'ERROR'

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.badge}>
          <svg viewBox="0 0 18 18" fill="none" width="22" height="22">
            <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5"/>
            <path d="M6 9.5C6.5 11 7.5 12 9 12s2.5-1 3-2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="6.5" cy="7.5" r="1" fill="white"/>
            <circle cx="11.5" cy="7.5" r="1" fill="white"/>
          </svg>
        </div>
        <div>
          <div className={styles.logoText}>BENZO</div>
          <div className={styles.logoSub}>1092 AI Intelligence Layer</div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.statusPill} data-error={isError} data-active={isActive}>
          <div className={styles.dot} />
          <span>{status}</span>
        </div>
        <div className={styles.counter}>
          <span className={styles.counterNum}>{callCount}</span>
          <span className={styles.counterLabel}>calls</span>
        </div>
      </div>
    </header>
  )
}
