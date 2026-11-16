from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json

from database import get_db, ScanRecord
from scanner.semgrep_runner import run_semgrep_scan
from scanner.language_detector import detect_from_extension
from engine.risk_scorer import calculate_score
from ai.gemini_client import analyze_findings
from reports.pdf_generator import generate_pdf

app = FastAPI(title="SecureVision API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "SecureVision"
    }


@app.post("/api/scan")
async def scan_code(file: UploadFile = File(...), db: Session = Depends(get_db)):

    content = await file.read()
    code = content.decode("utf-8", errors="ignore")

    language = detect_from_extension(file.filename)

    scan_result = run_semgrep_scan(code, language)

    if "error" in scan_result and not scan_result["findings"]:
        raise HTTPException(
            status_code=500,
            detail=scan_result["error"]
        )

    findings = scan_result["findings"]

    score_data = calculate_score(findings)

    record = ScanRecord(
        filename=file.filename,
        language=language,
        total_findings=len(findings),
        critical_count=score_data["breakdown"].get("CRITICAL", 0),
        high_count=score_data["breakdown"].get("HIGH", 0),
        medium_count=score_data["breakdown"].get("MEDIUM", 0),
        low_count=score_data["breakdown"].get("LOW", 0),
        security_score=score_data["score"],
        risk_level=score_data["label"],
        findings_json=json.dumps(findings),
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "scan_id": record.id,
        "filename": file.filename,
        "language": language,
        "findings": findings,
        "score": score_data,
    }


@app.post("/api/analyze/{scan_id}")
async def ai_analyze(scan_id: int, db: Session = Depends(get_db)):

    record = db.query(ScanRecord).filter(
        ScanRecord.id == scan_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Scan not found"
        )

    findings = json.loads(record.findings_json)

    analysis = await analyze_findings(
        findings,
        record.language
    )

    return {
        "scan_id": scan_id,
        "analysis": analysis
    }


@app.get("/api/report/{scan_id}")
async def get_report(scan_id: int, db: Session = Depends(get_db)):

    record = db.query(ScanRecord).filter(
        ScanRecord.id == scan_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Scan not found"
        )

    findings = json.loads(record.findings_json)

    scan_data = {
        "filename": record.filename,
        "language": record.language,
        "security_score": record.security_score,
        "risk_level": record.risk_level,
        "findings": findings,
    }

    ai_analysis = await analyze_findings(
        findings,
        record.language
    )

    pdf_buffer = generate_pdf(
        scan_data,
        ai_analysis
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=SecureVision_Report_{scan_id}.pdf"
        },
    )


@app.get("/api/history")
def get_history(db: Session = Depends(get_db)):

    records = db.query(ScanRecord).order_by(
        ScanRecord.created_at.desc()
    ).limit(50).all()

    return [
        {
            "id": r.id,
            "filename": r.filename,
            "language": r.language,
            "total_findings": r.total_findings,
            "security_score": r.security_score,
            "risk_level": r.risk_level,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]


@app.get("/api/scan/{scan_id}")
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")

    findings  = json.loads(record.findings_json)
    breakdown = {
        "CRITICAL": record.critical_count,
        "HIGH":     record.high_count,
        "MEDIUM":   record.medium_count,
        "LOW":      record.low_count,
        "INFO":     0,
    }

    return {
        "id":             record.id,
        "scan_id":        record.id,
        "filename":       record.filename,
        "language":       record.language,
        "findings":       findings,
        "security_score": record.security_score,
        "risk_level":     record.risk_level,
        "score": {
            "score":     record.security_score,
            "label":     record.risk_level,
            "breakdown": breakdown,
        },
        "created_at": record.created_at.isoformat(),
    }