import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import logger from './utils/logger'
import connectDB from './config/database'
import authRoutes from './routes/auth'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// ============= MIDDLEWARE =============

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  logger.http(`${req.method} ${req.path}`)
  next()
})

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ============= CORS CONFIGURATION =============
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

// Preflight requests
app.options('*', cors(corsOptions))

logger.info(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)

// ============= ROUTES =============

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// API routes
app.use('/api/auth', authRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`)
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// ============= ERROR HANDLING =============

app.use((err: any, req: Request, res: Response) => {
  logger.error(`Error: ${err.message}`)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

// ============= DATABASE & SERVER STARTUP =============

const startServer = async () => {
  try {
    // Connect to database
    await connectDB()

    // Start server
    app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`)
      logger.info(`📝 API Documentation: http://localhost:${PORT}/api`)
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    logger.error(`Failed to start server: ${error}`)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  mongoose.connection.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  mongoose.connection.close()
  process.exit(0)
})

// Start the server
startServer()

export default app
