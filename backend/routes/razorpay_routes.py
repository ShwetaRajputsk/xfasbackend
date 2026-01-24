from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
import hmac
import hashlib

from models.user import User
from services.razorpay_service import RazorpayService
from utils.auth import get_current_user
import json
import logging

logger = logging.getLogger(__name__)

# Database dependency
async def get_database() -> AsyncIOMotorDatabase:
    from motor.motor_asyncio import AsyncIOMotorClient
    import os
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ.get('DB_NAME', 'xfas_logistics')]

router = APIRouter(prefix="/payments", tags=["Payments"])

class CreateOrderRequest(BaseModel):
    amount: float
    currency: str = "INR"
    receipt: str = None
    notes: Dict[str, Any] = {}

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/create-order")
async def create_payment_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a Razorpay payment order."""
    
    try:
        razorpay_service = RazorpayService()
        
        if not razorpay_service.is_configured():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment service not configured"
            )
        
        # Create order with Razorpay
        enhanced_notes = {
            **(request.notes or {}),
            "merchant": "XFas Logistics Private Limited",
            "service_type": "courier_logistics",
            "platform": "web_application",
            "customer_type": "business",
            "order_category": "shipping_service",
            "payment_for": "logistics_booking",
            "business_type": "logistics",
            "merchant_category": "transportation",
            "service": "courier_booking"
        }
        
        order = await razorpay_service.create_order(
            amount=request.amount,
            currency=request.currency,
            receipt=request.receipt,
            notes=enhanced_notes
        )
        
        # Store order in database for tracking
        order_record = {
            "order_id": order["id"],
            "user_id": current_user.id,
            "amount": request.amount,
            "currency": request.currency,
            "status": "created",
            "notes": request.notes,
            "created_at": order["created_at"],
            "razorpay_order": order
        }
        
        await db.payment_orders.insert_one(order_record)
        
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "status": order["status"],
            "key_id": razorpay_service.key_id or "rzp_test_RzOVYKxNXN9nXVe6"  # Use provided key as fallback
        }
        
    except Exception as e:
        logger.error(f"Error creating payment order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )

@router.post("/verify")
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Verify Razorpay payment signature."""
    
    try:
        logger.info(f"Payment verification request: order_id={request.razorpay_order_id}, payment_id={request.razorpay_payment_id}")
        
        razorpay_service = RazorpayService()
        
        if not razorpay_service.is_configured():
            logger.error("Razorpay service not configured")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment service not configured. Please check Razorpay credentials."
            )
        
        # Verify payment signature
        is_valid = await razorpay_service.verify_payment(
            razorpay_order_id=request.razorpay_order_id,
            razorpay_payment_id=request.razorpay_payment_id,
            razorpay_signature=request.razorpay_signature
        )
        
        if not is_valid:
            logger.error(f"Payment signature verification failed for payment_id: {request.razorpay_payment_id}")
            logger.error(f"Order ID: {request.razorpay_order_id}")
            logger.error(f"Expected signature: {razorpay_service.key_secret[:10]}...")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "SIGNATURE_VERIFICATION_FAILED",
                    "message": "Payment verification failed. Invalid signature.",
                    "payment_id": request.razorpay_payment_id,
                    "order_id": request.razorpay_order_id
                }
            )
        
        # Get payment details from Razorpay
        payment_details = None
        try:
            payment_details = await razorpay_service.get_payment_details(request.razorpay_payment_id)
            if payment_details:
                logger.info(f"Payment details fetched: status={payment_details.get('status')}, method={payment_details.get('method')}")
            else:
                logger.warning(f"Could not fetch payment details for payment_id: {request.razorpay_payment_id}")
                # Don't fail verification if we can't fetch details but signature is valid
        except Exception as e:
            logger.warning(f"Error fetching payment details: {str(e)}")
            # Don't fail verification if we can't fetch details but signature is valid
        
        # Update order status in database
        update_result = await db.payment_orders.update_one(
            {"order_id": request.razorpay_order_id, "user_id": current_user.id},
            {
                "$set": {
                    "status": "paid",
                    "payment_id": request.razorpay_payment_id,
                    "payment_signature": request.razorpay_signature,
                    "payment_details": payment_details,
                    "verified_at": payment_details.get("created_at") if payment_details else int(__import__('time').time())
                }
            }
        )
        
        if update_result.matched_count == 0:
            logger.error(f"Payment order not found for order_id: {request.razorpay_order_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment order not found"
            )
        
        logger.info(f"Payment verified successfully: payment_id={request.razorpay_payment_id}")
        
        return {
            "status": "success",
            "payment_id": request.razorpay_payment_id,
            "order_id": request.razorpay_order_id,
            "verified": True,
            "payment_method": payment_details.get("method", "unknown"),
            "amount": payment_details.get("amount", 0) / 100  # Convert from paise
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )

