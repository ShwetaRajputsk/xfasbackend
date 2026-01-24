"""
Vercel-optimized server for XFas Logistics Backend
"""
from datetime import datetime
import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

# Import centralized configuration
from config import config

# Configure logging using config
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL.upper(), logging.INFO),
    format=config.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Print configuration on startup
if config.DEBUG:
    config.print_config()

# Create FastAPI app
app = FastAPI(
    title="XFas Logistics API",
    description="Multi-channel parcel delivery platform API",
    version=config.API_VERSION
)

# CORS middleware using config
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=config.CORS_ALLOW_CREDENTIALS,
    allow_methods=config.CORS_ALLOW_METHODS if config.CORS_ALLOW_METHODS != ['*'] else ["*"],
    allow_headers=config.CORS_ALLOW_HEADERS if config.CORS_ALLOW_HEADERS != ['*'] else ["*"],
)

# Global MongoDB client (will be created on first use)
client = None
db = None

def get_mongo_client():
    """Get MongoDB client, creating it if needed"""
    global client, db
    
    if client is None:
        try:
            # Use synchronous client for Vercel compatibility
            client = MongoClient(
                config.get_database_url(),
                serverSelectionTimeoutMS=config.MONGO_SERVER_SELECTION_TIMEOUT_MS,
                connectTimeoutMS=config.MONGO_CONNECT_TIMEOUT_MS,
                socketTimeoutMS=config.MONGO_SOCKET_TIMEOUT_MS,
                maxPoolSize=config.MONGO_MAX_POOL_SIZE
            )
            db = client[config.DB_NAME]
            logger.info("MongoDB client created successfully")
        except Exception as e:
            logger.error(f"Failed to create MongoDB client: {e}")
            client = None
            db = None
    
    return client, db

# Database dependency
def get_database():
    """Get database connection"""
    client, database = get_mongo_client()
    if database is None:
        raise HTTPException(status_code=503, detail="Database not available")
    return database

# Health check endpoint
@app.get("/api/health")
def health_check():
    try:
        # Simple health check without MongoDB for now
        return {
            "status": "healthy",
            "database": "not_tested",
            "message": "Basic health check passed",
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "database": "error",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

# Root endpoint
@app.get("/api/")
def root():
    return {
        "message": "XFas Logistics API",
        "version": config.API_VERSION,
        "status": "operational"
    }

# Simple test endpoint
@app.get("/api/test")
def test():
    return {
        "message": "Test endpoint working",
        "timestamp": datetime.utcnow()
    }

# Include other routers (simplified for Vercel)
# Temporarily disabled to isolate the issue
# try:
#     from routes.auth import router as auth_router
#     app.include_router(auth_router, prefix="/api")
# except ImportError as e:
#     logger.warning(f"Could not import auth router: {e}")

# try:
#     from routes.quotes import router as quotes_router
#     app.include_router(quotes_router, prefix="/api")
# except ImportError as e:
#     logger.warning(f"Could not import quotes router: {e}")

# Shutdown handler
@app.on_event("shutdown")
def shutdown_db_client():
    global client
    if client is not None:
        client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=config.SERVER_HOST,
        port=config.SERVER_PORT,
        reload=config.DEBUG,
        log_level=config.LOG_LEVEL.lower()
    )
