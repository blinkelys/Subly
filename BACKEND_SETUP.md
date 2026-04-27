# Subly Backend Setup Guide

## Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- npm

## Installation

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start MongoDB with Docker
```bash
# From project root
docker-compose up -d

# Verify MongoDB is running
docker-compose ps
```

MongoDB will be available at:
- **Connection String**: `mongodb://admin:password123@localhost:27017/subly?authSource=admin`
- **Admin Username**: `admin`
- **Admin Password**: `password123`

### 3. Configure Environment Variables
The `.env` file is already configured. You can customize it:
```bash
# Copy from .env.example if needed
cp .env.example .env
```

### 4. Start the Server

**Development Mode** (with hot reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET http://localhost:3000/health
```

### Authentication Routes

#### Register
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

#### Login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

#### Password Recovery
```
POST http://localhost:3000/api/auth/recover
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Recovery email sent",
  "recoveryToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Reset Password
```
POST http://localhost:3000/api/auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "password": "newpassword123"
}
```

## Logging

Logs are automatically created in the `./logs` directory:
- **all.log** - All log levels
- **error.log** - Errors only
- **Console** - Real-time output in terminal

Log levels: `error`, `warn`, `info`, `http`, `debug`

## CORS Configuration

CORS is configured to allow requests from `http://localhost:5173` (client).

To allow other origins, update the `CORS_ORIGIN` environment variable:
```env
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

## Database Connection

MongoDB connection details:
- **Host**: localhost
- **Port**: 27017
- **Username**: admin
- **Password**: password123
- **Database**: subly
- **Auth Source**: admin

Connection string: `mongodb://admin:password123@localhost:27017/subly?authSource=admin`

## Stopping Services

```bash
# Stop MongoDB
docker-compose down

# Remove volumes (deletes data)
docker-compose down -v

# View logs
docker-compose logs mongodb
```

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB container is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001

# Or kill the process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Clear All Data
```bash
# Remove all containers and volumes
docker-compose down -v
docker-compose up -d
```

## Security Notes

⚠️ **IMPORTANT**: Before deploying to production:
1. Change `JWT_SECRET` in `.env` to a strong random string
2. Change MongoDB credentials
3. Update `CORS_ORIGIN` to your production domain
4. Enable HTTPS
5. Use environment-specific `.env` files
6. Add rate limiting
7. Add request validation middleware
8. Enable MongoDB authentication in production

## Project Structure

```
server/
├── src/
│   ├── app.ts              # Main application file
│   ├── config/
│   │   └── database.ts      # MongoDB connection
│   ├── models/
│   │   └── User.ts          # User schema
│   ├── routes/
│   │   └── auth.ts          # Authentication routes
│   └── utils/
│       └── logger.ts        # Winston logger setup
├── .env                     # Environment variables
├── .env.example             # Example env file
└── package.json             # Dependencies
```
