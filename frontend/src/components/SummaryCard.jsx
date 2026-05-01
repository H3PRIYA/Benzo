import { useState } from 'react'
import styles from './SummaryCard.module.css'

export default function SummaryCard({ data, onNewCall }) {
  const [copied, setCopied] = useState(false)
  const s = data.summary || {}

  const rows = [
    ['Issue',      s.issue      || data.intent   || '—'],
    ['Location',   s.location   || data.entities?.location || 'Unknown'],
    ['Duration',   s.duration   || data.entities?.duration || 'Unknown'],
    ['Department', s.department || data.department || '—'],
    ['Sentiment',  s.sentiment  || data.sentiment  || '—'],
    ['Priority',   s.priority   || data.priority   || '—'],
    ['Action',     s.action     || 'Assign to department'],
  ]

  const copyRecord = () => {
    const text = rows.map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className={`${styles.card} ${styles.fadeIn}`}>
      <div className={styles.label}>Structured Complaint Record</div>
      <div className={styles.summaryBox}>
        {rows.map(([k, v]) => (
          <div key={k} className={styles.row}>
            <span className={styles.key}>{k}</span>
            <span className={styles.val}>{v}</span>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <button className={styles.copyBtn} onClick={copyRecord}>
          {copied ? 'Copied ✓' : 'Copy Record'}
        </button>
        <button className={`${styles.copyBtn} ${styles.newCall}`} onClick={onNewCall}>
          New Call
        </button>
      </div>
    </div>
  )
}
