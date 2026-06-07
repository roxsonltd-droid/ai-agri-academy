import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ApiKey(Base):
    """
    API Keys for programmatic access (e.g. IoT devices, external software).
    """
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    hashed_key = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    """
    Audit Logs to track who did what.
    """
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(Integer, nullable=True)  # Nullable if unauthenticated
    action = Column(String, index=True)       # POST, PUT, DELETE, etc.
    resource = Column(String, index=True)     # The URL path or resource name
    ip_address = Column(String, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
