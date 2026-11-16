import subprocess
import json
import tempfile
import os
from .language_detector import get_file_extension

SEVERITY_MAP = {
    "ERROR":    "HIGH",
    "WARNING":  "MEDIUM",
    "INFO":     "LOW",
    "HIGH":     "HIGH",
    "MEDIUM":   "MEDIUM",
    "LOW":      "LOW",
    "CRITICAL": "CRITICAL",
}

def run_semgrep_scan(code: str, language: str) -> dict:
    ext = get_file_extension(language)
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = os.path.join(tmpdir, f"scan{ext}")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(code)
        result = subprocess.run(
            ["semgrep", "--config=auto", "--json", "--quiet", filepath],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            timeout=120
        )
        try:
            raw = json.loads(result.stdout)
        except:
            return {"total": 0, "findings": [], "error": result.stderr}
        return parse_findings(raw)

def parse_findings(raw: dict) -> dict:
    findings = []
    for result in raw.get("results", []):
        extra    = result.get("extra", {})
        metadata = extra.get("metadata", {})

        raw_sev  = (extra.get("severity") or "INFO").upper()
        severity = SEVERITY_MAP.get(raw_sev, "MEDIUM")

        cwe_raw   = metadata.get("cwe",   [])
        owasp_raw = metadata.get("owasp", [])

        cwe_display   = cwe_raw[0]   if isinstance(cwe_raw, list)   and cwe_raw   else (cwe_raw   or "Not mapped")
        owasp_display = owasp_raw[0] if isinstance(owasp_raw, list) and owasp_raw else (owasp_raw or "Not mapped")

        findings.append({
            "rule_id":      result.get("check_id", "unknown"),
            "severity":     severity,
            "message":      extra.get("message", ""),
            "file":         os.path.basename(result.get("path", "")),
            "path":         os.path.basename(result.get("path", "")),
            "line":         result.get("start", {}).get("line", 0),
            "line_start":   result.get("start", {}).get("line", 0),
            "line_end":     result.get("end",   {}).get("line", 0),
            "code_snippet": extra.get("lines", ""),
            "cwe":          cwe_raw,
            "owasp":        owasp_raw,
            "cwe_display":  cwe_display,
            "owasp_display":owasp_display,
            "confidence":   metadata.get("confidence", "MEDIUM"),
        })

    return {"total": len(findings), "findings": findings}