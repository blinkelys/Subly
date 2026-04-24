import winston from 'winston'
import fs from 'fs'
import path from 'path'

// Ensure logs directory exists
const logsDir = process.env.LOG_DIR || './logs'
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Define log levels with colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
}

winston.addColors(colors)

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // Error file transport
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: winston.format.uncolorize()
  }),
  
  // All logs file transport
  new winston.transports.File({
    filename: path.join(logsDir, 'all.log'),
    format: winston.format.uncolorize()
  })
]

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports
})

export default logger
