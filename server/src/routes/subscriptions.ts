import { Router } from 'express'
import Subscription from '../models/Subscription'
import { isAuthenticated } from '../middleware/auth'

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
    const { name, price, paymentDate } = req.body

    const sub = await Subscription.create({
      userId: req.session.userId,
      name,
      price,
      paymentDate,
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
        userId: req.session.userId, //  ownership check
      },
      {
        name: req.body.name,
        price: req.body.price,
        paymentDate: req.body.paymentDate,
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

// END subscription (flag as ending, not ended)
router.patch('/:id/end', isAuthenticated, async (req: any, res) => {
  try {
    const updated = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.session.userId,
      },
      { status: 'ending' },
      { new: true }
    )

    if (!updated) return res.status(404).json({ error: 'Not found' })

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to end subscription' })
  }
})

export default router