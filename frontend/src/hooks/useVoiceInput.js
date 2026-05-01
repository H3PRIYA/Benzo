import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * useVoiceInput — Web Speech API hook
 *
 * Returns:
 *   isRecording  boolean
 *   isSupported  boolean
 *   interimText  string  (live partial result while speaking)
 *   startRecording(onFinalText)  — starts mic, calls onFinalText(string) on each final segment
 *   stopRecording()
 *   error        string | null
 */
export function useVoiceInput() {
  const [isRecording, setIsRecording]   = useState(false)
  const [interimText, setInterimText]   = useState('')
  const [error, setError]               = useState(null)
  const recognitionRef                  = useRef(null)
  const onFinalRef                      = useRef(null)
  const accumulatedRef                  = useRef('')   // accumulates final segments

  const isSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  const buildRecognition = useCallback((selectedLang = 'en-IN') => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return null

    const rec = new SR()
    rec.continuous      = true     // keep listening until manually stopped
    rec.interimResults  = true     // get partial results in real time
    rec.maxAlternatives = 1
    // Use caller-selected language to avoid forced Kannada transcription.
    rec.lang = selectedLang || 'en-IN'

    rec.onstart = () => {
      setIsRecording(true)
      setError(null)
      accumulatedRef.current = ''
    }

    rec.onresult = (event) => {
      let interim = ''
      let newFinal = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          newFinal += t + ' '
        } else {
          interim += t
        }
      }

      if (newFinal) {
        accumulatedRef.current += newFinal
        // Push accumulated + any ongoing interim to the text box
        if (onFinalRef.current) {
          onFinalRef.current(accumulatedRef.current.trim())
        }
      }
      // Show interim live
      setInterimText(accumulatedRef.current + interim)
    }

    rec.onerror = (e) => {
      const msg =
        e.error === 'not-allowed'    ? 'Microphone access denied. Please allow mic in browser settings.' :
        e.error === 'network'        ? 'Network error during speech recognition.' :
        e.error === 'no-speech'      ? 'No speech detected. Try speaking louder.' :
        e.error === 'audio-capture'  ? 'No microphone found.' :
                                       `Speech error: ${e.error}`
      setError(msg)
      setIsRecording(false)
      setInterimText('')
    }

    rec.onend = () => {
      setIsRecording(false)
      setInterimText('')
    }

    return rec
  }, [])

  const startRecording = useCallback((onFinalText, selectedLang = 'en-IN') => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Use Chrome or Edge.')
      return
    }
    // Store callback ref
    onFinalRef.current = onFinalText

    // Stop any existing session
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
    }

    const rec = buildRecognition(selectedLang)
    if (!rec) return
    recognitionRef.current = rec

    try {
      rec.start()
    } catch (e) {
      setError('Could not start microphone: ' + e.message)
    }
  }, [isSupported, buildRecognition])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
    }
    setIsRecording(false)
    setInterimText('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch (_) {}
      }
    }
  }, [])

  return { isRecording, isSupported, interimText, startRecording, stopRecording, error }
}
