import { Schema, model, Document, Types } from 'mongoose'


export interface ISubscription extends Document {
  userId: Types.ObjectId
  name: string
  price: number
  paymentDate: Date
  status: 'active' | 'ending' | 'ended'
}


const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'ending', 'ended'],
      default: 'active',
    },
  },
  { timestamps: true }
)

export default model<ISubscription>('Subscription', subscriptionSchema)