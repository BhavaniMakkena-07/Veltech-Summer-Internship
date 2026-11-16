import json
import os
import time
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Tries each model in order until one works
MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

LANGUAGE_CONTEXT = {
    "python":     "Use Python. Show fixes using subprocess with shell=False, parameterized queries with psycopg2/SQLAlchemy.",
    "javascript": "Use JavaScript/Node.js. Show fixes with prepared statements (pg/mysql2), input sanitization.",
    "java":       "Use Java. Show fixes with PreparedStatement or parameterized JPA queries.",
    "go":         "Use Go. Show fixes with database/sql parameterized queries.",
    "php":        "Use PHP. Show fixes with PDO prepared statements.",
    "default":    "Use secure coding best practices for the detected language.",
}

def build_prompt(finding: dict, language: str) -> str:
    lang_ctx = LANGUAGE_CONTEXT.get(language, LANGUAGE_CONTEXT["default"])
    return f"""You are a senior application security engineer specializing in {language}.
{lang_ctx}

Analyze this SAST vulnerability and respond ONLY with a valid JSON object.
No explanation, no markdown, no text outside the JSON. No code fences.

Finding:
{json.dumps(finding, indent=2)}

Return EXACTLY this JSON structure:
{{
  "vulnerability_name": "short name like OS Command Injection",
  "plain_english_explanation": "2-3 sentences explaining what this means to a developer",
  "root_cause": "one paragraph on why this code is dangerous",
  "business_impact": "2-3 sentences on what could happen if exploited",
  "remediation_steps": [
    "Step 1 as a plain sentence",
    "Step 2 as a plain sentence",
    "Step 3 as a plain sentence"
  ],
  "best_practices": [
    "Best practice 1",
    "Best practice 2",
    "Best practice 3"
  ],
  "secure_code_example": "# Complete corrected {language} code here",
  "cwe_id": "CWE-78",
  "owasp_category": "A03:2021 - Injection",
  "estimated_fix_time": "15 minutes"
}}"""

def clean_json(text: str) -> str:
    text = text.strip()
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                return part
    return text

def try_generate(prompt: str) -> str:
    last_error = ""
    for model in MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
            )
            return response.text
        except Exception as e:
            last_error = str(e)
            if "429" in last_error or "RESOURCE_EXHAUSTED" in last_error:
                # Quota hit on this model, try next
                continue
            # Other error — raise immediately
            raise
    raise Exception(f"All models exhausted. Last error: {last_error}")

async def analyze_single(finding: dict, language: str) -> dict:
    prompt = build_prompt(finding, language)
    try:
        text   = try_generate(prompt)
        text   = clean_json(text)
        return json.loads(text)
    except json.JSONDecodeError as e:
        return _fallback(finding, f"JSON parse error: {e}")
    except Exception as e:
        return _fallback(finding, str(e))

async def analyze_findings(findings: list, language: str) -> list:
    results = []
    for finding in findings:
        analysis = await analyze_single(finding, language)
        results.append({"finding": finding, "analysis": analysis})
    return results

def _fallback(finding: dict, error: str) -> dict:
    return {
        "vulnerability_name":        finding.get("rule_id", "Unknown"),
        "plain_english_explanation":  f"AI temporarily unavailable: {error}",
        "root_cause":                finding.get("message", ""),
        "business_impact":           "",
        "remediation_steps":         ["Wait for API quota to reset, then retry."],
        "best_practices":            [],
        "secure_code_example":       "",
        "cwe_id":                    finding.get("cwe_display", ""),
        "owasp_category":            finding.get("owasp_display", ""),
        "estimated_fix_time":        "",
    }