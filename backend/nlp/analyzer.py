import re
import json
import logging
from groq import Groq

log = logging.getLogger("benzo.analyzer")

class BenzoAnalyzer:

    MODEL = "llama-3.3-70b-versatile"

    INTENT_KEYWORDS = {
        "water supply":       ["water", "neeru", "paani", "tap", "supply", "drinking"],
        "power outage":       ["light", "electricity", "power", "current", "bescom", "voltage", "bijli"],
        "road damage":        ["road", "pothole", "manhole", "crater", "footpath", "raste", "sadak"],
        "garbage collection": ["garbage", "trash", "waste", "dustbin", "stench", "smell", "kachara"],
        "sewage issue":       ["sewage", "drain", "overflow", "sewer", "gutter", "naala"],
        "street light":       ["street light", "lamp", "signal"],
    }

    LOCATION_PATTERNS = [
        r"\b(Rajajinagar|Yeshwanthpur|Indiranagar|Koramangala|Whitefield|Jayanagar|Banashankari|Vijayanagar|Hebbal|Marathahalli|BTM Layout|HSR Layout|JP Nagar|Malleswaram|Basavanagudi)\b",
    ]

    DURATION_PATTERNS = [
        r"(\d+\s*(?:day|days|din|hour|hours|hr|hrs|week|weeks|month|months)s?)",
        r"(since\s+(?:yesterday|morning|last\s+\w+))",
        r"(past\s+\d+\s+\w+)",
    ]

    SENTIMENT_WORDS = {
        "distressed": ["dangerous", "emergency", "urgent", "critical", "accident", "very bad"],
        "urgent":     ["please help", "need help", "children", "sick", "no water", "no power"],
        "concerned":  ["problem", "issue", "complaint", "not working", "broken"],
    }

    def __init__(self, api_key):
        if not api_key:
            raise ValueError("GROQ_API_KEY not set in environment. Check your .env file.")
        self.client = Groq(api_key=api_key)

    def analyze(self, text):
        heuristic = self._heuristic_pass(text)
        groq_result = self._groq_pass(text, heuristic)
        merged = self._merge(heuristic, groq_result)
        return self._validate(merged, text)

    def _heuristic_pass(self, text):
        lower = text.lower()
        has_kannada = any(w in lower for w in ["namma", "alli", "illa", "bartha", "maadilla", "aagtha", "ide"])
        has_hindi   = any(w in lower for w in ["hamare", "mein", "nahi", "din", "ghar", "bahut"])
        has_tamil   = any(w in lower for w in ["enga", "illa", "irukku", "venum", "romba", "thanni", "theru"])
        has_english = bool(re.search(r"[a-zA-Z]{3,}", text))

        if (has_kannada or has_hindi or has_tamil) and has_english: lang = "mixed"
        elif has_kannada:                 lang = "kannada"
        elif has_hindi:                   lang = "hindi"
        elif has_tamil:                   lang = "tamil"
        else:                             lang = "english"

        intent = "other"
        for intent_name, keywords in self.INTENT_KEYWORDS.items():
            if any(k in lower for k in keywords):
                intent = intent_name
                break

        location = None
        for pattern in self.LOCATION_PATTERNS:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                location = m.group(1)
                break

        duration = None
        for pattern in self.DURATION_PATTERNS:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                duration = m.group(1)
                break

        sentiment = "calm"
        for level in ["distressed", "urgent", "concerned"]:
            if any(w in lower for w in self.SENTIMENT_WORDS.get(level, [])):
                sentiment = level
                break

        return {
            "language_detected": lang,
            "intent": intent,
            "entities": {"location": location, "duration": duration, "service_type": intent},
            "sentiment": sentiment
        }

    def _groq_pass(self, text, hint):
        ents = hint.get("entities", {})
        loc = ents.get("location")
        prompt = (
            "You are BENZO, the NLP layer for Karnataka 1092 helpline.\n"
            "Analyze this citizen complaint (may be Kannada, Hindi, Tamil, English, or mixed).\n\n"
            "Input: \"" + text + "\"\n\n"
            "Hints: language=" + str(hint.get("language_detected")) +
            ", intent=" + str(hint.get("intent")) +
            ", location=" + str(loc) +
            ", sentiment=" + str(hint.get("sentiment")) + "\n\n"
            "Return ONLY valid JSON, no markdown:\n"
            "{\n"
            '  "original": "' + text.replace('"', "'") + '",\n'
            '  "normalized": "<English translation>",\n'
            '  "language_detected": "<kannada|hindi|tamil|english|mixed>",\n'
            '  "intent": "<water supply|power outage|road damage|garbage collection|sewage issue|street light|other>",\n'
            '  "entities": {"location": "<or null>", "duration": "<or null>", "service_type": "<service>"},\n'
            '  "sentiment": "<calm|concerned|urgent|distressed>",\n'
            '  "confidence": <integer 45-95>,\n'
            '  "priority": "<low|medium|high|critical>",\n'
            '  "department": "<BWSSB|BESCOM|BBMP Roads|BBMP Solid Waste|BWSSB Sewage|General>",\n'
            '  "verification_question": "<confirmation question>",\n'
            '  "adaptive_question": "<clarification question>",\n'
            '  "summary": {"issue": "<desc>", "location": "<loc>", "duration": "<dur>", "department": "<dept>", "sentiment": "<sent>", "priority": "<pri>", "action": "<action>"}\n'
            "}"
        )

        try:
            response = self.client.chat.completions.create(
                model=self.MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1000,
            )
            raw = response.choices[0].message.content.strip()
            raw = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(raw)
        except json.JSONDecodeError as e:
            log.warning("Groq JSON parse error: %s — using heuristic only", e)
            return {}
        except Exception as e:
            log.error("Groq API error: %s", e)
            return {}

    def _merge(self, heuristic, groq):
        if not groq:
            groq = {}
        h_ents = heuristic.get("entities", {})
        g_ents = groq.get("entities", {})
        entities = {
            "location":     g_ents.get("location")     or h_ents.get("location"),
            "duration":     g_ents.get("duration")     or h_ents.get("duration"),
            "service_type": g_ents.get("service_type") or h_ents.get("service_type"),
        }
        return {
            "original":              groq.get("original", ""),
            "normalized":            groq.get("normalized", ""),
            "language_detected":     groq.get("language_detected", heuristic.get("language_detected", "unknown")),
            "intent":                groq.get("intent",    heuristic.get("intent", "other")),
            "entities":              entities,
            "sentiment":             groq.get("sentiment", heuristic.get("sentiment", "calm")),
            "confidence":            groq.get("confidence", 55),
            "priority":              groq.get("priority",   "medium"),
            "department":            groq.get("department", "General"),
            "verification_question": groq.get("verification_question", "Is this understanding correct?"),
            "adaptive_question":     groq.get("adaptive_question", "Could you clarify your location and the problem?"),
            "summary":               groq.get("summary", {}),
        }

    def _validate(self, result, original_text):
        result["confidence"] = max(40, min(97, int(result.get("confidence", 55))))
        if not result.get("original"):
            result["original"] = original_text
        valid_intents    = {"water supply","power outage","road damage","garbage collection","sewage issue","street light","other"}
        valid_languages  = {"kannada","hindi","tamil","english","mixed"}
        valid_sentiments = {"calm","concerned","urgent","distressed"}
        valid_priorities = {"low","medium","high","critical"}
        valid_depts      = {"BWSSB","BESCOM","BBMP Roads","BBMP Solid Waste","BWSSB Sewage","General"}
        if result.get("intent")     not in valid_intents:    result["intent"]     = "other"
        if result.get("language_detected") not in valid_languages: result["language_detected"] = "english"
        if result.get("sentiment")  not in valid_sentiments: result["sentiment"]  = "calm"
        if result.get("priority")   not in valid_priorities: result["priority"]   = "medium"
        if result.get("department") not in valid_depts:      result["department"] = "General"
        if result["sentiment"] == "distressed" and result["priority"] == "low":
            result["priority"] = "high"
        return result
