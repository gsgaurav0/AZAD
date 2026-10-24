import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Address, Order, OrderStatus } from '@/types';

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  memberTier: string;
  joinedDate: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
  savedAddresses: Address[];
  orders: Order[];

  // Actions
  login: (phone: string, name?: string) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  placeOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory' | 'trackingNumber'>) => Order;
  requestReturn: (orderId: string, reason: string) => boolean;
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-01',
    name: 'Siddharth Kashyap',
    phone: '9876543210',
    street: 'B-402, Imperial Heights, Golf Course Road',
    locality: 'Sector 54',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    type: 'Home',
    isDefault: true,
  },
  {
    id: 'addr-02',
    name: 'Siddharth Kashyap',
    phone: '9876543210',
    street: 'Tower 4, Level 11, Cyber City Business Hub',
    locality: 'DLF Phase 2',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122008',
    type: 'Work',
    isDefault: false,
  },
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'MWK-829104',
    date: '20 Oct 2026',
    items: [
      {
        product: {
          id: 'mwk-w01',
          slug: 'silk-pleated-maxi-dress',
          name: 'Pleated Mulberry Silk Maxi Dress',
          subtitle: 'Flowing silhouette with gathered neckline',
          category: 'women',
          subcategory: 'Dresses',
          price: 4999,
          originalPrice: 7999,
          discountPercent: 38,
          isNew: true,
          isTrending: true,
          isFeatured: true,
          occasion: 'Party',
          rating: 4.9,
          reviewCount: 84,
          colors: [{ name: 'Ochre Gold', hex: '#9A8029', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80' }],
          sizes: [{ size: 'S', inStock: true }],
          images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80'],
          fabric: '100% Mulberry Silk',
          fit: 'Fluid relaxed drape',
          care: ['Dry clean only'],
          description: 'A poetic masterpiece crafted from ethereal mulberry silk.',
          details: ['Keyhole back'],
          returns: '15-day doorstep pickup',
          reviews: [],
        },
        selectedColor: 'Ochre Gold',
        selectedSize: 'S',
        quantity: 1,
      },
    ],
    subtotal: 4999,
    discount: 500,
    shipping: 0,
    total: 4499,
    couponCode: 'WELCOME50',
    address: DEFAULT_ADDRESSES[0],
    paymentMethod: 'UPI',
    status: 'Shipped',
    trackingNumber: 'DELHIVERY-98127384',
    statusHistory: [
      { status: 'Placed', timestamp: '20 Oct 2026, 04:30 PM', note: 'Order verified & payment confirmed', completed: true },
      { status: 'Packed', timestamp: '21 Oct 2026, 11:15 AM', note: 'Handcrafted in signature gift packaging', completed: true },
      { status: 'Shipped', timestamp: '22 Oct 2026, 02:40 PM', note: 'In transit via Express Airway Delhivery', completed: true },
      { status: 'Out for Delivery', timestamp: 'Estimated 25 Oct 2026', note: 'Delivery courier assigned', completed: false },
      { status: 'Delivered', timestamp: 'Estimated 25 Oct 2026', note: 'Safe doorstep handover', completed: false },
    ],
  },
  {
    id: 'MWK-761922',
    date: '12 Sep 2026',
    items: [
      {
        product: {
          id: 'mwk-a01',
          slug: 'handcrafted-full-grain-leather-tote',
          name: 'Florence Artisan Leather Tote',
          subtitle: 'Vegetable-tanned full-grain leather',
          category: 'accessories',
          subcategory: 'Bags & Totes',
          price: 4999,
          originalPrice: 7999,
          discountPercent: 38,
          isNew: true,
          isTrending: true,
          isFeatured: true,
          occasion: 'Work',
          rating: 4.9,
          reviewCount: 168,
          colors: [{ name: 'Rich Cognac', hex: '#8B4513', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80' }],
          sizes: [{ size: 'One Size', inStock: true }],
          images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'],
          fabric: 'Italian Cowhide',
          fit: '38cm x 32cm',
          care: ['Beeswax balm'],
          description: 'Sculpted from thick vegetable-tanned leather.',
          details: ['Solid brass hardware'],
          returns: '15-day return policy',
          reviews: [],
        },
        selectedColor: 'Rich Cognac',
        selectedSize: 'One Size',
        quantity: 1,
      },
    ],
    subtotal: 4999,
    discount: 0,
    shipping: 0,
    total: 4999,
    address: DEFAULT_ADDRESSES[0],
    paymentMethod: 'Credit/Debit Card',
    status: 'Delivered',
    trackingNumber: 'BLUEDART-55198273',
    statusHistory: [
      { status: 'Placed', timestamp: '12 Sep 2026, 10:20 AM', note: 'Order verified', completed: true },
      { status: 'Packed', timestamp: '12 Sep 2026, 04:00 PM', note: 'Gift packaged', completed: true },
      { status: 'Shipped', timestamp: '13 Sep 2026, 09:30 AM', note: 'Dispatched via BlueDart Express', completed: true },
      { status: 'Out for Delivery', timestamp: '15 Sep 2026, 11:00 AM', note: 'Agent on route', completed: true },
      { status: 'Delivered', timestamp: '15 Sep 2026, 02:15 PM', note: 'Delivered to resident with OTP validation', completed: true },
    ],
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: true,
      user: {
        name: 'Siddharth Kashyap',
        phone: '+91 98765 43210',
        email: 'siddharth@kashyap.com',
        memberTier: 'Gold Connoisseur',
        joinedDate: 'August 2024',
      },
      savedAddresses: DEFAULT_ADDRESSES,
      orders: DEFAULT_ORDERS,

      login: (phone: string, name = 'Valued Patron') => {
        set({
          isLoggedIn: true,
          user: {
            name: name || 'Valued Patron',
            phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
            email: 'patron@mewak.fashion',
            memberTier: 'Gold Connoisseur',
            joinedDate: 'October 2026',
          },
        });
      },

      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
        });
      },

      updateProfile: (profile) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...profile } : null,
        }));
      },

      addAddress: (addressData) => {
        const newAddress: Address = {
          ...addressData,
          id: `addr-${Date.now()}`,
          isDefault: addressData.isDefault || get().savedAddresses.length === 0,
        };

        set((state) => {
          let updatedList = state.savedAddresses;
          if (newAddress.isDefault) {
            updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
          }
          return { savedAddresses: [newAddress, ...updatedList] };
        });

        return newAddress;
      },

      updateAddress: (updated) => {
        set((state) => ({
          savedAddresses: state.savedAddresses.map((a) =>
            a.id === updated.id
              ? updated
              : updated.isDefault
              ? { ...a, isDefault: false }
              : a
          ),
        }));
      },

      deleteAddress: (id) => {
        set((state) => ({
          savedAddresses: state.savedAddresses.filter((a) => a.id !== id),
        }));
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          savedAddresses: state.savedAddresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },

      placeOrder: (orderData) => {
        const orderId = `MWK-${Math.floor(100000 + Math.random() * 900000)}`;
        const dateStr = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const timeStr = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const newOrder: Order = {
          ...orderData,
          id: orderId,
          date: dateStr,
          status: 'Placed',
          trackingNumber: `DELHIVERY-${Math.floor(10000000 + Math.random() * 90000000)}`,
          statusHistory: [
            {
              status: 'Placed',
              timestamp: `${dateStr}, ${timeStr}`,
              note: 'Order placed & payment verified successfully',
              completed: true,
            },
            {
              status: 'Packed',
              timestamp: 'Expected within 24 hours',
              note: 'Awaiting bespoke quality inspection & packaging',
              completed: false,
            },
            {
              status: 'Shipped',
              timestamp: 'Expected within 48 hours',
              note: 'Dispatched via Express Courier',
              completed: false,
            },
            {
              status: 'Out for Delivery',
              timestamp: 'Expected in 3-4 days',
              note: 'Courier agent will arrive at your address',
              completed: false,
            },
            {
              status: 'Delivered',
              timestamp: 'Expected in 4-5 days',
              note: 'Doorstep contactless delivery',
              completed: false,
            },
          ],
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      requestReturn: (orderId: string, reason: string) => {
        const orders = get().orders;
        const exists = orders.some((o) => o.id === orderId);
        if (!exists) return false;
        // In real app, update return request state
        return true;
      },
    }),
    {
      name: 'mewak_auth_storage',
    }
  )
);
