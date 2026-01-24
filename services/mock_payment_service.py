"""
Mock Payment Service for Development
Simulates Razorpay payments without actual API calls
"""

import time
import hashlib
import hmac
from typing import Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class MockPaymentService:
    """Mock payment service that simulates Razorpay for development"""
    
    def __init__(self):
        self.mock_key_id = "rzp_test_mock_development"
        self.mock_key_secret = "mock_secret_for_development"
        logger.info("Mock Payment Service initialized for development")
    
    def is_configured(self) -> bool:
        """Always return True for mock service"""
        return True
    
    async def create_order(self, amount: float, currency: str = "INR", receipt: str = None, notes: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a mock Razorpay order"""
        try:
            # Convert amount to paise
            amount_paise = int(amount * 100)
            
            # Generate mock order ID
            timestamp = int(time.time())
            order_id = f"order_mock_{timestamp}"
            
            # Create mock order response
            order = {
                "id": order_id,
                "entity": "order",
                "amount": amount_paise,
                "amount_paid": 0,
                "amount_due": amount_paise,
                "currency": currency,
                "receipt": receipt or f"mock_receipt_{timestamp}",
                "offer_id": None,
                "status": "created",
                "attempts": 0,
                "notes": notes or {},
                "created_at": timestamp
            }
            
            logger.info(f"Mock order created: {order_id} for amount ₹{amount}")
            return order
            
        except Exception as e:
            logger.error(f"Error creating mock order: {str(e)}")
            raise Exception(f"Failed to create mock payment order: {str(e)}")
    
    async def verify_payment(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """Verify mock payment signature"""
        try:
            logger.info(f"Mock payment verification: order_id={razorpay_order_id}, payment_id={razorpay_payment_id}")
            
            # For mock payments, always return True if the IDs look valid
            if (razorpay_order_id.startswith('order_mock_') and 
                razorpay_payment_id.startswith('pay_mock_') and 
                len(razorpay_signature) > 10):
                
                logger.info("Mock payment verification successful")
                return True
            
            # Generate expected signature for validation
            payload = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.new(
                self.mock_key_secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            # For mock, be lenient with signature verification
            is_valid = len(razorpay_signature) > 10  # Just check it's not empty
            logger.info(f"Mock signature verification: {is_valid}")
            
            return is_valid
            
        except Exception as e:
            logger.error(f"Error verifying mock payment: {str(e)}")
            return False
    
    async def get_payment_details(self, payment_id: str) -> Optional[Dict[str, Any]]:
        """Get mock payment details"""
        try:
            # Generate mock payment details
            timestamp = int(time.time())
            
            payment_details = {
                "id": payment_id,
                "entity": "payment",
                "amount": 100000,  # ₹1000 in paise
                "currency": "INR",
                "status": "captured",
                "order_id": f"order_mock_{timestamp}",
                "invoice_id": None,
                "international": False,
                "method": "card",
                "amount_refunded": 0,
                "refund_status": None,
                "captured": True,
                "description": "Mock payment for development",
                "card_id": "card_mock_123456",
                "card": {
                    "id": "card_mock_123456",
                    "entity": "card",
                    "name": "John Doe",
                    "last4": "1111",
                    "network": "Visa",
                    "type": "debit",
                    "issuer": "HDFC",
                    "international": False,
                    "emi": False
                },
                "bank": None,
                "wallet": None,
                "vpa": None,
                "email": "john.doe@example.com",
                "contact": "+919876543210",
                "notes": {
                    "mock": "true",
                    "environment": "development"
                },
                "fee": 236,
                "tax": 36,
                "error_code": None,
                "error_description": None,
                "error_source": None,
                "error_step": None,
                "error_reason": None,
                "acquirer_data": {
                    "auth_code": "123456"
                },
                "created_at": timestamp
            }
            
            logger.info(f"Mock payment details generated for: {payment_id}")
            return payment_details
            
        except Exception as e:
            logger.error(f"Error generating mock payment details: {str(e)}")
            return None
    
    async def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """Create mock refund"""
        try:
            timestamp = int(time.time())
            refund_id = f"rfnd_mock_{timestamp}"
            
            refund = {
                "id": refund_id,
                "entity": "refund",
                "amount": int((amount or 100) * 100),  # Convert to paise
                "currency": "INR",
                "payment_id": payment_id,
                "notes": {
                    "mock": "true",
                    "environment": "development"
                },
                "receipt": None,
                "acquirer_data": {
                    "arn": f"mock_arn_{timestamp}"
                },
                "created_at": timestamp,
                "batch_id": None,
                "status": "processed",
                "speed_processed": "normal",
                "speed_requested": "normal"
            }
            
            logger.info(f"Mock refund created: {refund_id}")
            return refund
            
        except Exception as e:
            logger.error(f"Error creating mock refund: {str(e)}")
            raise Exception(f"Failed to create mock refund: {str(e)}")
    
    def verify_webhook_signature(self, payload: str, signature: str) -> bool:
        """Verify mock webhook signature"""
        # For mock, always return True
        logger.info("Mock webhook signature verification (always true)")
        return True
    
    async def process_webhook_event(self, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process mock webhook events"""
        logger.info(f"Mock webhook event processed: {event_type}")
        
        return {
            "status": "success",
            "event_type": event_type,
            "mock": True,
            "processed_at": int(time.time())
        }