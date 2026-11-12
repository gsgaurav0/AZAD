export type InquiryType = 'support' | 'warranty' | 'repair' | 'consultation' | 'newsletter' | 'general';
export type InquiryStatus = 'new' | 'in_progress' | 'resolved';
export type InquiryPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportInquiry {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  deviceModel?: string;
  serialNumber?: string;
  message: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  createdAt: string;
  adminNotes?: string;
  replySent?: string;
}

