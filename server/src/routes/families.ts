import { Router } from 'express'
import Family from '../models/Family'
import { isAuthenticated } from '../middleware/auth'
import { randomBytes } from 'crypto'

const router = Router()

// Generate invite code
const generateInviteCode = () => randomBytes(16).toString('hex')

// GET user's families
router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const families = await Family.find({
      'members.userId': req.session.userId,
    })
      .populate('ownerId', 'username email')
      .populate('members.userId', 'username email')

    res.json(families)
  } catch {
    res.status(500).json({ error: 'Failed to fetch families' })
  }
})

// GET single family
router.get('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const family = await Family.findOne({
      _id: req.params.id,
      'members.userId': req.session.userId,
    })
      .populate('ownerId', 'username email')
      .populate('members.userId', 'username email')

    if (!family) return res.status(404).json({ error: 'Family not found' })

    res.json(family)
  } catch {
    res.status(500).json({ error: 'Failed to fetch family' })
  }
})

// CREATE family
router.post('/', isAuthenticated, async (req: any, res) => {
  try {
    const { name } = req.body

    const family = await Family.create({
      name,
      ownerId: req.session.userId,
      members: [
        {
          userId: req.session.userId,
          role: 'owner',
        },
      ],
    })

    await family.populate('ownerId', 'username email')
    await family.populate('members.userId', 'username email')

    res.status(201).json(family)
  } catch {
    res.status(500).json({ error: 'Failed to create family' })
  }
})

// UPDATE family (name only)
router.put('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const family = await Family.findOne({
      _id: req.params.id,
      ownerId: req.session.userId, // Only owner can update
    })

    if (!family) return res.status(403).json({ error: 'Not authorized' })

    family.name = req.body.name
    await family.save()
    await family.populate('ownerId', 'username email')
    await family.populate('members.userId', 'username email')

    res.json(family)
  } catch {
    res.status(500).json({ error: 'Failed to update family' })
  }
})

// DELETE family
router.delete('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const family = await Family.findOne({
      _id: req.params.id,
      ownerId: req.session.userId, // Only owner can delete
    })

    if (!family) return res.status(403).json({ error: 'Not authorized' })

    await Family.deleteOne({ _id: req.params.id })

    res.json({ message: 'Family deleted' })
  } catch {
    res.status(500).json({ error: 'Failed to delete family' })
  }
})

// INVITE user to family
router.post('/:id/invite', isAuthenticated, async (req: any, res) => {
  try {
    const { email } = req.body

    const family = await Family.findOne({
      _id: req.params.id,
      $or: [
        { ownerId: req.session.userId },
        { 'members.userId': req.session.userId, 'members.role': 'admin' },
      ],
    })

    if (!family) return res.status(403).json({ error: 'Not authorized' })

    const code = generateInviteCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Invite expires in 7 days

    family.invites.push({
      email,
      code,
      createdAt: new Date(),
      expiresAt,
    })

    await family.save()

    res.json({
      code,
      expiresAt,
      message: `Invite sent to ${email}`,
    })
  } catch {
    res.status(500).json({ error: 'Failed to send invite' })
  }
})

// ACCEPT invite
router.post('/invite/:code/accept', isAuthenticated, async (req: any, res) => {
  try {
    const family = await Family.findOne({
      'invites.code': req.params.code,
    })

    if (!family) return res.status(404).json({ error: 'Invite not found' })

    const inviteIndex = family.invites.findIndex((inv) => inv.code === req.params.code)

    if (inviteIndex === -1) return res.status(404).json({ error: 'Invite not found' })

    const invite = family.invites[inviteIndex]

    // Check if invite is expired
    if (new Date() > invite.expiresAt) {
      return res.status(400).json({ error: 'Invite expired' })
    }

    // Check if user is already a member
    const isMember = family.members.some((m) => m.userId.toString() === req.session.userId)

    if (isMember) return res.status(400).json({ error: 'Already a member' })

    // Add user to family
    family.members.push({
      userId: req.session.userId as any,
      role: 'member',
      joinedAt: new Date(),
    })

    // Remove the invite
    family.invites.splice(inviteIndex, 1)

    await family.save()
    await family.populate('ownerId', 'username email')
    await family.populate('members.userId', 'username email')

    res.json(family)
  } catch {
    res.status(500).json({ error: 'Failed to accept invite' })
  }
})

// REMOVE member from family
router.patch('/:id/members/:memberId/remove', isAuthenticated, async (req: any, res) => {
  try {
    const family = await Family.findOne({
      _id: req.params.id,
      ownerId: req.session.userId, // Only owner can remove members
    })

    if (!family) return res.status(403).json({ error: 'Not authorized' })

    family.members = family.members.filter(
      (m) => m.userId.toString() !== req.params.memberId
    )

    await family.save()
    await family.populate('ownerId', 'username email')
    await family.populate('members.userId', 'username email')

    res.json(family)
  } catch {
    res.status(500).json({ error: 'Failed to remove member' })
  }
})

// UPDATE member role
router.patch('/:id/members/:memberId/role', isAuthenticated, async (req: any, res) => {
  try {
    const { role } = req.body

    const family = await Family.findOne({
      _id: req.params.id,
      ownerId: req.session.userId, // Only owner can change roles
    })

    if (!family) return res.status(403).json({ error: 'Not authorized' })

    const member = family.members.find((m) => m.userId.toString() === req.params.memberId)

    if (!member) return res.status(404).json({ error: 'Member not found' })

    member.role = role

    await family.save()
    await family.populate('ownerId', 'username email')
    await family.populate('members.userId', 'username email')

    res.json(family)
  } catch {
    res.status(500).json({ error: 'Failed to update member role' })
  }
})

// LEAVE family
router.post('/:id/leave', isAuthenticated, async (req: any, res) => {
  try {
    const family = await Family.findOne({
      _id: req.params.id,
      'members.userId': req.session.userId,
    })

    if (!family) return res.status(404).json({ error: 'Family not found' })

    // Can't leave if you're the only owner
    const owners = family.members.filter((m) => m.role === 'owner')
    if (owners.length === 1 && owners[0].userId.toString() === req.session.userId) {
      return res.status(400).json({ error: 'Cannot leave as the only owner' })
    }

    family.members = family.members.filter(
      (m) => m.userId.toString() !== req.session.userId
    )

    await family.save()

    res.json({ message: 'Left family' })
  } catch {
    res.status(500).json({ error: 'Failed to leave family' })
  }
})

export default router
