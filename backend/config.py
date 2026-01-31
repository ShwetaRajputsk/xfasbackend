"""
Centralized Configuration Management for XFas Logistics Backend

This module provides a single source of truth for all configuration settings
including IPs, ports, database connections, and other environment-specific values.
All settings can be overridden via environment variables.
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


class Config:
    """Centralized configuration class for backend application"""
    
    # ==================== Server Configuration ====================
    SERVER_HOST: str = os.environ.get('SERVER_HOST', '0.0.0.0')
    SERVER_PORT: int = int(os.environ.get('SERVER_PORT', '8000'))
    API_PREFIX: str = os.environ.get('API_PREFIX', '/api')
    DEBUG: bool = os.environ.get('DEBUG', 'False').lower() == 'true'
    ENVIRONMENT: str = os.environ.get('ENVIRONMENT', 'development')
    
    # ==================== Database Configuration ====================
    MONGO_URL: str = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME: str = os.environ.get('DB_NAME', 'xfas_logistics')
    MONGO_MAX_POOL_SIZE: int = int(os.environ.get('MONGO_MAX_POOL_SIZE', '5'))
    MONGO_CONNECT_TIMEOUT_MS: int = int(os.environ.get('MONGO_CONNECT_TIMEOUT_MS', '5000'))
    MONGO_SERVER_SELECTION_TIMEOUT_MS: int = int(os.environ.get('MONGO_SERVER_SELECTION_TIMEOUT_MS', '5000'))
    MONGO_SOCKET_TIMEOUT_MS: int = int(os.environ.get('MONGO_SOCKET_TIMEOUT_MS', '5000'))
    
    # ==================== CORS Configuration ====================
    CORS_ORIGINS: List[str] = os.environ.get(
        'CORS_ORIGINS', 
        'http://localhost:3000,http://127.0.0.1:3000'
    ).split(',')
    CORS_ALLOW_CREDENTIALS: bool = os.environ.get('CORS_ALLOW_CREDENTIALS', 'True').lower() == 'true'
    CORS_ALLOW_METHODS: List[str] = os.environ.get('CORS_ALLOW_METHODS', '*').split(',')
    CORS_ALLOW_HEADERS: List[str] = os.environ.get('CORS_ALLOW_HEADERS', '*').split(',')
    
    # ==================== JWT Configuration ====================
    JWT_SECRET_KEY: str = os.environ.get('JWT_SECRET_KEY', 'your-super-secret-jwt-key-change-in-production')
    JWT_ALGORITHM: str = os.environ.get('JWT_ALGORITHM', 'HS256')
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '30'))
    
    # ==================== Frontend Configuration ====================
    FRONTEND_URL: str = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    
    # ==================== Twilio Configuration ====================
    TWILIO_ACCOUNT_SID: str = os.environ.get('TWILIO_ACCOUNT_SID', '')
    TWILIO_AUTH_TOKEN: str = os.environ.get('TWILIO_AUTH_TOKEN', '')
    TWILIO_PHONE_NUMBER: str = os.environ.get('TWILIO_PHONE_NUMBER', '')
    
    # ==================== AWS Configuration ====================
    AWS_ACCESS_KEY_ID: str = os.environ.get('AWS_ACCESS_KEY_ID', '')
    AWS_SECRET_ACCESS_KEY: str = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    AWS_REGION: str = os.environ.get('AWS_REGION', 'us-east-1')
    
    # ==================== Email Configuration ====================
    SMTP_HOST: str = os.environ.get('SMTP_HOST', 'smtppro.zoho.com')
    SMTP_PORT: int = int(os.environ.get('SMTP_PORT', '587'))
    SMTP_USERNAME: str = os.environ.get('SMTP_USER', '')
    SMTP_PASSWORD: str = os.environ.get('SMTP_PASSWORD', '')
    SMTP_USE_TLS: bool = os.environ.get('SMTP_USE_TLS', 'True').lower() == 'true'
    FROM_EMAIL: str = os.environ.get('FROM_EMAIL', '')
    
    # Email Server Configuration (Zoho Mail)
    IMAP_HOST: str = os.environ.get('IMAP_HOST', 'imappro.zoho.com')
    IMAP_PORT: int = int(os.environ.get('IMAP_PORT', '993'))
    POP_HOST: str = os.environ.get('POP_HOST', 'poppro.zoho.com')
    POP_PORT: int = int(os.environ.get('POP_PORT', '995'))
    
    # Email Authentication
    REQUIRE_EMAIL_AUTH: bool = os.environ.get('REQUIRE_EMAIL_AUTH', 'True').lower() == 'true'
    
    # ==================== Payment Configuration ====================
    STRIPE_SECRET_KEY: str = os.environ.get('STRIPE_SECRET_KEY', '')
    STRIPE_PUBLISHABLE_KEY: str = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
    
    # Razorpay Configuration
    RAZORPAY_KEY_ID: str = os.environ.get('RAZORPAY_KEY_ID', '')
    RAZORPAY_KEY_SECRET: str = os.environ.get('RAZORPAY_KEY_SECRET', '')
    RAZORPAY_WEBHOOK_SECRET: str = os.environ.get('RAZORPAY_WEBHOOK_SECRET', '')
    
    # ==================== Logging Configuration ====================
    LOG_LEVEL: str = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT: str = os.environ.get(
        'LOG_FORMAT', 
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # ==================== API Configuration ====================
    API_TIMEOUT: int = int(os.environ.get('API_TIMEOUT', '30'))
    API_VERSION: str = os.environ.get('API_VERSION', '1.0.0')
    
    # ==================== Security Configuration ====================
    ALLOWED_HOSTS: List[str] = os.environ.get(
        'ALLOWED_HOSTS',
        'localhost,127.0.0.1,0.0.0.0'
    ).split(',')
    
    @classmethod
    def get_database_url(cls) -> str:
        """Get the complete database URL"""
        return cls.MONGO_URL
    
    @classmethod
    def get_server_url(cls) -> str:
        """Get the complete server URL"""
        protocol = 'https' if cls.ENVIRONMENT == 'production' else 'http'
        return f"{protocol}://{cls.SERVER_HOST}:{cls.SERVER_PORT}"
    
    @classmethod
    def get_api_url(cls) -> str:
        """Get the complete API URL"""
        return f"{cls.get_server_url()}{cls.API_PREFIX}"
    
    @classmethod
    def validate(cls) -> bool:
        """Validate critical configuration settings"""
        errors = []
        
        if not cls.MONGO_URL:
            errors.append("MONGO_URL is required")
        
        if not cls.JWT_SECRET_KEY or cls.JWT_SECRET_KEY == 'your-super-secret-jwt-key-change-in-production':
            if cls.ENVIRONMENT == 'production':
                errors.append("JWT_SECRET_KEY must be set in production")
        
        if errors:
            raise ValueError(f"Configuration errors: {', '.join(errors)}")
        
        return True
    
    @classmethod
    def print_config(cls):
        """Print current configuration (excluding sensitive data)"""
        print("=" * 50)
        print("XFas Logistics Backend Configuration")
        print("=" * 50)
        print(f"Environment: {cls.ENVIRONMENT}")
        print(f"Server: {cls.SERVER_HOST}:{cls.SERVER_PORT}")
        print(f"API Prefix: {cls.API_PREFIX}")
        print(f"API URL: {cls.get_api_url()}")
        print(f"Database: {cls.DB_NAME}")
        print(f"Frontend URL: {cls.FRONTEND_URL}")
        print(f"CORS Origins: {', '.join(cls.CORS_ORIGINS)}")
        print(f"Debug Mode: {cls.DEBUG}")
        print("=" * 50)


# Create a global config instance
config = Config()

# Validate configuration on import
try:
    config.validate()
except ValueError as e:
    import logging
    logging.warning(f"Configuration validation warning: {e}")

