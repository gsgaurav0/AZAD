import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SupportInquiry, InquiryStatus, InquiryType, InquiryPriority } from '@/types/inquiry';

export const DEFAULT_INQUIRIES: SupportInquiry[] = [
  {
    id: 'INQ-9482',
    type: 'warranty',
    name: 'Vikramaditya Sen',
    email: 'v.sen@acoustics.org',
    phone: '+91 98201 44892',
    subject: 'Apex Pro Studio: Left driver planar transducer low volume',
    deviceModel: 'Mewak Apex Pro Studio ANC (Obsidian Black)',
    serialNumber: 'MWK-APX-2025-9941',
    message: 'Hello Mewak Engineering team. I have been using the Apex Pro Studio daily in our mastering studio. Recently, after about 14 months of daily use, the left planar channel output dropped noticeably below calibration. I have verified with multiple DACs and 3.5mm cables. Requesting warranty replacement under the 2-Year Total Care Guarantee.',
    status: 'new',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 'INQ-9477',
    type: 'consultation',
    name: 'Ananya Deshpande',
    email: 'ananya@vanguard-design.io',
    phone: '+91 98450 11200',
    subject: 'Enterprise Studio Order: 24 Monolithic Desk Hubs & Headsets',
    deviceModel: 'MagDock 3-in-1 GaN Hub & Apex Studio',
    message: 'We are outfitting our new hardware research laboratory in Bengaluru. We would like to acquire 24 units of the MagDock 140W GaN stations along with customized corporate serial allocations. Can you provide enterprise billing and expedited delivery timelines?',
    status: 'new',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  {
    id: 'INQ-9460',
    type: 'support',
    name: 'Kabir Oberoi',
    email: 'kabir.o@techflow.dev',
    phone: '+91 99100 88219',
    subject: 'Firmware Update & LDAC 990kbps codec handshake on Linux workstation',
    deviceModel: 'Mewak Titanium One 5G & Apex Pro',
    message: 'Hi team. When pairing the Apex Pro over Bluetooth on Ubuntu 24.04 with PipeWire, LDAC defaults to 660kbps instead of 990kbps. Is there a Linux command-line configuration or firmware profile to lock 990kbps high-fidelity bitrate?',
    status: 'in_progress',
    priority: 'normal',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
    adminNotes: 'Transferred to Audio Firmware Engineering team.',
    replySent: 'Hello Kabir, our audio engineering team has verified PipeWire config for 990kbps. Please check sample rate lock in /etc/pipewire/media-session.d.',
  },
  {
    id: 'INQ-9421',
    type: 'repair',
    name: 'Dr. Rohan Nambiar',
    email: 'rohan.nambiar@aiims.edu',
    phone: '+91 94471 22910',
    subject: 'Doorstep Sapphire crystal evaluation completed',
    deviceModel: 'Mewak Chrono Ultra 49mm Titanium Watch',
    serialNumber: 'MWK-CHR-8812-401',
    message: 'Just wanted to confirm the technician arrived on time in South Delhi and completed the optical sensor recalibration under warranty. Outstanding customer care.',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: 'INQ-9410',
    type: 'newsletter',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@gmail.com',
    subject: 'Private Collector Newsletter Subscription',
    message: 'Subscribed to Mewak Private Hardware Allocations and prototype releases from storefront newsletter.',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

const STORAGE_KEY = 'mewak_support_inquiries';
const SYNC_EVENT = 'mewak_inquiries_sync';

function notifyInquiriesChange() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mewak_inquiries_channel');
      channel.postMessage({ type: 'INQUIRIES_UPDATED', timestamp: Date.now() });
      channel.close();
    }
  } catch (err) {
    console.warn('Cross-tab inquiries broadcast error:', err);
  }
}

interface InquiryState {
  inquiries: SupportInquiry[];

  // Actions
  addInquiry: (
    inquiryData: Omit<SupportInquiry, 'id' | 'createdAt' | 'status'> & {
      id?: string;
      status?: InquiryStatus;
      priority?: InquiryPriority;
    }
  ) => SupportInquiry;
  updateInquiryStatus: (id: string, status: InquiryStatus, note?: string) => void;
  replyToInquiry: (id: string, replyText: string) => void;
  deleteInquiry: (id: string) => void;
  resetToDefaults: () => void;
}

export const useInquiryStore = create<InquiryState>()(
  persist(
    (set, get) => ({
      inquiries: DEFAULT_INQUIRIES,

      addInquiry: (inquiryData) => {
        const id = inquiryData.id || `INQ-${Math.floor(1000 + Math.random() * 9000)}`;
        const newInquiry: SupportInquiry = {
          ...inquiryData,
          id,
          status: inquiryData.status || 'new',
          priority: inquiryData.priority || 'normal',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          inquiries: [newInquiry, ...state.inquiries],
        }));

        notifyInquiriesChange();
        return newInquiry;
      },

      updateInquiryStatus: (id, status, note) => {
        set((state) => ({
          inquiries: state.inquiries.map((inq) =>
            inq.id === id
              ? {
                  ...inq,
                  status,
                  ...(note ? { adminNotes: note } : {}),
                }
              : inq
          ),
        }));
        notifyInquiriesChange();
      },

      replyToInquiry: (id, replyText) => {
        set((state) => ({
          inquiries: state.inquiries.map((inq) =>
            inq.id === id
              ? {
                  ...inq,
                  status: 'in_progress',
                  replySent: replyText,
                }
              : inq
          ),
        }));
        notifyInquiriesChange();
      },

      deleteInquiry: (id) => {
        set((state) => ({
          inquiries: state.inquiries.filter((inq) => inq.id !== id),
        }));
        notifyInquiriesChange();
      },

      resetToDefaults: () => {
        set({ inquiries: DEFAULT_INQUIRIES });
        notifyInquiriesChange();
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      useInquiryStore.persist.rehydrate();
    }
  });

  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('mewak_inquiries_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'INQUIRIES_UPDATED') {
          useInquiryStore.persist.rehydrate();
        }
      };
    } catch {
      // Ignore
    }
  }

  window.addEventListener(SYNC_EVENT, () => {
    useInquiryStore.persist.rehydrate();
  });
}

