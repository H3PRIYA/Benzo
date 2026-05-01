# BENZO — 1092 AI Intelligence Layer

> Real-time multilingual understanding and verification system for Karnataka's 1092 citizen helpline.
> Voice → Understanding → Verification → Action.

---

### Step 1 — Get your Groq API Key

---

### Step 2 — Set up the Backend (Python)

```bash
# Navigate to backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file from the example
cp .env.example .env
```

Now open `backend/.env` in any text editor and paste your API key:

```
GROQ_API_KEY=gsk-your-actual-key-here
PORT=5000
FLASK_DEBUG=false
```

Start the backend:

```bash
python app.py
# You should see: BENZO backend starting on port 5000
```

---

### Step 3 — Set up the Frontend (React)

Open a **new terminal** (keep backend running):

```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
# Opens at http://localhost:3000
```

That's it! Open **http://localhost:3000** in **Chrome or Edge** (required for voice input).

---

## 🎙 Using Voice Input

1. Click the **microphone button** next to the text box
2. Allow microphone access when Chrome asks
3. Speak your complaint in **Kannada, Hindi, or English**
4. Your words appear in the text box in real time
5. Click **Stop** (the square icon) when done, then click **Analyze Call**

> Voice input works best in **Chrome** or **Edge**. Firefox and Safari have limited support for the Web Speech API.

---

## 🏗 Project Structure

```
benzo/
├── backend/                    ← Python Flask API
│   ├── app.py                  ← Main server + routes
│   ├── requirements.txt
│   ├── .env.example            ← Copy to .env, add API key
│   ├── nlp/
│   │   ├── analyzer.py         ← BenzoAnalyzer (heuristics + Groq)
│   │   └── ontology.py         ← Department routing rules
│   └── utils/
│       └── logger.py           ← Call + feedback logger
│
└── frontend/                   ← React + Vite
    ├── index.html
    ├── vite.config.js          ← Proxies /api → backend
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx             ← Root: state + flow controller
        ├── index.css           ← Global tokens
        ├── App.module.css
        ├── components/
        │   ├── Header.jsx/.module.css
        │   ├── CallPanel.jsx/.module.css     ← Input + voice
        │   ├── PipelineBar.jsx/.module.css   ← Animated steps
        │   ├── TranscriptBox.jsx/.module.css
        │   ├── NLPResults.jsx/.module.css    ← Intent, entities, sentiment
        │   ├── VerifyLoop.jsx/.module.css    ← Core differentiator
        │   ├── RoutingCard.jsx/.module.css
        │   ├── SummaryCard.jsx/.module.css
        │   └── StatsRow.jsx/.module.css
        ├── hooks/
        │   └── useVoiceInput.js              ← Web Speech API hook
        └── utils/
            ├── api.js                        ← Axios calls to backend
            └── constants.js                  ← Scenarios, dept metadata
```

---

## 🔄 How It Works

```
Citizen speaks / types
        ↓
[CallPanel] → POST /api/analyze
        ↓
[Backend: BenzoAnalyzer]
  1. Heuristic pass — language detection, regex entities, keyword intent
  2. Groq API — deep semantic NLP (intent, entities, sentiment, confidence)
  3. Merge & validate — best of both, enforce enumerations
  4. DepartmentOntology.route() — deterministic routing overrides
        ↓
[Frontend: App.jsx decision engine]
  Confidence ≥ 75% → Verification Loop (ask citizen to confirm)
  Confidence 50–74% → Adaptive Re-question (smarter clarification)
  Confidence < 50%  → Human Agent Escalation
        ↓
[RoutingCard + SummaryCard]
  Structured complaint record + department assignment
```

---

## 🏛 Department Routing Map

| Complaint Type     | Department         | SLA     |
|--------------------|--------------------|---------|
| Water supply       | BWSSB              | 48 hrs  |
| Power outage       | BESCOM             | 4 hrs   |
| Road damage        | BBMP Roads         | 72 hrs  |
| Garbage collection | BBMP Solid Waste   | 24 hrs  |
| Sewage/drain       | BWSSB Sewage       | 24 hrs  |
| Other              | General (1092)     | 72 hrs  |

---

## 🌐 Backend API

| Method | Endpoint       | Description                   |
|--------|----------------|-------------------------------|
| POST   | /api/analyze   | Full NLP analysis             |
| POST   | /api/feedback  | Log verification outcome      |
| GET    | /api/stats     | Session stats                 |
| GET    | /api/health    | Health check                  |

**Sample request:**
```json
POST /api/analyze
{ "text": "Namma area-alli neeru bartha illa 3 days, Rajajinagar" }
```

**Sample response:**
```json
{
  "original": "Namma area-alli neeru bartha illa 3 days, Rajajinagar",
  "normalized": "Water has not been coming to our area for 3 days in Rajajinagar",
  "language_detected": "mixed",
  "intent": "water supply",
  "entities": { "location": "Rajajinagar", "duration": "3 days", "service_type": "water supply" },
  "sentiment": "concerned",
  "confidence": 84,
  "priority": "medium",
  "department": "BWSSB",
  "verification_question": "You are reporting a water supply issue for 3 days in Rajajinagar, correct?",
  "adaptive_question": "Could you confirm your exact street and whether it is the whole area or just your building?",
  "summary": {
    "issue": "No water supply for 3 days",
    "location": "Rajajinagar",
    "duration": "3 days",
    "department": "BWSSB",
    "sentiment": "concerned",
    "priority": "medium",
    "action": "Raise water supply complaint with BWSSB, assign field team"
  }
}
```

---

## 🛠 Build for Production

**Frontend:**
```bash
cd frontend
npm run build
# Output in frontend/dist/ — deploy to Netlify, Vercel, or serve via Nginx
```

**Backend:**
```bash
cd backend
gunicorn app:app -w 4 -b 0.0.0.0:5000
# Deploy to Render, Railway, or any Python host
```

---

## 📋 Submission Checklist

- [x] Working prototype — `npm run dev` + `python app.py`
- [x] Voice input — microphone → real-time text → analysis
- [x] Multilingual NLP — Kannada, Hindi, English, mixed
- [x] Verification loop — citizen confirms before action
- [x] Adaptive re-questioning — smarter clarification
- [x] Human escalation — low confidence / distressed
- [x] Department routing — BWSSB, BESCOM, BBMP
- [x] Structured complaint record
- [x] Code repository — this folder
- [ ] 5-minute video — record using the working prototype

---

Built for Karnataka's 1092 Helpline Modernization — Team BENZO
