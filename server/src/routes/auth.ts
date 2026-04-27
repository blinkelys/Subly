import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import logger from '../utils/logger'

const router = Router()

// Helper function to generate JWT
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'secret'
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  
  return jwt.sign({ id: userId }, secret, { expiresIn } as any)
}

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      logger.warn(`Register attempt with missing fields: ${email}`)
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    if (password.length < 8) {
      logger.warn(`Register attempt with weak password for email: ${email}`)
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      logger.warn(`Register attempt with existing email: ${email}`)
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      })
    }

    // Create new user
    const user = new User({ email, password })
    await user.save()

    logger.info(`User registered successfully: ${email}`)

    // Generate token
    const token = generateToken(user._id.toString())

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    })
  } catch (error) {
    logger.error(`Registration error: ${error}`)
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    })
  }
})

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      logger.warn(`Login attempt with missing fields: ${email}`)
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Find user and select password
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for email: ${email}`)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    logger.info(`User logged in successfully: ${email}`)

    // Generate token
    const token = generateToken(user._id.toString())

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    })
  } catch (error) {
    logger.error(`Login error: ${error}`)
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    })
  }
})

// Recover endpoint (send recovery email - simulated)
router.post('/recover', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      logger.warn('Recover attempt with missing email')
      return res.status(400).json({
        success: false,
        message: 'Please provide an email'
      })
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      // Security: Don't reveal if email exists
      logger.warn(`Recover attempt for non-existent email: ${email}`)
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a recovery link will be sent'
      })
    }

    // Generate recovery token (valid for 1 hour)
    const secret = process.env.JWT_SECRET || 'secret'
    const recoveryToken = jwt.sign(
      { id: user._id },
      secret,
      { expiresIn: '1h' } as any
    )

    logger.info(`Recovery email sent for: ${email}`)

    res.status(200).json({
      success: true,
      message: 'Recovery email sent',
      // In production, send email with recovery link
      // For now, return token for testing
      recoveryToken: recoveryToken
    })
  } catch (error) {
    logger.error(`Recovery error: ${error}`)
    res.status(500).json({
      success: false,
      message: 'Recovery request failed. Please try again.'
    })
  }
})

// Reset password endpoint
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      logger.warn('Reset password attempt with missing fields')
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password'
      })
    }

    if (password.length < 8) {
      logger.warn('Reset password attempt with weak password')
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      })
    }

    // Verify token
    let decoded: any
    try {
      const secret = process.env.JWT_SECRET || 'secret'
      decoded = jwt.verify(token, secret)
    } catch (error) {
      logger.warn('Invalid or expired recovery token')
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired recovery token'
      })
    }

    // Find user and update password
    const user = await User.findById(decoded.id)
    if (!user) {
      logger.warn('User not found for password reset')
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.password = password
    await user.save()

    logger.info(`Password reset successfully for: ${user.email}`)

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    })
  } catch (error) {
    logger.error(`Password reset error: ${error}`)
    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again.'
    })
  }
})

export default router