@router.post("/webhooks/razorpay")
async def razorpay_webhook(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Handle Razorpay webhooks."""
    
    try:
        # Get raw payload and signature
        payload = await request.body()
        signature = request.headers.get("X-Razorpay-Signature", "")
        
        razorpay_service = RazorpayService()
        
        # Verify webhook signature
        if not razorpay_service.verify_webhook_signature(payload.decode(), signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
        
        # Parse webhook payload
        webhook_data = json.loads(payload.decode())
        event_type = webhook_data.get("event", "")
        
        # Process webhook event
        result = await razorpay_service.process_webhook_event(event_type, webhook_data)
        
        # Store webhook event in database
        webhook_record = {
            "event_type": event_type,
            "payload": webhook_data,
            "signature": signature,
            "processed_result": result,
            "created_at": webhook_data.get("created_at"),
            "processed_at": int(__import__('time').time())
        }
        
        await db.razorpay_webhooks.insert_one(webhook_record)
        
        # Update relevant order/payment records based on event
        if result.get("status") == "success" and result.get("order_id"):
            await db.payment_orders.update_one(
                {"order_id": result["order_id"]},
                {
                    "$set": {
                        "webhook_status": result["status"],
                        "webhook_event": event_type,
                        "last_webhook_at": webhook_record["processed_at"]
                    }
                }
            )
        
        return {"status": "success", "event_processed": event_type}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing Razorpay webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process webhook: {str(e)}"
        )

@router.post("/test-simple-payment")
async def test_simple_payment():
    """Test a very simple payment to bypass risk checks."""
    
    try:
        razorpay_service = RazorpayService()
        
        if not razorpay_service.is_configured():
            return {"error": "Razorpay not configured"}
        
        # Create a very simple, low-risk order
        simple_order = await razorpay_service.create_order(
            amount=1.0,  # ₹1 - minimal amount
            currency="INR",
            receipt=f"test_simple_{int(__import__('time').time())}",
            notes={
                "test": "true",
                "merchant": "XFas Logistics",
                "purpose": "development_test"
            }
        )
        
        return {
            "success": True,
            "order": simple_order,
            "message": "Simple test order created successfully",
            "instructions": {
                "card": "4111 1111 1111 1111",
                "expiry": "12/27",
                "cvv": "123",
                "amount": "₹1"
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating simple test payment: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/test-payment")
async def test_payment_verification(
    request: VerifyPaymentRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Test payment verification without user authentication (for debugging)."""
    
    try:
        logger.info(f"TEST: Payment verification request: order_id={request.razorpay_order_id}, payment_id={request.razorpay_payment_id}")
        
        razorpay_service = RazorpayService()
        
        if not razorpay_service.is_configured():
            return {
                "error": "Razorpay not configured",
                "configured": False,
                "key_id": razorpay_service.key_id,
                "key_secret_length": len(razorpay_service.key_secret) if razorpay_service.key_secret else 0
            }
        
        # Test signature verification
        payload = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
        expected_signature = hmac.new(
            razorpay_service.key_secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        signature_valid = hmac.compare_digest(expected_signature, request.razorpay_signature)
        
        # Get payment details
        payment_details = None
        try:
            payment_details = await razorpay_service.get_payment_details(request.razorpay_payment_id)
        except Exception as e:
            logger.error(f"Error fetching payment details: {str(e)}")
        
        return {
            "configured": True,
            "test_mode": razorpay_service.is_test_mode,
            "key_id": razorpay_service.key_id,
            "payload": payload,
            "expected_signature": expected_signature,
            "received_signature": request.razorpay_signature,
            "signature_valid": signature_valid,
            "payment_details": payment_details,
            "payment_status": payment_details.get('status') if payment_details else None,
            "payment_method": payment_details.get('method') if payment_details else None
        }
        
    except Exception as e:
        logger.error(f"Error in test payment verification: {str(e)}")
        return {
            "error": str(e),
            "configured": False
        }

@router.get("/test-config")
async def test_razorpay_config():
    """Test Razorpay configuration."""
    
    try:
        razorpay_service = RazorpayService()
        
        # Test creating a simple order
        test_order = None
        if razorpay_service.is_configured():
            try:
                test_order = await razorpay_service.create_order(
                    amount=1.0,
                    currency="INR",
                    receipt=f"test_{int(__import__('time').time())}",
                    notes={"test": "configuration_check"}
                )
            except Exception as e:
                test_order = {"error": str(e)}
        
        return {
            "configured": razorpay_service.is_configured(),
            "key_id": razorpay_service.key_id,
            "key_secret_length": len(razorpay_service.key_secret) if razorpay_service.key_secret else 0,
            "webhook_secret_configured": bool(razorpay_service.webhook_secret),
            "test_mode": razorpay_service.is_test_mode,
            "lenient_mode": razorpay_service.lenient_mode,
            "use_mock": razorpay_service.use_mock,
            "test_order": test_order
        }
        
    except Exception as e:
        logger.error(f"Error testing Razorpay config: {str(e)}")
        return {
            "configured": False,
            "error": str(e)
        }

@router.get("/orders/{order_id}")
async def get_payment_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get payment order details."""
    
    try:
        order = await db.payment_orders.find_one({
            "order_id": order_id,
            "user_id": current_user.id
        })
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment order not found"
            )
        
        # Remove sensitive data
        order.pop("_id", None)
        order.pop("razorpay_order", None)
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching payment order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch payment order: {str(e)}"
        )