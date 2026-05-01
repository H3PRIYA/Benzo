export const SCENARIOS = [
  { lang: 'Kannada + English', text: 'Namma area-alli neeru bartha illa 3 days from Rajajinagar' },
  { lang: 'Hindi',             text: 'Hamare ghar mein 2 din se light nahi hai, Yeshwanthpur mein' },
  { lang: 'English',           text: 'Broken manhole near Indiranagar 100ft road, very dangerous for pedestrians' },
  { lang: 'Mixed — unclear',   text: 'Garbage... namma street... collect maadilla... stench very bad, health problem aagtha ide' },
]

export const DEPT_META = {
  'BWSSB':            { icon: '💧', code: 'BWSSB-WS',  sla: 'SLA: 48 hrs',  color: '#185FA5', bg: '#E6F1FB' },
  'BESCOM':           { icon: '⚡', code: 'BESCOM-PE', sla: 'SLA: 4 hrs',   color: '#BA7517', bg: '#FAEEDA' },
  'BBMP Roads':       { icon: '🛣',  code: 'BBMP-RD',   sla: 'SLA: 72 hrs', color: '#3B6D11', bg: '#EAF3DE' },
  'BBMP Solid Waste': { icon: '🗑',  code: 'BBMP-SW',   sla: 'SLA: 24 hrs', color: '#5F5E5A', bg: '#F1EFE8' },
  'BWSSB Sewage':     { icon: '🔧', code: 'BWSSB-SG',  sla: 'SLA: 24 hrs', color: '#993C1D', bg: '#FAECE7' },
  'General':          { icon: '📋', code: 'GEN-CMP',   sla: 'SLA: 72 hrs', color: '#888780', bg: '#F1EFE8' },
}

export const SENTIMENT_COLORS = {
  calm:       { text: '#1D9E75', dot: '#1D9E75' },
  concerned:  { text: '#185FA5', dot: '#185FA5' },
  urgent:     { text: '#BA7517', dot: '#BA7517' },
  distressed: { text: '#A32D2D', dot: '#A32D2D' },
}
