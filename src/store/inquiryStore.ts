import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SupportInquiry, InquiryStatus, InquiryType, InquiryPriority } from '@/types/inquiry';
import { getBrowserClient } from '@/lib/supabase/client';

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
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

interface InquiryState {
  inquiries: SupportInquiry[];
  isLoading: boolean;

  fetchInquiries: () => Promise<void>;
  addInquiry: (inquiry: Omit<SupportInquiry, 'id' | 'createdAt' | 'status'>) => Promise<SupportInquiry>;
  updateInquiryStatus: (id: string, status: InquiryStatus) => Promise<void>;
  updateInquiryPriority: (id: string, priority: InquiryPriority) => Promise<void>;
  addAdminNote: (id: string, note: string) => Promise<void>;
  sendReply: (id: string, replyMessage: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const useInquiryStore = create<InquiryState>()(
  persist(
    (set, get) => ({
      inquiries: DEFAULT_INQUIRIES,
      isLoading: false,

      fetchInquiries: async () => {
        if (typeof window === 'undefined') return;
        set({ isLoading: true });

        try {
          const apiRes = await fetch('/api/admin/inquiries');
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.inquiries && apiData.inquiries.length > 0) {
              set({ inquiries: apiData.inquiries, isLoading: false });
              return;
            }
          }

          // Fallback to direct client
          const supabase = getBrowserClient();
          const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const mapped: SupportInquiry[] = data.map((d: any) => ({
              id: d.id,
              type: d.type,
              name: d.name,
              email: d.email,
              phone: d.phone || undefined,
              subject: d.subject,
              deviceModel: d.device_model || undefined,
              serialNumber: d.serial_number || undefined,
              message: d.message,
              status: d.status,
              priority: d.priority,
              createdAt: d.created_at,
              adminNotes: d.admin_notes || undefined,
              replySent: d.reply_sent || undefined,
            }));

            set({ inquiries: mapped, isLoading: false });
            return;
          }
        } catch (err) {
          console.warn('Inquiry fetch notice:', err);
        }

        set({ isLoading: false });
      },

      addInquiry: async (inquiryData) => {
        const id = `INQ-${Math.floor(1000 + Math.random() * 9000)}`;
        const newInquiry: SupportInquiry = {
          ...inquiryData,
          id,
          status: 'new',
          createdAt: new Date().toISOString(),
        };

        try {
          await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newInquiry),
          });
        } catch (err) {
          console.warn('Inquiry API dispatch notice:', err);
        }

        set((state) => ({
          inquiries: [newInquiry, ...state.inquiries],
        }));

        return newInquiry;
      },

      updateInquiryStatus: async (id, status) => {
        set((state) => ({
          inquiries: state.inquiries.map((inq) =>
            inq.id === id ? { ...inq, status } : inq
          ),
        }));

        try {
          await fetch('/api/admin/inquiries', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
          });
        } catch (err) {
          console.warn('API update inquiry status error:', err);
        }
      },

      updateInquiryPriority: async (id, priority) => {
        set((state) => ({
          inquiries: state.inquiries.map((inq) =>
            inq.id === id ? { ...inq, priority } : inq
          ),
        }));

        try {
          await fetch('/api/admin/inquiries', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, priority }),
          });
        } catch (err) {
          console.warn('API update inquiry priority error:', err);
        }
      },

      addAdminNote: async (id, note) => {
        set((state) => ({
          inquiries: state.inquiries.map((inq) =>
            inq.id === id ? { ...inq, adminNotes: note } : inq
          ),
        }));

        try {
          await fetch('/api/admin/inquiries', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, adminNotes: note }),
          });
        } catch (err) {
          console.warn('API add admin note error:', err);
        }
      },

      sendReply: async (id, replyMessage) => {
        set((state) => ({
          inquiries: state.inquiries.map((inq) =>
            inq.id === id
              ? { ...inq, replySent: replyMessage, status: 'resolved' as InquiryStatus }
              : inq
          ),
        }));

        try {
          await fetch('/api/admin/inquiries', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, replySent: replyMessage, status: 'resolved' }),
          });
        } catch (err) {
          console.warn('API send reply error:', err);
        }
      },

      deleteInquiry: async (id) => {
        set((state) => ({
          inquiries: state.inquiries.filter((inq) => inq.id !== id),
        }));

        try {
          await fetch(`/api/admin/inquiries?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.warn('API delete inquiry error:', err);
        }
      },

      resetToDefaults: async () => {
        set({ inquiries: DEFAULT_INQUIRIES });
      },
    }),
    {
      name: 'mewak_inquiries_storage',
    }
  )
);
