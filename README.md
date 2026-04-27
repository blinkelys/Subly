# Subly - Subscription Management Platform

A full-stack subscription tracking and management application built with Vue 3, TypeScript, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- npm or yarn

### Setup Instructions

#### 1. Start MongoDB (Backend Database)

```bash
# From project root
docker-compose up -d

# Verify MongoDB is running
docker-compose ps
```

#### 2. Start Backend Server

```bash
cd server
npm install  # if not already installed
npm run dev
```

The backend will run on `http://localhost:3000`

#### 3. Start Frontend (in a new terminal)

```bash
cd client
npm install  # if not already installed
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📝 Project Structure

```
Subly/
├── client/                 # Vue 3 Frontend
│   ├── src/
│   │   ├── api/           # Axios client configuration
│   │   ├── components/    # Vue components (Navbar, Footer)
│   │   ├── pages/         # Page components
│   │   │   └── auth/      # Auth pages (Login, Register, Recover)
│   │   ├── App.vue        # Root component
│   │   ├── main.ts        # Entry point
│   │   ├── router.ts      # Vue Router config
│   │   └── style.css      # Tailwind CSS
│   ├── .env               # Client env variables
│   └── vite.config.ts     # Vite config
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── app.ts         # Express app setup
│   │   ├── config/        # Config files
│   │   │   └── database.ts # MongoDB connection
│   │   ├── models/        # Mongoose models
│   │   │   └── User.ts    # User schema
│   │   ├── routes/        # API routes
│   │   │   └── auth.ts    # Auth endpoints
│   │   └── utils/         # Utilities
│   │       └── logger.ts  # Winston logger
│   ├── .env               # Server env variables
│   └── package.json       # Dependencies
│
├── docker-compose.yml      # MongoDB container
├── BACKEND_SETUP.md       # Backend documentation
└── README.md              # This file
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=27017
DB_USERNAME=admin
DB_PASSWORD=password123
DB_NAME=subly

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=debug
LOG_DIR=./logs
```

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📚 API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Password Recovery
```
POST /api/auth/recover
{
  "email": "user@example.com"
}
```

#### Reset Password
```
POST /api/auth/reset-password
{
  "token": "recovery_token",
  "password": "newpassword123"
}
```

## 🛠️ Technologies

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Vue Router (SPA Routing)
- Axios (HTTP Client)
- Tailwind CSS (Styling)
- Vite (Build Tool)

### Backend
- Express.js
- TypeScript
- MongoDB & Mongoose
- JWT (Authentication)
- bcryptjs (Password Hashing)
- Winston (Logging)
- CORS
- Docker

## 📋 Features

### Frontend
- ✅ Responsive UI with Tailwind CSS
- ✅ Navbar with authentication state
- ✅ Footer with links
- ✅ Landing page with features showcase
- ✅ About page
- ✅ Login page with form validation
- ✅ Register page with password confirmation
- ✅ Password recovery flow
- ✅ Axios integration for API calls
- ✅ Error handling and user feedback

### Backend
- ✅ RESTful API endpoints
- ✅ User authentication with JWT
- ✅ Password hashing with bcryptjs
- ✅ MongoDB integration with Mongoose
- ✅ Comprehensive logging with Winston
- ✅ CORS configuration
- ✅ Error handling middleware
- ✅ Input validation
- ✅ Docker containerization
- ✅ Environment-based configuration

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- CORS protection
- Environment-based sensitive data
- Token expiration
- Input validation
- Secure database authentication

## 📖 Development

### Client Development
```bash
cd client
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Server Development
```bash
cd server
npm run dev        # Start with nodemon
npm run build      # Compile TypeScript
npm start          # Run compiled server
```

### Database Management
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs mongodb

# Remove all data
docker-compose down -v
```

## 🚨 Important Notes

### Before Deployment
1. Change `JWT_SECRET` to a strong random string
2. Change MongoDB credentials
3. Update `CORS_ORIGIN` to production domain
4. Enable HTTPS
5. Add rate limiting
6. Implement email service for password recovery
7. Add input sanitization
8. Set `NODE_ENV=production`
9. Use environment-specific configuration

### Logging
- Logs are stored in `server/logs/` directory
- Check `all.log` for all events
- Check `error.log` for errors only
- Console output in development

### Default Credentials
- **MongoDB Username**: admin
- **MongoDB Password**: password123
- **Database**: subly
- **Port**: 27017

## 🐛 Troubleshooting

### MongoDB won't connect
```bash
docker-compose down -v
docker-compose up -d
```

### Port already in use
Change PORT in .env or kill the process:
```bash
lsof -ti:3000 | xargs kill -9  # Port 3000
lsof -ti:5173 | xargs kill -9  # Port 5173
```

### TypeScript errors
```bash
npm run build  # Check for compile errors
```

## 📞 Support

For detailed backend setup information, see [BACKEND_SETUP.md](BACKEND_SETUP.md)

## 📄 License

ISC
