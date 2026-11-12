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
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  createAdminOrder: (order: Order) => Order;
  resetOrdersToDefault: () => void;
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
          id: 'azd-h01',
          slug: 'apex-pro-anc-wireless-headphones',
          name: 'Apex Pro ANC Wireless Headphones',
          subtitle: 'Custom 40mm Beryllium Drivers • 45h Battery • Spatial Audio',
          category: 'headphones',
          subcategory: 'Noise Cancelling',
          price: 18999,
          originalPrice: 24999,
          discountPercent: 24,
          isNew: true,
          isTrending: true,
          isFeatured: true,
          occasion: 'Work',
          rating: 4.9,
          reviewCount: 142,
          colors: [
            {
              name: 'Space Black',
              hex: '#111827',
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
            },
          ],
          sizes: [{ size: 'Standard Edition', inStock: true }],
          images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
          ],
          fabric: 'Aero-grade Aluminum & Memory Foam Lambskin',
          fit: 'Over-Ear Ergonomic Acoustic Seal • 280g',
          care: ['2-Year Total Care Warranty'],
          description: 'Engineered for true acoustic purity with custom beryllium drivers.',
          details: ['40mm Beryllium Drivers', 'Hybrid ANC'],
          returns: '15-day return policy',
          reviews: [],
        },
        selectedColor: 'Space Black',
        selectedSize: 'Standard Edition',
        quantity: 1,
      },
    ],
    subtotal: 18999,
    discount: 1899,
    shipping: 0,
    total: 17100,
    couponCode: 'MEWAK10',
    address: DEFAULT_ADDRESSES[0],
    paymentMethod: 'UPI',
    status: 'Shipped',
    trackingNumber: 'DELHIVERY-98127384',
    statusHistory: [
      { status: 'Placed', timestamp: '20 Oct 2026, 04:30 PM', note: 'Order verified & payment confirmed', completed: true },
      { status: 'Packed', timestamp: '21 Oct 2026, 11:15 AM', note: 'Inspected & packaged in shock-resistant security seal', completed: true },
      { status: 'Shipped', timestamp: '22 Oct 2026, 02:40 PM', note: 'In transit via Express Airway Delhivery', completed: true },
      { status: 'Out for Delivery', timestamp: 'Estimated 25 Oct 2026', note: 'Courier out for delivery', completed: false },
      { status: 'Delivered', timestamp: 'Estimated 25 Oct 2026', note: 'Safe doorstep handover', completed: false },
    ],
  },
  {
    id: 'AZD-719302',
    date: '14 Sep 2026',
    items: [
      {
        product: {
          id: 'azd-a01',
          slug: 'magdock-3-in-1-wireless-charging-stand',
          name: 'MagDock 3-in-1 Magnetic Wireless Stand',
          subtitle: 'Fast 15W Qi2 Stand for Phone, Watch & Earbuds',
          category: 'accessories',
          subcategory: 'Magnetic Docks',
          price: 5999,
          originalPrice: 7999,
          discountPercent: 25,
          isNew: true,
          isTrending: true,
          isFeatured: true,
          occasion: 'Work',
          rating: 4.9,
          reviewCount: 153,
          colors: [
            {
              name: 'Matte Space Black',
              hex: '#18181B',
              image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=1000&q=80',
            },
          ],
          sizes: [{ size: 'Desktop Stand', inStock: true }],
          images: [
            'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=1000&q=80',
          ],
          fabric: 'CNC Machined Aircraft Aluminum',
          fit: 'Weighted Base 420g',
          care: ['2-Year Power Warranty'],
          description: 'Single-cable magnetic charging station for Phone, Watch, and Earbuds.',
          details: ['Qi2 15W Wireless Fast Charging'],
          returns: '15-day return policy',
          reviews: [],
        },
        selectedColor: 'Matte Space Black',
        selectedSize: 'Desktop Stand',
        quantity: 1,
      },
    ],
    subtotal: 5999,
    discount: 0,
    shipping: 0,
    total: 5999,
    address: DEFAULT_ADDRESSES[1],
    paymentMethod: 'Credit/Debit Card',
    status: 'Delivered',
    trackingNumber: 'BLUEDART-44910283',
    statusHistory: [
      { status: 'Placed', timestamp: '14 Sep 2026, 09:12 AM', note: 'Order placed', completed: true },
      { status: 'Packed', timestamp: '14 Sep 2026, 03:00 PM', note: 'Packaged & dispatched', completed: true },
      { status: 'Shipped', timestamp: '15 Sep 2026, 10:30 AM', note: 'Dispatched via BlueDart Air', completed: true },
      { status: 'Out for Delivery', timestamp: '17 Sep 2026, 08:45 AM', note: 'Out for delivery in Gurugram', completed: true },
      { status: 'Delivered', timestamp: '17 Sep 2026, 01:20 PM', note: 'Delivered to recipient', completed: true },
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
        email: 'siddharth@mewak.tech',
        memberTier: 'Titanium VIP Member',
        joinedDate: 'August 2024',
      },
      savedAddresses: DEFAULT_ADDRESSES,
      orders: DEFAULT_ORDERS,

      login: (phone: string, name = 'Valued Member') => {
        set({
          isLoggedIn: true,
          user: {
            name: name || 'Valued Member',
            phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
            email: 'member@mewak.tech',
            memberTier: 'Titanium VIP Member',
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

      addAddress: (newAddr) => {
        const id = `addr-${Date.now()}`;
        const created: Address = { ...newAddr, id };
        set((state) => {
          let addresses = state.savedAddresses;
          if (created.isDefault) {
            addresses = addresses.map((a) => ({ ...a, isDefault: false }));
          }
          return { savedAddresses: [...addresses, created] };
        });
        return created;
      },

      updateAddress: (updated) => {
        set((state) => {
          let addresses = state.savedAddresses.map((a) => (a.id === updated.id ? updated : a));
          if (updated.isDefault) {
            addresses = addresses.map((a) => (a.id === updated.id ? a : { ...a, isDefault: false }));
          }
          return { savedAddresses: addresses };
        });
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
        const trackingNumber = `BLUEDART-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const timeStr = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const newOrder: Order = {
          ...orderData,
          id: orderId,
          date: dateStr,
          status: 'Placed',
          trackingNumber,
          statusHistory: [
            {
              status: 'Placed',
              timestamp: `${dateStr}, ${timeStr}`,
              note: 'Order confirmed & queued for hardware diagnostic inspection',
              completed: true,
            },
            {
              status: 'Packed',
              timestamp: 'Pending',
              note: 'Tamper-evident anti-static packaging & serial registration',
              completed: false,
            },
            {
              status: 'Shipped',
              timestamp: 'Pending',
              note: 'Handed to express air logistics',
              completed: false,
            },
            {
              status: 'Out for Delivery',
              timestamp: 'Pending',
              note: 'Local hub courier dispatch',
              completed: false,
            },
            {
              status: 'Delivered',
              timestamp: 'Pending',
              note: 'Direct doorstep delivery',
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
        const target = orders.find((o) => o.id === orderId);
        if (!target || !reason) return false;
        return true;
      },

      updateOrderStatus: (orderId: string, newStatus: OrderStatus, customNote?: string) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const timestamp = `${dateStr}, ${timeStr}`;

        const statusSequence: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
        const targetIndex = statusSequence.indexOf(newStatus);

        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;

            let updatedHistory = o.statusHistory.map((step) => {
              if (newStatus === 'Cancelled') {
                return step;
              }
              const stepIndex = statusSequence.indexOf(step.status);
              if (stepIndex <= targetIndex) {
                return {
                  ...step,
                  completed: true,
                  timestamp: step.completed && step.timestamp !== 'Pending' ? step.timestamp : timestamp,
                  note: step.status === newStatus && customNote ? customNote : step.note,
                };
              }
              return { ...step, completed: false, timestamp: 'Pending' };
            });

            if (newStatus === 'Cancelled') {
              updatedHistory = [
                ...updatedHistory,
                {
                  status: 'Cancelled',
                  timestamp,
                  note: customNote || 'Order cancelled by administration',
                  completed: true,
                },
              ];
            }

            return {
              ...o,
              status: newStatus,
              statusHistory: updatedHistory,
            };
          }),
        }));
      },

      updateOrder: (orderId: string, updates: Partial<Order>) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o)),
        }));
      },

      deleteOrder: (orderId: string) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        }));
      },

      createAdminOrder: (order: Order) => {
        set((state) => ({
          orders: [order, ...state.orders],
        }));
        return order;
      },

      resetOrdersToDefault: () => {
        set({ orders: DEFAULT_ORDERS });
      },
    }),
    {
      name: 'mewak_auth_storage',
    }
  )
);
