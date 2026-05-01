import axios from 'axios'

// In dev, Vite proxies /api → http://localhost:5000
// In production, set VITE_API_URL in .env
const BASE = import.meta.env.VITE_API_URL || ''

export async function analyzeText(text) {
  const { data } = await axios.post(`${BASE}/api/analyze`, { text })
  return data
}

export async function logFeedback(payload) {
  try {
    await axios.post(`${BASE}/api/feedback`, payload)
  } catch (_) {
    // Non-critical — don't throw
  }
}

export async function getStats() {
  const { data } = await axios.get(`${BASE}/api/stats`)
  return data
}
