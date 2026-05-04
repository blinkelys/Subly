import { Schema, model, Document, Types } from 'mongoose'

export interface IFamily extends Document {
  name: string
  ownerId: Types.ObjectId
  members: Array<{
    userId: Types.ObjectId
    role: 'owner' | 'admin' | 'member'
    joinedAt: Date
  }>
  invites: Array<{
    email: string
    code: string
    createdAt: Date
    expiresAt: Date
  }>
}

const familySchema = new Schema<IFamily>(
  {
    name: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member'],
          default: 'member',
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    invites: [
      {
        email: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
)

export default model<IFamily>('Family', familySchema)
