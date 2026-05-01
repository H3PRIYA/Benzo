import styles from './VerifyLoop.module.css'

export default function VerifyLoop({ data, verifyState, onYes, onNo }) {
  const conf = Math.round(data.confidence || 55)

  if (!verifyState) return null

  // HIGH confidence — show confirmation question
  if (verifyState === 'pending') {
    return (
      <div className={`${styles.card} ${styles.fadeIn}`}>
        <div className={styles.label}>Verification Loop</div>
        <div className={styles.verifyBox}>
          <div className={styles.verifyHeader}>
            <div className={styles.verifyIcon}>?</div>
            <span className={styles.verifyTitle}>System Confirmation</span>
          </div>
          <p className={styles.verifyQ}>{data.verification_question}</p>
          <div className={styles.verifyActions}>
            <button className={`${styles.btn} ${styles.yes}`} onClick={onYes}>
              Yes, correct — proceed
            </button>
            <button className={`${styles.btn} ${styles.no}`} onClick={onNo}>
              No, re-clarify
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Citizen confirmed — show brief ack
  if (verifyState === 'confirmed') {
    return (
      <div className={`${styles.card} ${styles.fadeIn}`}>
        <div className={styles.label}>Verification Loop</div>
        <div className={styles.confirmedBox}>
          <span className={styles.checkIcon}>✓</span>
          Citizen confirmed. Routing to department...
        </div>
      </div>
    )
  }

  // Citizen rejected — show adaptive re-question
  if (verifyState === 'rejected') {
    return (
      <div className={`${styles.card} ${styles.fadeIn}`}>
        <div className={styles.label}>Adaptive Re-questioning</div>
        <div className={styles.adaptiveBox}>
          <div className={styles.adaptiveIcon}>↩</div>
          <div>
            <div className={styles.adaptiveTitle}>Citizen indicated misunderstanding</div>
            <p className={styles.adaptiveQ}>{data.adaptive_question}</p>
          </div>
        </div>
      </div>
    )
  }

  // MEDIUM confidence — adaptive question without Yes/No
  if (verifyState === 'medium') {
    return (
      <div className={`${styles.card} ${styles.fadeIn}`}>
        <div className={styles.label}>Adaptive Re-questioning</div>
        <div className={styles.mediumBox}>
          <div className={styles.mediumHeader}>
            <span className={styles.mediumBadge}>⚠ Medium confidence ({conf}%)</span>
          </div>
          <p className={styles.adaptiveQ}>{data.adaptive_question}</p>
        </div>
      </div>
    )
  }

  // LOW confidence — human escalation
  if (verifyState === 'low') {
    return (
      <div className={`${styles.card} ${styles.fadeIn}`}>
        <div className={styles.label}>Human Agent Escalation</div>
        <div className={styles.lowBox}>
          <div className={styles.lowHeader}>
            <span className={styles.lowBadge}>🔴 Low confidence ({conf}%) — {data.sentiment}</span>
          </div>
          <p className={styles.lowText}>
            Escalating to human agent. Pre-filled complaint record has been sent for review.
            The agent will complete verification manually.
          </p>
        </div>
      </div>
    )
  }

  return null
}
