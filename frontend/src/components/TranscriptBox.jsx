import styles from './TranscriptBox.module.css'

export default function TranscriptBox({ data }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>Live Transcription + Normalization</div>
      <div className={styles.box}>
        {!data && <span className={styles.placeholder}>Awaiting input...</span>}
        {data?.loading && <span className={styles.placeholder}>Processing speech...</span>}
        {data?.error && <span className={styles.error}>{data.error}</span>}
        {data?.original && !data.loading && (
          <>
            <span className={styles.tag}>ORIGINAL ›</span>
            <span className={styles.original}>{data.original}</span>
            {data.normalized && (
              <>
                <span className={styles.tag} style={{ marginTop: 8 }}>NORMALIZED ›</span>
                <span className={styles.normalized}>{data.normalized}</span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
