"""
BENZO Backend — Flask API Server (Groq Edition)
"""

import os
import time
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from nlp.analyzer import BenzoAnalyzer
from nlp.ontology  import DepartmentOntology
from utils.logger  import CallLogger

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
log = logging.getLogger("benzo.server")

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:5500", "*"])

analyzer  = BenzoAnalyzer(api_key=os.getenv("GROQ_API_KEY"))
ontology  = DepartmentOntology()
call_log  = CallLogger(log_dir="logs")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "BENZO", "version": "1.0.0"})

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(force=True, silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text field is required"}), 400
    log.info(f"Analyzing: {text[:80]}...")
    t0 = time.time()
    try:
        result = analyzer.analyze(text)
        result["department"] = ontology.route(result.get("intent", ""), result)
        result["processing_ms"] = round((time.time() - t0) * 1000)
        call_log.record(text, result)
        log.info(f"Done — intent={result.get('intent')} dept={result.get('department')} conf={result.get('confidence')} ({result['processing_ms']}ms)")
        return jsonify(result)
    except Exception as e:
        log.exception("Analysis failed")
        return jsonify({"error": str(e)}), 500

@app.route("/api/feedback", methods=["POST"])
def feedback():
    data = request.get_json(force=True, silent=True) or {}
    call_log.record_feedback(data)
    return jsonify({"status": "logged"})

@app.route("/api/stats", methods=["GET"])
def stats():
    return jsonify(call_log.get_stats())

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    log.info(f"BENZO backend starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)