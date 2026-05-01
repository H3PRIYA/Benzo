import { useState, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import Header       from './components/Header.jsx'
import CallPanel    from './components/CallPanel.jsx'
import PipelineBar  from './components/PipelineBar.jsx'
import TranscriptBox from './components/TranscriptBox.jsx'
import NLPResults   from './components/NLPResults.jsx'
import VerifyLoop   from './components/VerifyLoop.jsx'
import RoutingCard  from './components/RoutingCard.jsx'
import SummaryCard  from './components/SummaryCard.jsx'
import StatsRow     from './components/StatsRow.jsx'
import { analyzeText, logFeedback } from './utils/api.js'
import styles from './App.module.css'

// Pipeline steps: 0=input 1=transcribe 2=nlp 3=verify 4=route
const IDLE  = { step: -1, status: 'READY' }

export default function App() {
  const [pipeline, setPipeline]   = useState(IDLE)
  const [transcript, setTranscript] = useState(null)   // { original, normalized }
  const [nlpData, setNlpData]     = useState(null)
  const [verifyState, setVerify]  = useState(null)     // 'pending'|'confirmed'|'rejected'|'medium'|'low'
  const [result, setResult]       = useState(null)
  const [callCount, setCallCount] = useState(0)
  const [stats, setStats]         = useState({ handled: 0, avgConf: null, totalConf: 0 })

  const delay = ms => new Promise(r => setTimeout(r, ms))

  const step = (n, status) => setPipeline({ step: n, status })

  const reset = useCallback(() => {
    setPipeline(IDLE)
    setTranscript(null)
    setNlpData(null)
    setVerify(null)
    setResult(null)
  }, [])

  const updateStats = useCallback((confidence) => {
    const conf = Math.round(confidence || 55)
    setStats((s) => {
      const handled = s.handled + 1
      const totalConf = (s.totalConf || 0) + conf
      return {
        handled,
        totalConf,
        avgConf: Math.round(totalConf / handled),
      }
    })
  }, [])

  const runAnalysis = useCallback(async (text) => {
    if (!text.trim()) return
    reset()
    setCallCount(c => c + 1)

    step(0, 'PROCESSING')
    await delay(250)

    step(1, 'TRANSCRIBING')
    setTranscript({ original: text, normalized: null, loading: true })
    await delay(400)

    step(2, 'ANALYZING')
    let res
    try {
      res = await analyzeText(text)
    } catch (err) {
      step(-1, 'ERROR')
      setTranscript({ error: err.message })
      return
    }

    setTranscript({ original: res.original || text, normalized: res.normalized })
    setNlpData(res)

    const conf = Math.round(res.confidence || 55)
    await delay(350)
    step(3, 'VERIFYING')

    if (conf >= 75) {
      setVerify('pending')
    } else if (conf >= 50) {
      setVerify('medium')
      step(4, 'ROUTING')
      setResult(res)
      updateStats(conf)
    } else {
      setVerify('low')
      step(4, 'ESCALATED')
      setResult(res)
      updateStats(conf)
    }
  }, [reset, updateStats])

  const handleConfirmYes = useCallback(() => {
    setVerify('confirmed')
    step(4, 'ROUTING')
    setResult(nlpData)
    updateStats(Math.round(nlpData?.confidence || 80))
    logFeedback({ type: 'confirm_yes', data: nlpData })
  }, [nlpData, updateStats])

  const handleConfirmNo = useCallback(() => {
    setVerify('rejected')
    logFeedback({ type: 'confirm_no', data: nlpData })
    // Stay at verify step — show adaptive question
  }, [nlpData])

  return (
    <div className={styles.root}>
      <Toaster position="top-right" />
      <Header status={pipeline.status} callCount={callCount} />

      <div className={styles.grid}>
        {/* ── LEFT COLUMN ─────────────────────────────── */}
        <div className={styles.left}>
          <CallPanel onAnalyze={runAnalysis} loading={pipeline.step > 0 && pipeline.step < 4 && pipeline.status !== 'ROUTING'} />
          <PipelineBar activeStep={pipeline.step} />
          <TranscriptBox data={transcript} />
          {nlpData && <NLPResults data={nlpData} />}
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────── */}
        <div className={styles.right}>
          {nlpData && (
            <VerifyLoop
              data={nlpData}
              verifyState={verifyState}
              onYes={handleConfirmYes}
              onNo={handleConfirmNo}
            />
          )}
          {result && <RoutingCard data={result} />}
          {result && <SummaryCard data={result} onNewCall={reset} />}
          <StatsRow stats={stats} />
        </div>
      </div>
    </div>
  )
}
