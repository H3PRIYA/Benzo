import { SENTIMENT_COLORS } from '../utils/constants.js'
import styles from './NLPResults.module.css'

export default function NLPResults({ data }) {
  const conf   = Math.round(data.confidence || 55)
  const tier   = conf >= 75 ? 'high' : conf >= 50 ? 'medium' : 'low'
  const sc     = SENTIMENT_COLORS[data.sentiment] || SENTIMENT_COLORS.calm
  const ents   = data.entities || {}

  return (
    <div className={styles.card}>
      <div className={styles.label}>NLP Extraction</div>
      <div className={styles.grid}>

        <div className={styles.cell}>
          <div className={styles.cellLabel}>Intent</div>
          <div className={styles.cellValue}>{data.intent || '—'}</div>
        </div>

        <div className={styles.cell}>
          <div className={styles.cellLabel}>Confidence</div>
          <div className={styles.confNum} data-tier={tier}>{conf}%</div>
          <div className={styles.barWrap}>
            <div className={styles.bar} data-tier={tier} style={{ width: `${conf}%` }} />
          </div>
        </div>

        <div className={styles.cell}>
          <div className={styles.cellLabel}>Entities</div>
          <div className={styles.tags}>
            {ents.location     && <span className={`${styles.tag} ${styles.loc}`}>{ents.location}</span>}
            {ents.duration     && <span className={`${styles.tag} ${styles.dur}`}>{ents.duration}</span>}
            {ents.service_type && <span className={`${styles.tag} ${styles.svc}`}>{ents.service_type}</span>}
            {!ents.location && !ents.duration && !ents.service_type &&
              <span className={styles.none}>None extracted</span>}
          </div>
        </div>

        <div className={styles.cell}>
          <div className={styles.cellLabel}>Sentiment / Urgency</div>
          <div className={styles.sentiment}>
            <span className={styles.sentDot} style={{ background: sc.dot }} />
            <span className={styles.sentLabel} style={{ color: sc.text }}>
              {data.sentiment || 'calm'}
            </span>
          </div>
          {data.priority && (
            <div className={styles.priority} data-p={data.priority}>
              {data.priority} priority
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
