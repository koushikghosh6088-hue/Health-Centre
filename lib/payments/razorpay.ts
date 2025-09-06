import Razorpay from 'razorpay'
import { generateOrderId, generateReceiptId } from '@/lib/utils'

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface CreateOrderData {
  amount: number // in paise (multiply by 100)
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export interface RazorpayOrderResponse {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt?: string
  status: string
  attempts: number
  notes: Record<string, string>
  created_at: number
}

export async function createRazorpayOrder(data: CreateOrderData): Promise<RazorpayOrderResponse> {
  try {
    const order = await razorpay.orders.create({
      amount: data.amount,
      currency: data.currency || 'INR',
      receipt: data.receipt || generateReceiptId(),
      notes: data.notes || {},
    })

    return order as RazorpayOrderResponse
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw new Error('Failed to create payment order')
  }
}

export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  try {
    const crypto = require('crypto')
    const body = orderId + '|' + paymentId
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    return expectedSignature === signature
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return false
  }
}

export async function getRazorpayPayment(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Error fetching Razorpay payment:', error)
    throw new Error('Failed to fetch payment details')
  }
}

export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
) {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount, // Optional: partial refund
      notes: notes || {},
    })
    return refund
  } catch (error) {
    console.error('Error processing Razorpay refund:', error)
    throw new Error('Failed to process refund')
  }
}

// Client-side payment options for frontend
export function createRazorpayPaymentOptions({
  orderId,
  amount,
  currency = 'INR',
  name,
  description,
  customerEmail,
  customerPhone,
  customerName,
}: {
  orderId: string
  amount: number
  currency?: string
  name: string
  description: string
  customerEmail: string
  customerPhone: string
  customerName: string
}) {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    amount: amount,
    currency: currency,
    name: name,
    description: description,
    order_id: orderId,
    handler: function (response: any) {
      // This will be handled by the frontend
      console.log('Payment successful:', response)
    },
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone,
    },
    theme: {
      color: '#2563eb', // Blue theme matching our design
    },
    modal: {
      ondismiss: function () {
        console.log('Payment dismissed')
      },
    },
  }
}

export default razorpay
