import { Router } from 'express'
import Subscription from '../models/Subscription'
import { isAuthenticated } from '../middleware/auth'
import { getNextPaymentDate } from '../utils/subscriptionHelpers'
import Family from '../models/Family'

const router = Router()

const getUserFamilyIds = async (userId: any) => {
  const families = await Family.find({ 'members.userId': userId }).select('_id').lean()
  return families.map((family) => family._id)
}

// GET all subscriptions
router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const { familyId } = req.query

    let query: any = {}

    if (familyId) {
      const family = await Family.findOne({
        _id: familyId,
        'members.userId': req.session.userId,
      })

      if (!family) return res.status(403).json({ error: 'Not a member of this family' })

      query.familyId = familyId
    } else {
      const familyIds = await getUserFamilyIds(req.session.userId)
      query = {
        $or: [
          { userId: req.session.userId },
          { familyId: { $in: familyIds } },
        ],
      }
    }

    const subs = await Subscription.find(query).populate('familyId', 'name').sort({ createdAt: -1 })

    res.json(subs)
  } catch {
    res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }
})

// CREATE subscription
router.post('/', isAuthenticated, async (req: any, res) => {
  try {
    const { name, price, paymentDay, category, familyId } = req.body

    let subscriptionData: any = {
      name,
      price,
      paymentDay: parseInt(paymentDay) || 1,
      category: category || 'Other',
      status: 'active',
    }

    if (familyId) {
      const family = await Family.findOne({
        _id: familyId,
        'members.userId': req.session.userId,
      })

      if (!family) return res.status(403).json({ error: 'Not a member of this family' })

      subscriptionData.familyId = familyId
    } else {
      subscriptionData.userId = req.session.userId
    }

    const sub = await Subscription.create(subscriptionData)
    const populatedSub = await Subscription.findById(sub._id).populate('familyId', 'name')

    res.status(201).json(populatedSub)
  } catch {
    res.status(500).json({ error: 'Failed to create subscription' })
  }
})

// UPDATE subscription
router.put('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const familyIds = await getUserFamilyIds(req.session.userId)

    const updated = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { userId: req.session.userId },
          { familyId: { $in: familyIds } },
        ],
      },
      {
        name: req.body.name,
        price: req.body.price,
        paymentDay: req.body.paymentDay ? parseInt(req.body.paymentDay) : undefined,
        category: req.body.category,
        status: req.body.status,
      },
      { new: true }
    ).populate('familyId', 'name')

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
    const familyIds = await getUserFamilyIds(req.session.userId)

    const sub = await Subscription.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.session.userId },
        { familyId: { $in: familyIds } },
      ],
    })

    if (!sub) return res.status(404).json({ error: 'Not found' })

    const scheduledEndDate = getNextPaymentDate(sub.paymentDay)

    const updated = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { userId: req.session.userId },
          { familyId: { $in: familyIds } },
        ],
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
    const familyIds = await getUserFamilyIds(req.session.userId)

    const updated = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'ending',
        $or: [
          { userId: req.session.userId },
          { familyId: { $in: familyIds } },
        ],
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