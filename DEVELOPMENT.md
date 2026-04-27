# Subly Development Guide

## 🎯 Quick Reference

### Start All Services (First Time)
```bash
# Terminal 1: Start MongoDB
docker-compose up -d

# Terminal 2: Start Backend
cd server
npm install
npm run dev

# Terminal 3: Start Frontend
cd client
npm install
npm run dev
```

Then visit: **http://localhost:5173**

### Daily Development
```bash
# MongoDB (if not running)x
docker-compose up -d

# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

---

## 📦 Services Overview

### Frontend (Port 5173)
- **Framework**: Vue 3 + TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Router**: Vue Router
- **API Base**: `http://localhost:3000/api`

**Available Scripts**:
```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend (Port 3000)
- **Framework**: Express.js
- **Database**: MongoDB (port 27017)
- **Authentication**: JWT
- **Logging**: Winston
- **API Base**: `/api/auth`

**Available Scripts**:
```bash
npm run dev      # Start with nodemon (hot reload)
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled server
```

### Database (Port 27017)
- **Type**: MongoDB 7.0
- **Container**: subly-mongodb
- **Username**: admin
- **Password**: password123
- **Database**: subly

**Commands**:
```bash
docker-compose up -d      # Start
docker-compose down       # Stop
docker-compose down -v    # Stop and remove volumes
docker-compose logs       # View logs
docker-compose ps         # Show status
```

---

## 🔐 Authentication Flow

### Registration
```
User fills form → 
Frontend validates → 
POST /api/auth/register → 
Backend hashes password → 
Creates user in MongoDB → 
Returns JWT token → 
Client stores token in localStorage → 
Redirect to dashboard
```

### Login
```
User fills form → 
Frontend validates → 
POST /api/auth/login → 
Backend compares passwords → 
Returns JWT token → 
Client stores token → 
Navbar shows logout button
```

### Password Recovery
```
User requests recovery → 
POST /api/auth/recover → 
Backend generates token → 
Returns token (in production: sends email) → 
User submits new password → 
POST /api/auth/reset-password → 
Backend validates token → 
Updates password → 
User can login
```

---

## 🌐 API Integration

### Axios Client Setup
**File**: `client/src/api/client.ts`

Automatically:
- Adds Bearer token from localStorage
- Handles 401 errors (redirects to login)
- Sets correct headers

### Using API in Components
```typescript
import apiClient from '@/api/client'

const handleLogin = async () => {
  const response = await apiClient.post('/auth/login', {
    email: email.value,
    password: password.value
  })
  
  localStorage.setItem('token', response.data.token)
  router.push('/dashboard')
}
```

---

## 📝 Logging

### Log Levels
- **error**: Critical errors
- **warn**: Warnings
- **info**: Important events
- **http**: HTTP requests
- **debug**: Detailed debug info

### Log Files
Located in `server/logs/`:
- **all.log**: All events
- **error.log**: Errors only

### View Logs
```bash
# Real-time in console during development
tail -f server/logs/all.log
tail -f server/logs/error.log

# View last 50 lines
tail -50 server/logs/all.log
```

### Add Logging to Code
```typescript
import logger from './utils/logger'

logger.info('User registered')
logger.warn('Invalid email format')
logger.error('Database connection failed')
logger.debug('Detailed debug info')
```

---

## 🗄️ Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  email: string (unique, lowercase),
  password: string (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Example User Document
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "password": "$2a$10$...", // hashed
  "createdAt": "2024-04-24T12:00:00Z",
  "updatedAt": "2024-04-24T12:00:00Z"
}
```

---

## 🧪 Testing API Endpoints

### Using cURL
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Recovery
curl -X POST http://localhost:3000/api/auth/recover \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com"}'
```

### Using Postman
1. Create new request
2. Select POST method
3. URL: `http://localhost:3000/api/auth/register`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "email": "user@test.com",
  "password": "password123"
}
```

---

## 🐛 Debugging

### Backend Debugging
```bash
# Check TypeScript errors
cd server && npm run build

# Check logs
tail -f server/logs/all.log

