from scanner.semgrep_runner import run_semgrep_scan

vulnerable_code = """
import subprocess
user_input = input("Enter command: ")
subprocess.run(user_input, shell=True)
"""

result = run_semgrep_scan(vulnerable_code, "python")

print(f"Found {result['total']} vulnerabilities")

for f in result["findings"]:
    print(f"[{f['severity']}] {f['rule_id']} at line {f['line_start']}")