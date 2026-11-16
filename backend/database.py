# backend/database.py

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

engine = create_engine("sqlite:///./securevision.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class ScanRecord(Base):
    __tablename__ = "scans"
    id            = Column(Integer, primary_key=True, index=True)
    filename      = Column(String)
    language      = Column(String)
    total_findings= Column(Integer)
    critical_count= Column(Integer)
    high_count    = Column(Integer)
    medium_count  = Column(Integer)
    low_count     = Column(Integer)
    security_score= Column(Float)
    risk_level    = Column(String)
    findings_json = Column(Text)   # full findings stored as JSON string
    created_at    = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()