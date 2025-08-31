from fastapi import Depends, HTTPException, status, Header
from backend.utils import decode_token
from backend.database import db
from bson import ObjectId
from typing import Optional

async def get_current_user(authorization: Optional[str] = Header(None)):
    print(f"Authorization header received: {authorization}")
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )
    
    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        print(f"Scheme: {scheme}, Token: {token[:20]}...")
        
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    
    payload = decode_token(token)
    print(f"Decoded payload: {payload}")
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = await db.users.find_one({"_id": ObjectId(payload.get("sub"))})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
