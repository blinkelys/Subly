import { Schema, model, Document, Types } from 'mongoose'


export interface ISubscription extends Document {
  userId?: Types.ObjectId // For personal subscriptions
  familyId?: Types.ObjectId // For family subscriptions
  name: string
  price: number
  paymentDay: number // Day of month (1-31)
  category: string
  scheduledEndDate?: Date // When the subscription will actually end
  status: 'active' | 'ending' | 'ended'
}


const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    familyId: { type: Schema.Types.ObjectId, ref: 'Family' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    paymentDay: { type: Number, required: true, min: 1, max: 31 },
    category: { type: String, default: 'other' },
    scheduledEndDate: { type: Date },
    status: {
      type: String,
      enum: ['active', 'ending', 'ended'],
      default: 'active',
    },
  },
  { timestamps: true }
)

export default model<ISubscription>('Subscription', subscriptionSchema)