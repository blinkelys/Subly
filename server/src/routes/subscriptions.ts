import { Router } from 'express'
import Subscription from '../models/Subscription'
import { isAuthenticated } from '../middleware/auth'
import { getNextPaymentDate } from '../utils/subscriptionHelpers'

const router = Router()

// GET all subscriptions
router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const subs = await Subscription.find({
      userId: req.session.userId,
    }).sort({ createdAt: -1 })

    res.json(subs)
  } catch {
    res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }
})

// CREATE subscription
router.post('/', isAuthenticated, async (req: any, res) => {
  try {
    const { name, price, paymentDay, category } = req.body

    const sub = await Subscription.create({
      userId: req.session.userId,
      name,
      price,
      paymentDay: parseInt(paymentDay) || 1,
      category: category || 'Other',
      status: 'active',
    })

    res.status(201).json(sub)
  } catch {
    res.status(500).json({ error: 'Failed to create subscription' })
  }
})

// UPDATE subscription
router.put('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const updated = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.session.userId,
      },
      {
        name: req.body.name,
        price: req.body.price,
        paymentDay: req.body.paymentDay ? parseInt(req.body.paymentDay) : undefined,
        category: req.body.category,
        status: req.body.status,
      },
      { new: true }
    )

    if (!updated) return res.status(404).json({ error: 'Not found' })

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to update subscription' })
  }
})


// No hard delete. Use PATCH /:id/end to flag as ending.

// END subscription (flag as ending and calculate scheduled end date)
router.patch('/:id/end', isAuthenticated, async (req: any, res) => {
  try {
    const sub = await Subscription.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    })

    if (!sub) return res.status(404).json({ error: 'Not found' })

    // Calculate when this subscription will actually end (next payment date)
    const scheduledEndDate = getNextPaymentDate(sub.paymentDay)

    const updated = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.session.userId,
      },
      {
        status: 'ending',
        scheduledEndDate,
      },
      { new: true }
    )

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to end subscription' })
  }
})

// MARK as ended (transition from ending to ended when scheduled end date arrives)
router.patch('/:id/mark-ended', isAuthenticated, async (req: any, res) => {
  try {
    const updated = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.session.userId,
        status: 'ending',
      },
      { status: 'ended' },
      { new: true }
    )

    if (!updated) return res.status(404).json({ error: 'Not found or not in ending status' })

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to mark subscription as ended' })
  }
})

export default router