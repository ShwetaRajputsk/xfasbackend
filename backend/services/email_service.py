"""
Enhanced Email Service for XFas Logistics using Zoho Mail
Handles OTP emails, notifications, and general email communications
"""

import smtplib
import imaplib
import poplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Dict, Optional, Any
import logging
from datetime import datetime
import os
from pathlib import Path

from config import config

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = config.SMTP_HOST
        self.smtp_port = config.SMTP_PORT
        self.smtp_user = config.SMTP_USERNAME
        self.smtp_password = config.SMTP_PASSWORD
        self.smtp_use_tls = config.SMTP_USE_TLS
        self.from_email = config.FROM_EMAIL or config.SMTP_USERNAME
        
        # IMAP/POP configuration for reading emails
        self.imap_host = config.IMAP_HOST
        self.imap_port = config.IMAP_PORT
        self.pop_host = config.POP_HOST
        self.pop_port = config.POP_PORT
        
        self.require_auth = config.REQUIRE_EMAIL_AUTH
        
    def _validate_config(self) -> bool:
        """Validate email configuration."""
        if not self.smtp_user or not self.smtp_password:
            logger.error("SMTP credentials not configured")
            return False
        return True
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Send email using Zoho Mail SMTP.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Plain text body
            html_body: HTML body (optional)
            attachments: List of attachments (optional)
            cc: CC recipients (optional)
            bcc: BCC recipients (optional)
            
        Returns:
            Dict with success status and details
        """
        
        if not self._validate_config():
            return {
                "success": False,
                "error": "Email service not configured properly"
            }
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if cc:
                msg['Cc'] = ', '.join(cc)
            
            # Add plain text part
            text_part = MIMEText(body, 'plain', 'utf-8')
            msg.attach(text_part)
            
            # Add HTML part if provided
            if html_body:
                html_part = MIMEText(html_body, 'html', 'utf-8')
                msg.attach(html_part)
            
            # Add attachments if provided
            if attachments:
                for attachment in attachments:
                    self._add_attachment(msg, attachment)
            
            # Prepare recipient list
            recipients = [to_email]
            if cc:
                recipients.extend(cc)
            if bcc:
                recipients.extend(bcc)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.smtp_use_tls:
                    server.starttls()
                
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg, to_addrs=recipients)
            
            logger.info(f"Email sent successfully to {to_email}")
            
            return {
                "success": True,
                "message": "Email sent successfully",
                "to": to_email,
                "subject": subject,
                "sent_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "to": to_email,
                "subject": subject
            }
    
    def _add_attachment(self, msg: MIMEMultipart, attachment: Dict[str, Any]):
        """Add attachment to email message."""
        try:
            if 'file_path' in attachment:
                # File attachment
                file_path = Path(attachment['file_path'])
                if file_path.exists():
                    with open(file_path, 'rb') as f:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(f.read())
                    
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {attachment.get("filename", file_path.name)}'
                    )
                    msg.attach(part)
            
            elif 'content' in attachment:
                # Content attachment
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment['content'])
                
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {attachment.get("filename", "attachment")}'
                )
                msg.attach(part)
                
        except Exception as e:
            logger.error(f"Failed to add attachment: {str(e)}")
    
    async def send_otp_email(self, email: str, otp_code: str, purpose: str) -> Dict[str, Any]:
        """
        Send OTP verification email with XFas Logistics branding.
        
        Args:
            email: Recipient email address
            otp_code: OTP code to send
            purpose: Purpose of the OTP
            
        Returns:
            Dict with success status and details
        """
        
        purpose_text = {
            'registration': 'complete your registration',
            'login': 'log in to your account',
            'verify_email': 'verify your email address',
            'verify_phone': 'verify your phone number',
            'reset_password': 'reset your password',
            'booking_confirmation': 'confirm your booking'
        }.get(purpose, 'verify your identity')
        
        subject = f"XFas Logistics - OTP Verification ({purpose.replace('_', ' ').title()})"
        
        # Plain text version
        plain_body = f"""
        XFas Logistics - OTP Verification
        
        Hello,
        
        You requested an OTP to {purpose_text}. Please use the code below:
        
        OTP Code: {otp_code}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        XFas Logistics Team
        
        ---
        This is an automated message, please do not reply to this email.
        """
        
        # HTML version with styling
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>XFas Logistics - OTP Verification</title>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; }}
                .header {{ background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px 20px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 28px; font-weight: 600; }}
                .header p {{ margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }}
                .content {{ padding: 40px 30px; }}
                .greeting {{ font-size: 18px; color: #333; margin-bottom: 20px; }}
                .message {{ font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 30px; }}
                .otp-container {{ background: #f8fafc; border: 2px dashed #f97316; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }}
                .otp-label {{ font-size: 14px; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }}
                .otp-code {{ font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f97316; font-family: 'Courier New', monospace; }}
                .expiry {{ font-size: 14px; color: #dc2626; margin-top: 20px; font-weight: 500; }}
                .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }}
                .warning p {{ margin: 0; color: #92400e; font-size: 14px; }}
                .footer {{ background: #374151; color: #d1d5db; padding: 25px 30px; text-align: center; }}
                .footer p {{ margin: 0; font-size: 12px; line-height: 1.5; }}
                .footer .company {{ font-weight: 600; color: #f97316; }}
                @media (max-width: 600px) {{
                    .container {{ margin: 0; }}
                    .content {{ padding: 30px 20px; }}
                    .otp-code {{ font-size: 28px; letter-spacing: 4px; }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚚 XFas Logistics</h1>
                    <p>Your Trusted Shipping Partner</p>
                </div>
                
                <div class="content">
                    <div class="greeting">Hello!</div>
                    
                    <div class="message">
                        You requested an OTP to <strong>{purpose_text}</strong>. 
                        Please use the verification code below to proceed:
                    </div>
                    
                    <div class="otp-container">
                        <div class="otp-label">Your OTP Code</div>
                        <div class="otp-code">{otp_code}</div>
                        <div class="expiry">⏰ This code will expire in 10 minutes</div>
                    </div>
                    
                    <div class="warning">
                        <p><strong>Security Notice:</strong> If you didn't request this code, please ignore this email. Never share your OTP with anyone.</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p><span class="company">XFas Logistics</span> - Connecting You Worldwide</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                    <p>&copy; {datetime.now().year} XFas Logistics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(
            to_email=email,
            subject=subject,
            body=plain_body,
            html_body=html_body
        )
    
    async def send_booking_confirmation_email(
        self,
        email: str,
        booking_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Send booking confirmation email."""
        
        subject = f"Booking Confirmed - {booking_details.get('shipment_number', 'N/A')}"
        
        # Extract booking details
        awb = booking_details.get('awb', 'N/A')
        shipment_number = booking_details.get('shipment_number', 'N/A')
        carrier = booking_details.get('carrier', 'N/A')
        service_type = booking_details.get('service_type', 'N/A')
        estimated_delivery = booking_details.get('estimated_delivery', 'TBD')
        sender_name = booking_details.get('sender_name', 'N/A')
        recipient_name = booking_details.get('recipient_name', 'N/A')
        tracking_url = booking_details.get('tracking_url', '#')
        
        plain_body = f"""
        XFas Logistics - Booking Confirmation
        
        Dear {recipient_name},
        
        Your shipment has been booked successfully!
        
        Shipment Details:
        - AWB Number: {awb}
        - Shipment Number: {shipment_number}
        - Carrier: {carrier}
        - Service: {service_type}
        - Estimated Delivery: {estimated_delivery}
        
        Sender: {sender_name}
        Recipient: {recipient_name}
        
        Track your shipment: {tracking_url}
        
        Thank you for choosing XFas Logistics!
        
        Best regards,
        XFas Logistics Team
        """
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Booking Confirmation - XFas Logistics</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; }}
                .header {{ background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px 20px; text-align: center; }}
                .content {{ padding: 30px; }}
                .details-box {{ background: #f8fafc; border-left: 4px solid #f97316; padding: 20px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; margin: 10px 0; }}
                .label {{ font-weight: bold; color: #374151; }}
                .value {{ color: #6b7280; }}
                .track-button {{ display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ background: #374151; color: #d1d5db; padding: 20px; text-align: center; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚚 XFas Logistics</h1>
                    <h2>Booking Confirmed!</h2>
                </div>
                
                <div class="content">
                    <p>Dear <strong>{recipient_name}</strong>,</p>
                    <p>Your shipment has been booked successfully with XFas Logistics.</p>
                    
                    <div class="details-box">
                        <h3>📦 Shipment Details</h3>
                        <div class="detail-row">
                            <span class="label">AWB Number:</span>
                            <span class="value">{awb}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Shipment Number:</span>
                            <span class="value">{shipment_number}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Carrier:</span>
                            <span class="value">{carrier}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Service:</span>
                            <span class="value">{service_type}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Estimated Delivery:</span>
                            <span class="value">{estimated_delivery}</span>
                        </div>
                    </div>
                    
                    <p><strong>Sender:</strong> {sender_name}</p>
                    <p><strong>Recipient:</strong> {recipient_name}</p>
                    
                    <div style="text-align: center;">
                        <a href="{tracking_url}" class="track-button">📍 Track Your Shipment</a>
                    </div>
                    
                    <p>Thank you for choosing XFas Logistics!</p>
                </div>
                
                <div class="footer">
                    <p>&copy; {datetime.now().year} XFas Logistics. All rights reserved.</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(
            to_email=email,
            subject=subject,
            body=plain_body,
            html_body=html_body
        )
    
    async def send_status_update_email(
        self,
        email: str,
        status_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Send shipment status update email."""
        
        subject = f"Shipment Update - {status_details.get('shipment_number', 'N/A')}"
        
        awb = status_details.get('awb', 'N/A')
        status = status_details.get('status', 'N/A')
        location = status_details.get('location', 'N/A')
        description = status_details.get('description', 'N/A')
        update_time = status_details.get('update_time', 'N/A')
        tracking_url = status_details.get('tracking_url', '#')
        recipient_name = status_details.get('recipient_name', 'Customer')
        
        plain_body = f"""
        XFas Logistics - Shipment Status Update
        
        Dear {recipient_name},
        
        Your shipment status has been updated.
        
        Current Status: {status}
        AWB: {awb}
        Location: {location}
        Update Time: {update_time}
        Description: {description}
        
        Track your shipment: {tracking_url}
        
        Best regards,
        XFas Logistics Team
        """
        
        # Determine status color and icon
        status_colors = {
            'PICKED_UP': '#10b981',
            'IN_TRANSIT': '#3b82f6',
            'OUT_FOR_DELIVERY': '#f59e0b',
            'DELIVERED': '#059669',
            'DELAYED': '#dc2626'
        }
        
        status_icons = {
            'PICKED_UP': '📦',
            'IN_TRANSIT': '🚛',
            'OUT_FOR_DELIVERY': '🚚',
            'DELIVERED': '✅',
            'DELAYED': '⚠️'
        }
        
        status_color = status_colors.get(status, '#6b7280')
        status_icon = status_icons.get(status, '📋')
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Shipment Update - XFas Logistics</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; }}
                .header {{ background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px 20px; text-align: center; }}
                .content {{ padding: 30px; }}
                .status-box {{ background: #f8fafc; border-left: 4px solid {status_color}; padding: 20px; margin: 20px 0; border-radius: 6px; }}
                .status-title {{ font-size: 20px; font-weight: bold; color: {status_color}; margin-bottom: 15px; }}
                .detail-row {{ margin: 8px 0; }}
                .label {{ font-weight: bold; color: #374151; }}
                .value {{ color: #6b7280; }}
                .track-button {{ display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ background: #374151; color: #d1d5db; padding: 20px; text-align: center; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚚 XFas Logistics</h1>
                    <h2>Shipment Status Update</h2>
                </div>
                
                <div class="content">
                    <p>Dear <strong>{recipient_name}</strong>,</p>
                    <p>Your shipment status has been updated.</p>
                    
                    <div class="status-box">
                        <div class="status-title">{status_icon} {status}</div>
                        <div class="detail-row">
                            <span class="label">AWB:</span> <span class="value">{awb}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Location:</span> <span class="value">{location}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Update Time:</span> <span class="value">{update_time}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Description:</span> <span class="value">{description}</span>
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="{tracking_url}" class="track-button">📍 View Full Tracking Details</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>&copy; {datetime.now().year} XFas Logistics. All rights reserved.</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(
            to_email=email,
            subject=subject,
            body=plain_body,
            html_body=html_body
        )
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test email service connection."""
        
        if not self._validate_config():
            return {
                "success": False,
                "error": "Email service not configured properly"
            }
        
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.smtp_use_tls:
                    server.starttls()
                
                server.login(self.smtp_user, self.smtp_password)
            
            return {
                "success": True,
                "message": "Email service connection successful",
                "smtp_host": self.smtp_host,
                "smtp_port": self.smtp_port,
                "from_email": self.from_email
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "smtp_host": self.smtp_host,
                "smtp_port": self.smtp_port
            }

# Create global email service instance
email_service = EmailService()