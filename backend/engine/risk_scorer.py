SEVERITY_WEIGHTS = {
    "CRITICAL": 40,
    "HIGH":     25,
    "MEDIUM":   10,
    "LOW":       3,
    "INFO":      0,
}

def count_by_severity(findings: list) -> dict:
    counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
    for f in findings:
        sev = (f.get("severity") or "INFO").upper()
        counts[sev] = counts.get(sev, 0) + 1
    return counts

def calculate_score(findings: list) -> dict:
    if not findings:
        return {
            "score":     100,
            "grade":     "A",
            "label":     "Secure",
            "color":     "#00ff88",
            "breakdown": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
        }

    total_deduction = sum(SEVERITY_WEIGHTS.get((f.get("severity") or "INFO").upper(), 0) for f in findings)
    score = max(0, round(100 - total_deduction))

    return {
        "score":     score,
        "breakdown": count_by_severity(findings),
        **classify_score(score),
    }

def classify_score(score: int) -> dict:
    if score >= 90: return {"grade": "A", "label": "Secure",        "color": "#00ff88"}
    if score >= 75: return {"grade": "B", "label": "Low Risk",      "color": "#88ff00"}
    if score >= 60: return {"grade": "C", "label": "Moderate Risk", "color": "#ffaa00"}
    if score >= 40: return {"grade": "D", "label": "High Risk",     "color": "#ff6600"}
    return                  {"grade": "F", "label": "Critical Risk", "color": "#ff0000"}