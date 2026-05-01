"""
BENZO Department Ontology
==========================
Maps citizen complaint intents → correct government departments.
Built from Karnataka's Sakala Services, Janaspandana,
and Karnataka Open Data Portal complaint categories.
"""

import logging

log = logging.getLogger("benzo.ontology")


class DepartmentOntology:
    """
    Rule-based complaint router.
    Claude's suggestion is used as a starting point;
    this ontology overrides with deterministic rules when confident.
    """

    # ── Intent → Department map ───────────────────────────────────────────
    INTENT_MAP = {
        "water supply":       "BWSSB",
        "sewage issue":       "BWSSB Sewage",
        "power outage":       "BESCOM",
        "road damage":        "BBMP Roads",
        "garbage collection": "BBMP Solid Waste",
        "street light":       "BBMP Roads",
        "other":              "General",
    }

    # ── Keyword override rules (higher priority than intent map) ──────────
    KEYWORD_OVERRIDES = {
        "BWSSB": [
            "water", "neeru", "paani", "drinking water", "tap", "supply",
            "water board", "bwssb", "pipeline", "water pressure",
        ],
        "BWSSB Sewage": [
            "sewage", "drain", "sewer", "overflow", "gutter", "naala",
            "nalaa", "drainage", "manhole overflow",
        ],
        "BESCOM": [
            "light", "electricity", "power", "current", "bescom", "voltage",
            "electric", "shock", "meter", "transformer", "outage", "blackout",
            "ಕರೆಂಟ್", "बिजली",
        ],
        "BBMP Roads": [
            "pothole", "road", "manhole", "footpath", "pavement", "raste",
            "sadak", "crater", "road damage", "signal", "traffic",
            "street light", "lamp post",
        ],
        "BBMP Solid Waste": [
            "garbage", "trash", "waste", "dustbin", "stench", "smell",
            "kurubha", "kachara", "kachra", "solid waste", "dumping",
        ],
    }

    # ── Department metadata ───────────────────────────────────────────────
    DEPT_INFO = {
        "BWSSB": {
            "full_name":    "Bangalore Water Supply and Sewerage Board",
            "code":         "BWSSB-WS",
            "sla_hours":    48,
            "helpline":     "1916",
            "icon":         "water",
        },
        "BWSSB Sewage": {
            "full_name":    "Bangalore Water Supply and Sewerage Board — Sewage Division",
            "code":         "BWSSB-SG",
            "sla_hours":    24,
            "helpline":     "1916",
            "icon":         "sewage",
        },
        "BESCOM": {
            "full_name":    "Bangalore Electricity Supply Company",
            "code":         "BESCOM-PE",
            "sla_hours":    4,
            "helpline":     "1912",
            "icon":         "power",
        },
        "BBMP Roads": {
            "full_name":    "Bruhat Bengaluru Mahanagara Palike — Roads Division",
            "code":         "BBMP-RD",
            "sla_hours":    72,
            "helpline":     "080-22660000",
            "icon":         "roads",
        },
        "BBMP Solid Waste": {
            "full_name":    "Bruhat Bengaluru Mahanagara Palike — Solid Waste Management",
            "code":         "BBMP-SW",
            "sla_hours":    24,
            "helpline":     "080-22660000",
            "icon":         "garbage",
        },
        "General": {
            "full_name":    "General Helpline — 1092",
            "code":         "GEN-CMP",
            "sla_hours":    72,
            "helpline":     "1092",
            "icon":         "general",
        },
    }

    # ── Public API ────────────────────────────────────────────────────────

    def route(self, intent: str, result: dict) -> str:
        """
        Returns the best-matched department name.
        Priority: keyword override > intent map > Claude's suggestion > General
        """
        text = " ".join([
            result.get("original",   ""),
            result.get("normalized", ""),
        ]).lower()

        # 1. Keyword override (most reliable for short multilingual text)
        for dept, keywords in self.KEYWORD_OVERRIDES.items():
            if any(kw in text for kw in keywords):
                log.debug(f"Keyword override → {dept}")
                return dept

        # 2. Intent map
        if intent in self.INTENT_MAP:
            log.debug(f"Intent map → {self.INTENT_MAP[intent]}")
            return self.INTENT_MAP[intent]

        # 3. Claude's suggestion (already in result.department)
        claude_dept = result.get("department", "General")
        if claude_dept in self.DEPT_INFO:
            return claude_dept

        return "General"

    def get_info(self, dept: str) -> dict:
        return self.DEPT_INFO.get(dept, self.DEPT_INFO["General"])

    def get_all_departments(self) -> list:
        return [
            {"name": k, **v}
            for k, v in self.DEPT_INFO.items()
        ]
