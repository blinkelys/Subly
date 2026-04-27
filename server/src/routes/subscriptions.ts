import { Router } from 'express'
import Subscription from '../models/Subscription'
import { isAuthorized } from '../middleware/auth'

const router = Router()

// GET all subscriptions
router.get('/', isAuthorized, async (req: any, res) => {
  try {
    const subs = await Subscription.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 })

    res.json(subs)
  } catch {
    res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }
})

// CREATE subscription
router.post('/', isAuthorized, async (req: any, res) => {
  try {
    const { name, price, renewalDate } = req.body

    const sub = await Subscription.create({
      userId: req.user.id,
      name,
      price,
      renewalDate,
      status: 'active',
    })

    res.status(201).json(sub)
  } catch {
    res.status(500).json({ error: 'Failed to create subscription' })
  }
})

// UPDATE subscription
router.put('/:id', isAuthorized, async (req: any, res) => {
  try {
    const updated = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id, // 🔒 ownership check
      },
      {
        name: req.body.name,
        price: req.body.price,
        renewalDate: req.body.renewalDate,
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

// DELETE subscription
router.delete('/:id', isAuthorized, async (req: any, res) => {
  try {
    const deleted = await Subscription.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!deleted) return res.status(404).json({ error: 'Not found' })

    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete subscription' })
  }
})

// END subscription (your PATCH /end route)
router.patch('/:id/end', isAuthorized, async (req: any, res) => {
  try {
    const updated = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      { status: 'ended' },
      { new: true }
    )

    if (!updated) return res.status(404).json({ error: 'Not found' })

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to end subscription' })
  }
})

export default router