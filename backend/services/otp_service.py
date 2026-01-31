import random
import string
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

class OTPService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.otp_expiry_minutes = 10
        
    def generate_otp(self, length: int = 6) -> str:
        """Generate a random OTP code."""
        return ''.join(random.choices(string.digits, k=length))
    
    async def create_otp(self, identifier: str, purpose: str, identifier_type: str = "email") -> Dict[str, Any]:
        """
        Create and store an OTP for email or phone verification.
        
        Args:
            identifier: Email address or phone number
            purpose: Purpose of OTP (registration, login, verify_email, verify_phone)
            identifier_type: Type of identifier (email or phone)
        """
        otp_code = self.generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=self.otp_expiry_minutes)
        
        otp_document = {
            "identifier": identifier,
            "identifier_type": identifier_type,
            "otp_code": otp_code,
            "purpose": purpose,
            "expires_at": expires_at,
            "created_at": datetime.utcnow(),
            "is_used": False,
            "attempts": 0,
            "max_attempts": 3
        }
        
        # Remove any existing unused OTPs for this identifier and purpose
        await self.db.otps.delete_many({
            "identifier": identifier,
            "purpose": purpose,
            "is_used": False
        })
        
        # Store the new OTP
        await self.db.otps.insert_one(otp_document)
        
        return {
            "otp_code": otp_code,
            "expires_at": expires_at,
            "identifier": identifier,
            "purpose": purpose
        }
    
    async def verify_otp(self, identifier: str, otp_code: str, purpose: str) -> Dict[str, Any]:
        """
        Verify an OTP code.
        
        Args:
            identifier: Email address or phone number
            otp_code: OTP code to verify
            purpose: Purpose of OTP verification
            
        Returns:
            Dict with verification result
        """
        # Find the OTP
        otp_doc = await self.db.otps.find_one({
            "identifier": identifier,
            "purpose": purpose,
            "is_used": False
        })
        
        if not otp_doc:
            return {
                "success": False,
                "error": "OTP not found or already used"
            }
        
        # Check if OTP is expired
        if datetime.utcnow() > otp_doc["expires_at"]:
            await self.db.otps.update_one(
                {"_id": otp_doc["_id"]},
                {"$set": {"is_used": True}}
            )
            return {
                "success": False,
                "error": "OTP has expired"
            }
        
        # Check attempts
        if otp_doc["attempts"] >= otp_doc["max_attempts"]:
            await self.db.otps.update_one(
                {"_id": otp_doc["_id"]},
                {"$set": {"is_used": True}}
            )
            return {
                "success": False,
                "error": "Maximum verification attempts exceeded"
            }
        
        # Verify OTP code
        if otp_doc["otp_code"] != otp_code:
            await self.db.otps.update_one(
                {"_id": otp_doc["_id"]},
                {"$inc": {"attempts": 1}}
            )
            return {
                "success": False,
                "error": "Invalid OTP code"
            }
        
        # Mark OTP as used
        await self.db.otps.update_one(
            {"_id": otp_doc["_id"]},
            {"$set": {"is_used": True, "verified_at": datetime.utcnow()}}
        )
        
        return {
            "success": True,
            "message": "OTP verified successfully"
        }
    
    async def send_email_otp(self, email: str, otp_code: str, purpose: str) -> bool:
        """
        Send OTP via email using the enhanced email service.
        
        Args:
            email: Recipient email address
            otp_code: OTP code to send
            purpose: Purpose of the OTP
            
        Returns:
            Boolean indicating success
        """
        try:
            from services.email_service import email_service
            
            # Send OTP using the enhanced email service
            result = await email_service.send_otp_email(email, otp_code, purpose)
            
            if result['success']:
                logger.info(f"OTP email sent successfully to {email}")
                return True
            else:
                logger.error(f"Failed to send OTP email to {email}: {result.get('error', 'Unknown error')}")
                return False
            
        except Exception as e:
            logger.error(f"Failed to send OTP email: {str(e)}")
            return False
    
    async def send_sms_otp(self, phone: str, otp_code: str, purpose: str) -> bool:
        """
        Send OTP via SMS using the SMS service.
        
        Args:
            phone: Recipient phone number
            otp_code: OTP code to send
            purpose: Purpose of the OTP
            
        Returns:
            Boolean indicating success
        """
        try:
            from services.sms_service import sms_service
            
            purpose_text = {
                'registration': 'complete registration',
                'login': 'login',
                'verify_email': 'verify email',
                'verify_phone': 'verify phone'
            }.get(purpose, 'verification')
            
            sms_text = f"Your XFas Logistics OTP for {purpose_text} is: {otp_code}. Valid for {self.otp_expiry_minutes} minutes. Do not share with anyone."
            
            # Send SMS using the SMS service
            result = await sms_service.send_sms(phone, sms_text)
            
            if result['success']:
                logger.info(f"SMS OTP sent successfully to {phone} via {result['provider']}")
                return True
            else:
                logger.error(f"Failed to send SMS OTP to {phone}: {result.get('error', 'Unknown error')}")
                return False
            
        except Exception as e:
            logger.error(f"Failed to send SMS OTP: {str(e)}")
            return False
    
    async def cleanup_expired_otps(self):
        """Clean up expired OTP records."""
        try:
            result = await self.db.otps.delete_many({
                "expires_at": {"$lt": datetime.utcnow()}
            })
            logger.info(f"Cleaned up {result.deleted_count} expired OTP records")
        except Exception as e:
            logger.error(f"Failed to cleanup expired OTPs: {str(e)}")

# Create a global OTP service instance (will be initialized with database)
otp_service = None

def get_otp_service(db: AsyncIOMotorDatabase) -> OTPService:
    """Get or create OTP service instance."""
    global otp_service
    if otp_service is None:
        otp_service = OTPService(db)
    return otp_service