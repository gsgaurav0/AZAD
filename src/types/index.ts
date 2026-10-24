export type Category = 'men' | 'women' | 'kids' | 'accessories';
export type Occasion = 'Casual' | 'Party' | 'Ethnic' | 'Work';

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

export type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';

export interface OrderStatusStep {
  status: OrderStatus;
  timestamp: string;
  note: string;
  completed: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  address: Address;
  paymentMethod: 'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Cash on Delivery';
  paymentId?: string;
  status: OrderStatus;
  statusHistory: OrderStatusStep[];
  trackingNumber: string;
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
