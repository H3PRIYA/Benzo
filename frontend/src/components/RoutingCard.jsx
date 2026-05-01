import { DEPT_META } from '../utils/constants.js'
import styles from './RoutingCard.module.css'

export default function RoutingCard({ data }) {
  const dept = data.department || 'General'
  const meta = DEPT_META[dept] || DEPT_META['General']

  return (
    <div className={`${styles.card} ${styles.fadeIn}`}>
      <div className={styles.label}>Department Routing</div>
      <div className={styles.routeBox}>
        <div className={styles.deptIcon} style={{ background: meta.bg }}>
          {meta.icon}
        </div>
        <div className={styles.deptInfo}>
          <div className={styles.deptName}>{dept}</div>
          <div className={styles.deptMeta}>{meta.code} — {meta.sla}</div>
        </div>
        <div className={styles.routeBadge}>ROUTED</div>
      </div>
    </div>
  )
}
