import mongoose from 'mongoose'
import logger from '../utils/logger'

const connectDB = async () => {
  try {
    const {
      DB_HOST = 'localhost',
      DB_PORT = '27017',
      DB_USERNAME = 'admin',
      DB_PASSWORD = 'password123',
      DB_NAME = 'subly'
    } = process.env

    // Build MongoDB URI with authentication
    const mongoURI = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`

    await mongoose.connect(mongoURI, {
      retryWrites: true,
      w: 'majority'
    })

    logger.info(`✅ Database connected successfully at ${DB_HOST}:${DB_PORT}/${DB_NAME}`)
  } catch (error) {
    logger.error(`❌ Database connection failed: ${error}`)
    process.exit(1)
  }
}

export default connectDB
