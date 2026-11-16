from engine.risk_scorer import calculate_score

findings = [
    {"severity": "HIGH"},
    {"severity": "MEDIUM"},
    {"severity": "LOW"},
]

result = calculate_score(findings)

print(result)