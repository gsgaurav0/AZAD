import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Returns a configured Razorpay server SDK client instance.
 * Throws an error if credentials are missing.
 */
export function getRazorpayClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured in environment variables.');
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Verifies Razorpay payment signature using HMAC-SHA256 algorithm.
 * Formula: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured.');
  }

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  try {
    const a = Buffer.from(generatedSignature, 'utf-8');
    const b = Buffer.from(signature, 'utf-8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return generatedSignature === signature;
  }
}
