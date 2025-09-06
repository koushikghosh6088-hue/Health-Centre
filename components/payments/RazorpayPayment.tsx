'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayPaymentProps {
  bookingId: string
  bookingType: 'APPOINTMENT' | 'TEST_BOOKING'
  amount: number
  onPaymentSuccess?: (paymentData: any) => void
  onPaymentError?: (error: any) => void
  disabled?: boolean
  children?: React.ReactNode
}

export function RazorpayPayment({
  bookingId,
  bookingType,
  amount,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  children
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false)

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Load Razorpay script if not already loaded
      const isRazorpayLoaded = await loadRazorpayScript()
      
      if (!isRazorpayLoaded) {
        throw new Error('Razorpay SDK failed to load')
      }

      // Create payment order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: bookingType,
          bookingId,
          amount,
        }),
      })

      const orderResult = await orderResponse.json()

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create payment order')
      }

      const { orderId, customerDetails, description, razorpayKeyId } = orderResult.data

      // Razorpay payment options
      const options = {
        key: razorpayKeyId,
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'HealthCare Diagnostic Centre',
        description,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on server
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyResult = await verifyResponse.json()

            if (verifyResult.success) {
              if (onPaymentSuccess) {
                onPaymentSuccess({
                  ...response,
                  ...verifyResult.data,
                })
              }
            } else {
              throw new Error(verifyResult.error || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            if (onPaymentError) {
              onPaymentError(error)
            }
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: {
          color: '#2563eb', // Blue theme matching our design
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            console.log('Payment modal dismissed')
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      }

      // Create Razorpay instance and open payment modal
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment initiation error:', error)
      setLoading(false)
      if (onPaymentError) {
        onPaymentError(error)
      } else {
        alert(error instanceof Error ? error.message : 'Payment failed. Please try again.')
      }
    }
  }

  return (
    <>
      {children ? (
        <div onClick={handlePayment}>
          {children}
        </div>
      ) : (
        <Button
          onClick={handlePayment}
          disabled={disabled || loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now - ₹{amount.toFixed(2)}
            </>
          )}
        </Button>
      )}
    </>
  )
}

export default RazorpayPayment
