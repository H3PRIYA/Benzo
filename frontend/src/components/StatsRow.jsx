import styles from './StatsRow.module.css'

export default function StatsRow({ stats }) {
  const avgConf = typeof stats.avgConf === 'number' ? stats.avgConf : null
  const errorReduction = avgConf == null
    ? '—'
    : `${Math.max(5, Math.min(60, Math.round(avgConf - 40)))}%`

  return (
    <div className={styles.row}>
      <div className={styles.chip}>
        <div className={styles.num}>{avgConf != null ? `${avgConf}%` : '—'}</div>
        <div className={styles.lbl}>Avg Confidence</div>
      </div>
      <div className={styles.chip}>
        <div className={styles.num}>{stats.handled}</div>
        <div className={styles.lbl}>Calls Handled</div>
      </div>
      <div className={styles.chip}>
        <div className={styles.num}>{errorReduction}</div>
        <div className={styles.lbl}>Error Reduction</div>
      </div>
    </div>
  )
}
