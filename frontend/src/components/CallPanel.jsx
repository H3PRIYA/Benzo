import { useState, useRef, useEffect } from 'react'
import { useVoiceInput } from '../hooks/useVoiceInput.js'
import { SCENARIOS } from '../utils/constants.js'
import toast from 'react-hot-toast'
import styles from './CallPanel.module.css'

export default function CallPanel({ onAnalyze, loading }) {
  const [text, setText]           = useState('')
  const [activeScenario, setActive] = useState(null)
  const [speechLang, setSpeechLang] = useState('en-IN')
  const textareaRef               = useRef(null)

  const { isRecording, isSupported, interimText, startRecording, stopRecording, error } =
    useVoiceInput()

  // Reflect live voice transcript into the textarea in real time
  useEffect(() => {
    if (interimText) setText(interimText)
  }, [interimText])

  // Show mic error as a toast
  useEffect(() => {
    if (error) toast.error(error, { duration: 4000 })
  }, [error])

  const handleScenario = (idx) => {
    setActive(idx)
    setText(SCENARIOS[idx].text)
    textareaRef.current?.focus()
  }

  const handleMic = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported. Please use Chrome or Edge browser.')
      return
    }
    if (isRecording) {
      stopRecording()
    } else {
      // Clear existing text when starting fresh recording
      setText('')
      startRecording((finalText) => {
        // This runs every time a final segment arrives
        setText(finalText)
      }, speechLang)
      toast.success('Listening... speak in your selected language', { duration: 2500 })
    }
  }

  const handleSubmit = () => {
    if (isRecording) stopRecording()
    if (!text.trim()) {
      toast.error('Please enter or speak a complaint first.')
      return
    }
    onAnalyze(text.trim())
  }

  return (
    <div className={styles.card}>
      <div className={styles.label}>Simulate Citizen Call</div>

      <div className={styles.scenarios}>
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            className={`${styles.scenarioBtn} ${activeScenario === i ? styles.active : ''}`}
            onClick={() => handleScenario(i)}
          >
            <div className={styles.scenarioLang}>{s.lang}</div>
            <div className={styles.scenarioText}>{s.text}</div>
          </button>
        ))}
      </div>

      <div className={styles.textareaWrap}>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <select
            value={speechLang}
            onChange={(e) => setSpeechLang(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #d9d9d9', fontSize: 12 }}
            aria-label="Speech input language"
          >
            <option value="en-IN">English</option>
            <option value="kn-IN">Kannada</option>
            <option value="hi-IN">Hindi</option>
            <option value="ta-IN">Tamil</option>
          </select>
        </div>
        <textarea
          ref={textareaRef}
          className={`${styles.textarea} ${isRecording ? styles.recording : ''}`}
          value={text}
          onChange={e => { setText(e.target.value); setActive(null) }}
          placeholder="Type a complaint here, or click the mic to speak in English / Kannada / Hindi / Tamil..."
          rows={4}
          onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit() }}
        />
        {isRecording && (
          <div className={styles.listeningBadge}>
            <span className={styles.listeningDot} />
            Listening...
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.micBtn} ${isRecording ? styles.micActive : ''}`}
          onClick={handleMic}
          title={isRecording ? 'Stop recording' : isSupported ? 'Start voice input' : 'Not supported in this browser'}
        >
          {isRecording ? (
            /* Stop icon */
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="3" width="10" height="10" rx="2"/>
            </svg>
          ) : (
            /* Mic icon */
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="1" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2.5 8a5.5 5.5 0 0010 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="8" y1="13.5" x2="8" y2="15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        <button
          className={styles.analyzeBtn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <><span className={styles.spinner} /> Analyzing...</>
          ) : (
            'Analyze Call'
          )}
        </button>
      </div>

      {!isSupported && (
        <p className={styles.micWarning}>
          Voice input requires Chrome or Edge. Type your complaint above.
        </p>
      )}
    </div>
  )
}
