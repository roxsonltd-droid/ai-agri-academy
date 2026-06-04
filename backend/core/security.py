from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Using a simple hardcoded secret for local dev
# In production, this should be generated with `openssl rand -hex 32` and stored in .env
SECRET_KEY = "super-secret-local-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

from fastapi import HTTPException, status, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from models.user import User
from db.database import get_db
from sqlalchemy.orm import Session

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for this role"
            )
        return user

api_key_header_auth = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_api_key(
    api_key_header: str = Security(api_key_header_auth),
    db: Session = Depends(get_db)
):
    from models.security import ApiKey
    if not api_key_header:
        raise HTTPException(status_code=403, detail="API Key missing")
        
    # In production, compare hashes. Here we assume direct match for demonstration.
    key_record = db.query(ApiKey).filter(ApiKey.hashed_key == api_key_header).first()
    if not key_record:
        raise HTTPException(status_code=403, detail="Invalid API Key")
        
    return key_record

