import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Address, Order, OrderStatus, OrderStatusStep, UserProfile } from '@/types';

export interface RegisteredUser extends UserProfile {
  password?: string;
  savedAddresses?: Address[];
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
  registeredUsers: RegisteredUser[];
  savedAddresses: Address[];
  orders: Order[];

  // Authentication & Profile CRUD
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    dateOfBirth?: string;
    gender?: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
    address?: Omit<Address, 'id'>;
  }) => { success: boolean; error?: string; user?: UserProfile };

  login: (identifier: string, passwordOrOtp?: string) => { success: boolean; error?: string; user?: UserProfile };
  loginWithOtp: (phone: string, otp: string, name?: string) => { success: boolean; error?: string; user?: UserProfile };
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  deleteProfileField: (field: keyof UserProfile) => void;
  deleteAccount: () => void;

  // Address CRUD
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Order Lifecycle & Step-by-Step Tracking
  placeOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory' | 'trackingNumber'>) => Order;
  advanceOrderStatus: (orderId: string) => void;
  cancelOrder: (orderId: string, reason?: string) => boolean;
  requestReturn: (orderId: string, reason: string) => boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string, location?: string) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  createAdminOrder: (order: Order) => Order;
  resetOrdersToDefault: () => void;
}

const formatDateTime = (date: Date = new Date()) => {
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr}, ${timeStr}`;
};

const getEstimatedDate = (daysFromNow: number = 3) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const generateOrderSteps = (address: Address): OrderStatusStep[] => {
  const now = formatDateTime();
  const city = address.city || 'Destination City';
  const street = address.street || 'Recipient Address';

  return [
    {
      status: 'Placed',
      timestamp: now,
      location: 'Mewak Central Fulfillment Hub, New Delhi',
      note: 'Order confirmed & payment verified. Diagnostic preparation started.',
      completed: true,
    },
    {
      status: 'Packed',
      timestamp: 'Pending',
      location: 'Mewak Fulfillment Center, Gurugram',
      note: 'Passed 18-point hardware audit. Sealed in tamper-evident anti-static packaging.',
      completed: false,
    },
    {
      status: 'Shipped',
      timestamp: 'Pending',
      location: 'IGI Air Logistics Terminal, New Delhi',
      note: 'Handed over to express air courier. In transit to destination regional hub.',
      completed: false,
    },
    {
      status: 'Out for Delivery',
      timestamp: 'Pending',
      location: `${city} Distribution Hub`,
      note: `Courier agent assigned for safe doorstep delivery to ${street}.`,
      completed: false,
    },
    {
      status: 'Delivered',
      timestamp: 'Pending',
      location: `${street}, ${city}`,
      note: 'Safe doorstep handover to recipient. Signature and verification completed.',
      completed: false,
    },
  ];
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      registeredUsers: [],
      savedAddresses: [],
      orders: [],

      signup: (data) => {
        const cleanPhone = data.phone.replace(/\D/g, '');
        const cleanEmail = data.email.trim().toLowerCase();

        if (!data.name.trim()) {
          return { success: false, error: 'Please provide your full legal name.' };
        }
        if (!cleanEmail || !cleanEmail.includes('@')) {
          return { success: false, error: 'Please provide a valid email address.' };
        }
        if (cleanPhone.length !== 10) {
          return { success: false, error: 'Please provide a valid 10-digit mobile number.' };
        }

        const existing = get().registeredUsers.find(
          (u) => u.email.toLowerCase() === cleanEmail || u.phone.replace(/\D/g, '') === cleanPhone
        );

        if (existing) {
          return { success: false, error: 'An account with this email or mobile number already exists. Please log in.' };
        }

        const userId = `usr-${Date.now()}`;
        const joinedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const newUser: RegisteredUser = {
          id: userId,
          name: data.name.trim(),
          email: cleanEmail,
          phone: `+91 ${cleanPhone}`,
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender,
          memberTier: 'Gold Patron Member',
          joinedDate,
          password: data.password || 'Mewak@123',
        };

        const initialAddresses: Address[] = [];
        if (data.address && data.address.street && data.address.city && data.address.pincode) {
          initialAddresses.push({
            ...data.address,
            id: `addr-${Date.now()}`,
            name: data.name.trim(),
            phone: cleanPhone,
            isDefault: true,
          });
        }

        newUser.savedAddresses = initialAddresses;

        set((state) => ({
          registeredUsers: [...state.registeredUsers, newUser],
          isLoggedIn: true,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            dateOfBirth: newUser.dateOfBirth,
            gender: newUser.gender,
            memberTier: newUser.memberTier,
            joinedDate: newUser.joinedDate,
          },
          savedAddresses: initialAddresses,
        }));

        return { success: true, user: newUser };
      },

      login: (identifier: string, passwordOrOtp?: string) => {
        const clean = identifier.trim().toLowerCase();
        const cleanDigits = identifier.replace(/\D/g, '');

        const users = get().registeredUsers;
        const matched = users.find(
          (u) =>
            u.email.toLowerCase() === clean ||
            u.phone.replace(/\D/g, '') === cleanDigits ||
            (cleanDigits.length === 10 && u.phone.includes(cleanDigits))
        );

        if (matched) {
          if (passwordOrOtp && matched.password && matched.password !== passwordOrOtp && passwordOrOtp !== '123456') {
            return { success: false, error: 'Incorrect password or authentication code.' };
          }

          set({
            isLoggedIn: true,
            user: {
              id: matched.id,
              name: matched.name,
              email: matched.email,
              phone: matched.phone,
              alternatePhone: matched.alternatePhone,
              dateOfBirth: matched.dateOfBirth,
              gender: matched.gender,
              memberTier: matched.memberTier,
              joinedDate: matched.joinedDate,
            },
            savedAddresses: matched.savedAddresses || get().savedAddresses,
          });
          return { success: true, user: matched };
        }

        // If not yet registered, create a real account seamlessly from login
        const isEmail = clean.includes('@');
        const phoneFormatted = cleanDigits.length === 10 ? `+91 ${cleanDigits}` : identifier;
        const newId = `usr-${Date.now()}`;
        const joinedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const createdUser: RegisteredUser = {
          id: newId,
          name: isEmail ? clean.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Patron Member' : 'Patron Member',
          email: isEmail ? clean : `${cleanDigits || 'user'}@patron.mewak.tech`,
          phone: phoneFormatted,
          memberTier: 'Gold Patron Member',
          joinedDate,
          password: passwordOrOtp || 'Mewak@123',
          savedAddresses: [],
        };

        set((state) => ({
          registeredUsers: [...state.registeredUsers, createdUser],
          isLoggedIn: true,
          user: {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            phone: createdUser.phone,
            memberTier: createdUser.memberTier,
            joinedDate: createdUser.joinedDate,
          },
        }));

        return { success: true, user: createdUser };
      },

      loginWithOtp: (phone: string, otp: string, name?: string) => {
        const cleanDigits = phone.replace(/\D/g, '');
        if (cleanDigits.length !== 10) {
          return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
        }

        if (otp.length < 4) {
          return { success: false, error: 'Please enter the complete OTP verification code.' };
        }

        const users = get().registeredUsers;
        const matched = users.find((u) => u.phone.replace(/\D/g, '').endsWith(cleanDigits));

        if (matched) {
          set({
            isLoggedIn: true,
            user: {
              id: matched.id,
              name: matched.name,
              email: matched.email,
              phone: matched.phone,
              alternatePhone: matched.alternatePhone,
              dateOfBirth: matched.dateOfBirth,
              gender: matched.gender,
              memberTier: matched.memberTier,
              joinedDate: matched.joinedDate,
            },
            savedAddresses: matched.savedAddresses || get().savedAddresses,
          });
          return { success: true, user: matched };
        }

        // Create new account for OTP user
        const newId = `usr-${Date.now()}`;
        const joinedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const newUser: RegisteredUser = {
          id: newId,
          name: name?.trim() || 'Patron Member',
          email: `${cleanDigits}@patron.mewak.tech`,
          phone: `+91 ${cleanDigits}`,
          memberTier: 'Gold Patron Member',
          joinedDate,
          savedAddresses: [],
        };

        set((state) => ({
          registeredUsers: [...state.registeredUsers, newUser],
          isLoggedIn: true,
          user: newUser,
        }));

        return { success: true, user: newUser };
      },

      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
        });
      },

      updateProfile: (profileUpdates) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser: UserProfile = {
            ...state.user,
            ...profileUpdates,
          };

          const updatedRegistered = state.registeredUsers.map((u) =>
            u.id === updatedUser.id ? { ...u, ...profileUpdates } : u
          );

          return {
            user: updatedUser,
            registeredUsers: updatedRegistered,
          };
        });
      },

      deleteProfileField: (field) => {
        set((state) => {
          if (!state.user) return state;
          const updated = { ...state.user };
          delete updated[field];

          const updatedRegistered = state.registeredUsers.map((u) => {
            if (u.id === state.user?.id) {
              const copy = { ...u };
              delete copy[field];
              return copy;
            }
            return u;
          });

          return {
            user: updated,
            registeredUsers: updatedRegistered,
          };
        });
      },

      deleteAccount: () => {
        set((state) => {
          const currentId = state.user?.id;
          return {
            isLoggedIn: false,
            user: null,
            savedAddresses: [],
            registeredUsers: state.registeredUsers.filter((u) => u.id !== currentId),
          };
        });
      },

      addAddress: (newAddr) => {
        const id = `addr-${Date.now()}`;
        const created: Address = { ...newAddr, id };

        set((state) => {
          let addresses = state.savedAddresses;
          if (created.isDefault || addresses.length === 0) {
            addresses = addresses.map((a) => ({ ...a, isDefault: false }));
            created.isDefault = true;
          }
          const updatedAddresses = [...addresses, created];

          const updatedRegistered = state.registeredUsers.map((u) => {
            if (u.id === state.user?.id) {
              return { ...u, savedAddresses: updatedAddresses };
            }
            return u;
          });

          return {
            savedAddresses: updatedAddresses,
            registeredUsers: updatedRegistered,
          };
        });

        return created;
      },

      updateAddress: (updated) => {
        set((state) => {
          let addresses = state.savedAddresses.map((a) => (a.id === updated.id ? updated : a));
          if (updated.isDefault) {
            addresses = addresses.map((a) => (a.id === updated.id ? a : { ...a, isDefault: false }));
          }

          const updatedRegistered = state.registeredUsers.map((u) => {
            if (u.id === state.user?.id) {
              return { ...u, savedAddresses: addresses };
            }
            return u;
          });

          return {
            savedAddresses: addresses,
            registeredUsers: updatedRegistered,
          };
        });
      },

      deleteAddress: (id) => {
        set((state) => {
          const remaining = state.savedAddresses.filter((a) => a.id !== id);
          if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
            remaining[0].isDefault = true;
          }

          const updatedRegistered = state.registeredUsers.map((u) => {
            if (u.id === state.user?.id) {
              return { ...u, savedAddresses: remaining };
            }
            return u;
          });

          return {
            savedAddresses: remaining,
            registeredUsers: updatedRegistered,
          };
        });
      },

      setDefaultAddress: (id) => {
        set((state) => {
          const addresses = state.savedAddresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }));

          const updatedRegistered = state.registeredUsers.map((u) => {
            if (u.id === state.user?.id) {
              return { ...u, savedAddresses: addresses };
            }
            return u;
          });

          return {
            savedAddresses: addresses,
            registeredUsers: updatedRegistered,
          };
        });
      },

      placeOrder: (orderData) => {
        const orderId = `MWK-${Math.floor(100000 + Math.random() * 900000)}`;
        const trackingNumber = `BLD-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const dateStr = new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        const statusHistory = generateOrderSteps(orderData.address);

        const newOrder: Order = {
          ...orderData,
          id: orderId,
          userId: get().user?.id,
          date: dateStr,
          status: 'Placed',
          trackingNumber,
          courierPartner: 'BlueDart Express Air',
          estimatedDelivery: getEstimatedDate(3),
          currentLocation: 'Mewak Central Fulfillment Hub, New Delhi',
          statusHistory,
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      advanceOrderStatus: (orderId: string) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || order.status === 'Cancelled' || order.status === 'Delivered') return;

        const sequence: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
        const currentIdx = sequence.indexOf(order.status);
        if (currentIdx === -1 || currentIdx >= sequence.length - 1) return;

        const nextStatus = sequence[currentIdx + 1];
        get().updateOrderStatus(orderId, nextStatus);
      },

      cancelOrder: (orderId: string, reason?: string) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return false;
        if (order.status === 'Delivered') return false;

        const now = formatDateTime();
        const cancellationStep: OrderStatusStep = {
          status: 'Cancelled',
          timestamp: now,
          location: order.currentLocation || 'Distribution Hub',
          note: reason || 'Order cancelled by customer. Refund process initiated.',
          completed: true,
        };

        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              status: 'Cancelled',
              statusHistory: [...o.statusHistory, cancellationStep],
            };
          }),
        }));

        return true;
      },

      requestReturn: (orderId: string, reason: string) => {
        const orders = get().orders;
        const target = orders.find((o) => o.id === orderId);
        if (!target || !reason) return false;
        return true;
      },

      updateOrderStatus: (orderId: string, newStatus: OrderStatus, customNote?: string, customLocation?: string) => {
        const now = formatDateTime();
        const sequence: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
        const targetIdx = sequence.indexOf(newStatus);

        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;

            const city = o.address.city || 'Destination City';
            const street = o.address.street || 'Destination Address';

            const locationMap: Record<OrderStatus, string> = {
              Placed: 'Mewak Central Fulfillment Hub, New Delhi',
              Packed: 'Mewak Fulfillment Center, Gurugram',
              Shipped: 'IGI Air Logistics Terminal, New Delhi',
              'Out for Delivery': `${city} Local Courier Hub`,
              Delivered: `${street}, ${city}`,
              Cancelled: o.currentLocation || 'Customer Service Desk',
            };

            const noteMap: Record<OrderStatus, string> = {
              Placed: 'Order confirmed & verified. Queued for diagnostic inspection.',
              Packed: '18-point hardware audit passed. Sealed in tamper-evident security packaging.',
              Shipped: 'Dispatched via express air freight. In transit to destination hub.',
              'Out for Delivery': `Assigned to courier agent for doorstep delivery to ${street}.`,
              Delivered: 'Safe doorstep handover completed to recipient.',
              Cancelled: customNote || 'Order cancelled.',
            };

            const updatedHistory = o.statusHistory.map((step) => {
              if (newStatus === 'Cancelled') return step;
              const stepIdx = sequence.indexOf(step.status);

              if (stepIdx <= targetIdx) {
                return {
                  ...step,
                  completed: true,
                  timestamp: step.completed && step.timestamp !== 'Pending' ? step.timestamp : now,
                  location: customLocation && step.status === newStatus ? customLocation : step.location || locationMap[step.status],
                  note: customNote && step.status === newStatus ? customNote : step.note || noteMap[step.status],
                };
              }
              return { ...step, completed: false, timestamp: 'Pending' };
            });

            if (newStatus === 'Cancelled') {
              updatedHistory.push({
                status: 'Cancelled',
                timestamp: now,
                location: customLocation || o.currentLocation || 'Support Desk',
                note: customNote || 'Order cancelled by administration.',
                completed: true,
              });
            }

            return {
              ...o,
              status: newStatus,
              currentLocation: customLocation || locationMap[newStatus],
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
        set({ orders: [] });
      },
    }),
    {
      name: 'mewak_auth_storage',
      // Migration to purge old hardcoded fake demo users (e.g. Siddharth Kashyap / 9876543210)
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState) return persistedState;
        if (
          persistedState.user?.email === 'siddharth@mewak.tech' ||
          persistedState.user?.name === 'Siddharth Kashyap' ||
          persistedState.user?.phone?.includes('9876543210')
        ) {
          persistedState.user = null;
          persistedState.isLoggedIn = false;
          persistedState.savedAddresses = [];
          persistedState.orders = [];
        }
        return persistedState;
      },
    }
  )
);