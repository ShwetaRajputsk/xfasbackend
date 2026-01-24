# Configuration Guide

This project uses a centralized configuration system that allows you to manage all IPs, ports, and settings from a single location.

## Overview

All configuration is managed through:
- **Backend**: `backend/config.py` - Reads from environment variables (`.env` file)
- **Frontend**: `frontend/src/config.js` - Reads from environment variables (REACT_APP_*)

## Quick Start

### Backend Configuration

1. Copy the example environment file:
   ```bash
   cd backend
   cp env.example .env
   ```

2. Edit `.env` with your settings:
   ```env
   SERVER_HOST=0.0.0.0
   SERVER_PORT=8000
   MONGO_URL=your-mongodb-connection-string
   CORS_ORIGINS=http://localhost:3000,https://your-production-domain.com
   ```

3. The backend will automatically load these settings from `config.py`

### Frontend Configuration

1. Copy the example environment file:
   ```bash
   cd frontend
   cp env.example .env
   ```

2. Edit `.env` with your settings:
   ```env
   REACT_APP_API_URL=https://your-backend-api.com/api
   REACT_APP_ENV=production
   ```

3. The frontend will automatically load these settings from `src/config.js`

## Configuration Categories

### Server Settings
- `SERVER_HOST`: Backend server host (default: `0.0.0.0`)
- `SERVER_PORT`: Backend server port (default: `8000`)
- `API_PREFIX`: API route prefix (default: `/api`)
- `ENVIRONMENT`: Environment mode (development/production)

### Database Settings
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: Database name
- `MONGO_MAX_POOL_SIZE`: Connection pool size
- `MONGO_*_TIMEOUT_MS`: Various timeout settings

### CORS Settings
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `CORS_ALLOW_CREDENTIALS`: Allow credentials in CORS
- `CORS_ALLOW_METHODS`: Allowed HTTP methods
- `CORS_ALLOW_HEADERS`: Allowed HTTP headers

### Frontend API Settings
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_API_TIMEOUT`: Request timeout in milliseconds
- `REACT_APP_FRONTEND_URL`: Frontend application URL

## Changing Configuration

### For Development
Edit the `.env` files in `backend/` and `frontend/` directories.

### For Production/Hosting
Set environment variables in your hosting platform:
- **Render/Heroku**: Set in dashboard or `render.yaml`
- **Vercel**: Set in dashboard or `vercel.json`
- **Netlify**: Set in dashboard or `netlify.toml`

## Example: Changing Backend Port

1. Edit `backend/.env`:
   ```env
   SERVER_PORT=9000
   ```

2. Restart the backend server

3. Update `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:9000/api
   ```

4. Restart the frontend development server

## Example: Switching Between Environments

### Development
```env
# backend/.env
ENVIRONMENT=development
DEBUG=True
SERVER_PORT=8000
CORS_ORIGINS=http://localhost:3000

# frontend/.env
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:8000/api
```

### Production
```env
# backend/.env
ENVIRONMENT=production
DEBUG=False
SERVER_PORT=8000
CORS_ORIGINS=https://your-domain.com

# frontend/.env
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.your-domain.com/api
```

## Configuration Validation

Both config files include validation:
- Backend: Validates critical settings on import
- Frontend: Validates and warns about misconfigurations

## Accessing Configuration in Code

### Backend (Python)
```python
from config import config

# Use configuration
db_url = config.get_database_url()
api_url = config.get_api_url()
port = config.SERVER_PORT
```

### Frontend (JavaScript)
```javascript
import config from './config';

// Use configuration
const apiUrl = config.getApiUrl();
const timeout = config.API_TIMEOUT;
const isProd = config.isProduction();
```

## Notes

- All sensitive values (API keys, secrets) should be stored in `.env` files
- Never commit `.env` files to version control
- Use `env.example` files as templates
- Configuration is loaded at application startup
- Changes to `.env` require application restart

