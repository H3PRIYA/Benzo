"""
BENZO Call Logger
==================
Persists every analyzed call and feedback event to JSON-Lines files.
These logs drive the continuous learning / accuracy improvement loop.
"""

import os
import json
import time
import logging
from datetime import datetime, date
from pathlib  import Path

log = logging.getLogger("benzo.logger")


class CallLogger:

    def __init__(self, log_dir: str = "logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self._session_stats = {
            "calls_total":     0,
            "calls_confirmed": 0,
            "calls_rejected":  0,
            "calls_escalated": 0,
            "avg_confidence":  0.0,
            "_conf_sum":       0,
        }

    # ── Call Recording ────────────────────────────────────────────────────

    def record(self, original_text: str, result: dict) -> None:
        entry = {
            "timestamp":   datetime.utcnow().isoformat() + "Z",
            "original":    original_text,
            "intent":      result.get("intent"),
            "department":  result.get("department"),
            "confidence":  result.get("confidence"),
            "sentiment":   result.get("sentiment"),
            "priority":    result.get("priority"),
            "language":    result.get("language_detected"),
            "location":    result.get("entities", {}).get("location"),
            "duration":    result.get("entities", {}).get("duration"),
        }
        self._write("calls", entry)
        self._update_stats(result.get("confidence", 55))

    # ── Feedback Recording ────────────────────────────────────────────────

    def record_feedback(self, payload: dict) -> None:
        entry = {
            "timestamp":  datetime.utcnow().isoformat() + "Z",
            "type":       payload.get("type"),
            "correction": payload.get("correction"),
            "original":   payload.get("data", {}).get("original"),
            "intent":     payload.get("data", {}).get("intent"),
            "department": payload.get("data", {}).get("department"),
            "confidence": payload.get("data", {}).get("confidence"),
        }
        self._write("feedback", entry)

        # Update session stats
        t = payload.get("type", "")
        if   t == "confirm_yes": self._session_stats["calls_confirmed"] += 1
        elif t == "confirm_no":  self._session_stats["calls_rejected"]  += 1
        elif t == "escalated":   self._session_stats["calls_escalated"] += 1

    # ── Stats ─────────────────────────────────────────────────────────────

    def get_stats(self) -> dict:
        s = self._session_stats
        total = s["calls_total"] or 1
        return {
            "calls_total":        s["calls_total"],
            "calls_confirmed":    s["calls_confirmed"],
            "calls_rejected":     s["calls_rejected"],
            "calls_escalated":    s["calls_escalated"],
            "avg_confidence":     round(s["_conf_sum"] / total, 1),
            "accuracy_proxy":     round(s["calls_confirmed"] / total * 100, 1)
                                  if s["calls_confirmed"] else 0,
        }

    # ── Internal ──────────────────────────────────────────────────────────

    def _write(self, file_prefix: str, entry: dict) -> None:
        today   = date.today().isoformat()
        path    = self.log_dir / f"{file_prefix}_{today}.jsonl"
        try:
            with open(path, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except Exception as e:
            log.warning(f"Log write failed: {e}")

    def _update_stats(self, confidence: int) -> None:
        s = self._session_stats
        s["calls_total"] += 1
        s["_conf_sum"]   += confidence
        s["avg_confidence"] = round(s["_conf_sum"] / s["calls_total"], 1)
