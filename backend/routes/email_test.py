"""
Email Testing Routes for XFas Logistics
Test email functionality with Zoho Mail integration
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import logging

from services.email_service import email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/email-test", tags=["Email Testing"])

class TestEmailRequest(BaseModel):
    to_email: EmailStr
    test_type: str = "connection"  # connection, otp, booking, status

class OTPTestRequest(BaseModel):
    email: EmailStr
    otp_code: Optional[str] = None
    purpose: str = "test"

class BookingTestRequest(BaseModel):
    email: EmailStr
    shipment_number: Optional[str] = "TEST123456"
    awb: Optional[str] = "AWB123456789"
    carrier: Optional[str] = "Test Carrier"

@router.post("/connection")
async def test_email_connection():
    """Test email service connection."""
    
    try:
        result = await email_service.test_connection()
        
        if result['success']:
            return {
                "status": "success",
                "message": "Email service connection successful",
                "details": result
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Email service connection failed: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        logger.error(f"Email connection test failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email connection test failed: {str(e)}"
        )

@router.post("/send-otp")
async def test_send_otp(request: OTPTestRequest):
    """Test sending OTP email."""
    
    try:
        # Generate OTP if not provided
        otp_code = request.otp_code or "123456"
        
        result = await email_service.send_otp_email(
            email=request.email,
            otp_code=otp_code,
            purpose=request.purpose
        )
        
        if result['success']:
            return {
                "status": "success",
                "message": f"OTP email sent successfully to {request.email}",
                "otp_code": otp_code,
                "details": result
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send OTP email: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        logger.error(f"OTP email test failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OTP email test failed: {str(e)}"
        )

@router.post("/send-booking-confirmation")
async def test_booking_confirmation(request: BookingTestRequest):
    """Test sending booking confirmation email."""
    
    try:
        booking_details = {
            "shipment_number": request.shipment_number,
            "awb": request.awb,
            "carrier": request.carrier,
            "service_type": "Express Delivery",
            "estimated_delivery": "January 30, 2026",
            "sender_name": "Test Sender",
            "recipient_name": "Test Recipient",
            "tracking_url": f"https://xfas.codezora.com/track/{request.awb}"
        }
        
        result = await email_service.send_booking_confirmation_email(
            email=request.email,
            booking_details=booking_details
        )
        
        if result['success']:
            return {
                "status": "success",
                "message": f"Booking confirmation email sent successfully to {request.email}",
                "details": result
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send booking confirmation email: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        logger.error(f"Booking confirmation email test failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Booking confirmation email test failed: {str(e)}"
        )

@router.post("/send-status-update")
async def test_status_update(request: TestEmailRequest):
    """Test sending status update email."""
    
    try:
        status_details = {
            "shipment_number": "TEST123456",
            "awb": "AWB123456789",
            "status": "IN_TRANSIT",
            "location": "Mumbai, India",
            "description": "Package is in transit to destination",
            "update_time": "January 24, 2026 at 2:30 PM",
            "tracking_url": "https://xfas.codezora.com/track/AWB123456789",
            "recipient_name": "Test Recipient"
        }
        
        result = await email_service.send_status_update_email(
            email=request.to_email,
            status_details=status_details
        )
        
        if result['success']:
            return {
                "status": "success",
                "message": f"Status update email sent successfully to {request.to_email}",
                "details": result
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send status update email: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        logger.error(f"Status update email test failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Status update email test failed: {str(e)}"
        )

@router.post("/send-custom")
async def test_custom_email(
    to_email: EmailStr,
    subject: str,
    message: str,
    html_message: Optional[str] = None
):
    """Test sending custom email."""
    
    try:
        result = await email_service.send_email(
            to_email=to_email,
            subject=subject,
            body=message,
            html_body=html_message
        )
        
        if result['success']:
            return {
                "status": "success",
                "message": f"Custom email sent successfully to {to_email}",
                "details": result
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send custom email: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        logger.error(f"Custom email test failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Custom email test failed: {str(e)}"
        )

@router.get("/config")
async def get_email_config():
    """Get current email configuration (without sensitive data)."""
    
    return {
        "smtp_host": email_service.smtp_host,
        "smtp_port": email_service.smtp_port,
        "from_email": email_service.from_email,
        "smtp_use_tls": email_service.smtp_use_tls,
        "imap_host": email_service.imap_host,
        "imap_port": email_service.imap_port,
        "pop_host": email_service.pop_host,
        "pop_port": email_service.pop_port,
        "require_auth": email_service.require_auth,
        "configured": bool(email_service.smtp_user and email_service.smtp_password)
    }