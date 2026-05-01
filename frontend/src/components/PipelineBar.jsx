import { Fragment } from 'react'
import styles from './PipelineBar.module.css'

const STEPS = [
  { label: 'Input',      icon: '🎙' },
  { label: 'Transcribe', icon: '📝' },
  { label: 'NLP',        icon: '🧠' },
  { label: 'Verify',     icon: '✔'  },
  { label: 'Route',      icon: '📋' },
]

export default function PipelineBar({ activeStep }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>Processing Pipeline</div>
      <div className={styles.track}>
        {STEPS.map((s, i) => (
          <Fragment key={s.label}>
            <div
              className={`${styles.step}
                ${activeStep === i ? styles.active : ''}
                ${activeStep > i  ? styles.done   : ''}`}
            >
              <div className={styles.icon}>{s.icon}</div>
              <div className={styles.stepLabel}>{s.label}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`${styles.arrow} ${activeStep > i ? styles.arrowDone : ''}`}>›</div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
