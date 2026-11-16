export type Category = 'headphones' | 'phones' | 'smartwatches' | 'accessories';
export type Occasion = 'Gaming' | 'Fitness' | 'Work' | 'Everyday';

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface ProductSize {
  size: string;
  inStock: boolean;
  stockCount?: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  helpfulCount: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: Category;
  subcategory: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  isNew: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  occasion: Occasion;
  rating: number;
  reviewCount: number;
  colors: ProductColor[];
  sizes: ProductSize[];
  images: string[];
  fabric: string;
  fit: string;
  care: string[];
  description: string;
  details: string[];
  returns: string;
  reviews: Review[];
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

export type OrderStatus =
  | 'Payment Pending'
  | 'Placed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Return Approved'
  | 'Return Rejected'
  | 'Refunded';

export interface OrderStatusStep {
  status: OrderStatus;
  timestamp: string;
  note: string;
  location?: string;
  completed: boolean;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  address: Address;
  paymentMethod: 'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Cash on Delivery' | 'Razorpay' | 'Online Payment (Razorpay)';
  paymentId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  status: OrderStatus;
  statusHistory: OrderStatusStep[];
  trackingNumber: string;
  courierPartner?: string;
  estimatedDelivery?: string;
  currentLocation?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
  memberTier: string;
  joinedDate: string;
  avatarUrl?: string;
  headline?: string;
  company?: string;
  industry?: string;
  bio?: string;
  gstNumber?: string;
  preferredDeliveryTime?: 'Anytime' | 'Morning (9 AM - 1 PM)' | 'Afternoon (1 PM - 6 PM)' | 'Evening (6 PM - 9 PM)' | 'Weekends Only';
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  role?: 'customer' | 'admin' | 'superadmin';
  communicationEmail?: boolean;
  communicationSms?: boolean;
}

export interface FilterState {
  category?: Category | 'all';
  subcategories: string[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  fabrics: string[];
  fits: string[];
  occasions: Occasion[];
  minDiscount: number;
  minRating: number;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}
