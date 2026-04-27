import { Schema, model, Document, Types } from 'mongoose'

export interface ISubscription extends Document {
  userId: Types.ObjectId
  name: string
  price: number
  renewalDate: Date
  status: 'active' | 'ended'
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    name: { type: String, required: true },
    price: { type: Number, required: true },
    renewalDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
    },
  },
  { timestamps: true }
)

export default model<ISubscription>('Subscription', subscriptionSchema)