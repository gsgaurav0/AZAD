export type CouponDiscountType = 'percentage' | 'flat';

export interface Coupon {
  id: string;
  code: string; // e.g. "MEWAK10", "WELCOME50", "VIP1000"
  description: string; // User-facing description e.g. "10% off storewide on all flagship hardware"
  discountType: CouponDiscountType;
  discountValue: number; // e.g. 10 (for 10%) or 500 (for ₹500 flat)
  minOrderValue?: number; // Minimum cart subtotal required to apply
  maxDiscount?: number; // Max discount cap for percentage discounts (e.g. ₹3,000)
  usageLimit?: number; // Maximum total times this coupon can be redeemed
  usageCount: number; // Current redemption count
  isActive: boolean; // Whether the coupon is currently redeemable by shoppers
  expiresAt?: string; // Optional expiry date string (YYYY-MM-DD or formatted)
  createdAt: string; // Creation timestamp
}

