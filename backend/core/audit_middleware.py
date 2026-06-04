import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from db.database import SessionLocal
from models.security import AuditLog

logger = logging.getLogger(__name__)

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Log mutating actions for compliance
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            try:
                ip_address = request.client.host if request.client else "unknown"
                resource = request.url.path
                
                db = SessionLocal()
                audit = AuditLog(
                    action=request.method,
                    resource=resource,
                    ip_address=ip_address
                )
                db.add(audit)
                db.commit()
                db.close()
            except Exception as e:
                logger.error(f"Failed to write audit log: {e}")
                
        return response