# Test database connection
# Check MongoDB is running first
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb
```

### Frontend Debugging
```bash
# Open browser DevTools (F12)
# Check Network tab for API calls
# Check Console for errors
# Check Application > Storage for localStorage token

# Check Vite logs in terminal
# Check for TypeScript errors

# Test API directly in browser console
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(console.log)
```

### Common Issues

**MongoDB Connection Failed**
```bash
# Check if running
docker-compose ps

# Restart
docker-compose down && docker-compose up -d

# Check logs
docker-compose logs mongodb
```

**CORS Error**
```bash
# Check CORS_ORIGIN in server/.env matches client origin
# Default: http://localhost:5173

# Check backend logs
tail -f server/logs/all.log
```

**Token Invalid**
```bash
# Token might be expired
# Login again to get new token
# Check localStorage token in browser console
localStorage.getItem('token')
```

---

## 📋 Development Checklist

### Setup
- [ ] MongoDB running: `docker-compose ps`
- [ ] Backend running: `http://localhost:3000/health` returns OK
- [ ] Frontend running: `http://localhost:5173` loads
- [ ] Can see logs in `server/logs/`

### Testing
- [ ] Register new user
- [ ] Login with existing user
- [ ] Logout works
- [ ] Navbar shows auth state
- [ ] Password recovery flow works
- [ ] API errors show properly

### Before Commit
- [ ] No TypeScript errors: `npm run build` in both dirs
- [ ] No console errors in browser
- [ ] .env files are in .gitignore
- [ ] Logs are in .gitignore
- [ ] Clean up debug logs

---

## 🚀 Deployment Preparation

### Production Checklist
- [ ] Change JWT_SECRET in .env
- [ ] Change MongoDB credentials
- [ ] Set NODE_ENV=production
- [ ] Update CORS_ORIGIN to production domain
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Add email service for recovery
- [ ] Add input sanitization
- [ ] Update database backups
- [ ] Set up monitoring/alerts

### Build for Production
```bash
# Frontend
cd client
npm run build
# Output: dist/

# Backend
cd server
npm run build
# Output: dist/
```

---

## 📚 Project Files Reference

### Frontend Key Files
- `client/src/App.vue` - Root component, layout logic
- `client/src/router.ts` - Route definitions
- `client/src/api/client.ts` - Axios configuration
- `client/src/pages/Home.vue` - Landing page
- `client/src/pages/auth/Login.vue` - Login form
- `client/src/pages/auth/Register.vue` - Register form
- `client/src/pages/auth/Recover.vue` - Password recovery

### Backend Key Files
- `server/src/app.ts` - Express setup, CORS, middleware
- `server/src/config/database.ts` - MongoDB connection
- `server/src/models/User.ts` - User schema
- `server/src/routes/auth.ts` - Auth endpoints
- `server/src/utils/logger.ts` - Logger setup
- `server/.env` - Configuration
- `docker-compose.yml` - MongoDB container

---

## 💡 Tips & Tricks

### Quickly Reset Everything
```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d

# Clear frontend cache
cd client && rm -rf node_modules && npm install

# Clear backend
cd ../server && npm run build
```

### Monitor Logs Real-time
```bash
# All logs
tail -f server/logs/all.log

# Only errors
tail -f server/logs/error.log

# With timestamps
tail -f server/logs/all.log | grep INFO
```

### Test Token Manually
```bash
# Get token from login response
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Use in API call
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/protected-route
```

---

## 🆘 Quick Help

**Server won't start?**
- Check logs: `tail -f server/logs/error.log`
- Check port: `lsof -ti:3000`
- Kill process: `lsof -ti:3000 | xargs kill -9`

**Database won't connect?**
- Check MongoDB: `docker-compose ps`
- Check credentials: `server/.env`
- Check URI: `mongodb://admin:password123@localhost:27017/subly?authSource=admin`

**Frontend shows blank?**
- Check console (F12): Look for errors
- Check Network tab: Check API responses
- Check localStorage: Token might be invalid
- Refresh page: `Ctrl+Shift+R` (hard refresh)

---

**Happy coding! 🎉**
