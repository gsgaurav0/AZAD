'use client';

import React, { useState, useMemo } from 'react';
import {
  Mail,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Reply,
  ShieldCheck,
  Send,
  Eye,
  Filter,
  Plus,
  RotateCcw,
  Sparkles,
  Phone,
  User,
  Cpu,
} from 'lucide-react';
import { useInquiryStore } from '@/store/inquiryStore';
import { useUIStore } from '@/store/uiStore';
import { SupportInquiry, InquiryStatus, InquiryType } from '@/types/inquiry';

export default function AdminInquiriesTab() {
  const { inquiries, updateInquiryStatus, replyToInquiry, deleteInquiry, addInquiry, resetToDefaults } =
    useInquiryStore();
  const addToast = useUIStore((state) => state.addToast);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<InquiryType | 'all'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<SupportInquiry | null>(null);
  const [replyText, setReplyText] = useState('');

  // Filtered inquiries
  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
      if (typeFilter !== 'all' && inq.type !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          inq.name.toLowerCase().includes(q) ||
          inq.email.toLowerCase().includes(q) ||
          inq.subject.toLowerCase().includes(q) ||
          (inq.deviceModel || '').toLowerCase().includes(q) ||
          (inq.serialNumber || '').toLowerCase().includes(q) ||
          inq.message.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [inquiries, statusFilter, typeFilter, searchQuery]);

  const newCount = inquiries.filter((i) => i.status === 'new').length;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;

    replyToInquiry(selectedInquiry.id, replyText.trim());
    addToast(`Dispatched response to ${selectedInquiry.email}`, 'success');
    setSelectedInquiry((prev) => (prev ? { ...prev, status: 'in_progress', replySent: replyText.trim() } : null));
    setReplyText('');
  };

  const handleSimulateTestEmail = () => {
    const test = addInquiry({
      name: 'Rohan Varma',
      email: 'rohan.varma@studio.audio',
      phone: '+91 98331 99012',
      subject: 'Warranty Assistance: Apex Pro planar driver calibration',
      deviceModel: 'Mewak Apex Pro Studio ANC Headphones',
      serialNumber: `MWK-APX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'warranty',
      priority: 'urgent',
      message: 'Hello, I submitted an evaluation request through the tech support portal. Please let me know when a technician can visit our studio for transducer testing.',
    });
    addToast(`Generated simulated incoming customer email #${test.id}`, 'info');
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Urgent</span>;
      case 'high':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">High</span>;
      default:
        return <span className="bg-zinc-100 text-zinc-700 text-[10px] font-medium px-2 py-0.5 rounded uppercase">Normal</span>;
    }
  };

  const getStatusBadge = (s: InquiryStatus) => {
    switch (s) {
      case 'new':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> New</span>;
      case 'in_progress':
        return <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> In Progress</span>;
      default:
        return <span className="bg-zinc-100 text-zinc-700 text-[10px] font-medium px-2 py-0.5 rounded uppercase flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Control Actions */}
      <div className="bg-white border border-[#E5E0D8] p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] bg-[#9A8029]/10 px-2.5 py-0.5 rounded font-bold">
              CUSTOMER CONCIERGE & EMAILS
            </span>
            {newCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full animate-bounce">
                {newCount} UNREAD
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2B1A16]">
            Received Support Inquiries & Emails
          </h2>
          <p className="text-xs text-[#2B1A16]/70 mt-1 max-w-2xl leading-relaxed">
            All customer messages, warranty claims, and consultation requests submitted from Mewak Tech Support and Contact pages land here in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSimulateTestEmail}
            className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE8DD] border border-[#DDD2C0] text-[#2B1A16] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9A8029]" />
            <span>Simulate Incoming Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset inbox to demo customer emails?')) {
                resetToDefaults();
                addToast('Reset support inbox to demo emails', 'info');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-[#DDD2C0] text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E0D8] p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#2B1A16]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patron name, email, serial number, device model or keywords..."
              className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-[#2B1A16] outline-none"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0 text-xs font-semibold">
            {(['all', 'new', 'in_progress', 'resolved'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl border whitespace-nowrap capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                    : 'bg-white border-[#DDD2C0] text-[#2B1A16]/70 hover:bg-[#FAF8F5]'
                }`}
              >
                {s === 'all' ? `All Emails (${inquiries.length})` : s === 'new' ? `New (${newCount})` : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inquiries List (Desktop Table + Mobile Cards) */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#2B1A16]/60 space-y-2">
            <Mail className="w-10 h-10 text-[#9A8029]/50 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-[#2B1A16]">No Customer Emails Found</h4>
            <p className="text-xs">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[#2B1A16]/70 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="p-4">Ticket / Sender</th>
                    <th className="p-4">Subject & Hardware</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Received</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {filtered.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => setSelectedInquiry(inq)}
                      className={`hover:bg-[#FAF8F5] cursor-pointer transition-colors ${
                        inq.status === 'new' ? 'bg-[#9A8029]/5 font-medium' : ''
                      }`}
                    >
                      <td className="p-4">
                        <span className="font-mono text-[10px] text-[#9A8029] font-bold block">
                          {inq.id}
                        </span>
                        <span className="font-bold text-[#2B1A16] block">{inq.name}</span>
                        <span className="text-[11px] text-[#2B1A16]/60">{inq.email}</span>
                      </td>

                      <td className="p-4 max-w-xs">
                        <span className="font-semibold text-[#2B1A16] block truncate">
                          {inq.subject}
                        </span>
                        {inq.deviceModel && (
                          <span className="text-[11px] text-[#2B1A16]/60 truncate block flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-[#9A8029]" />
                            <span>{inq.deviceModel}</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#DDD2C0] text-[10px] font-semibold text-[#2B1A16]">
                          {inq.type}
                        </span>
                      </td>

                      <td className="p-4">{getPriorityBadge(inq.priority)}</td>

                      <td className="p-4">{getStatusBadge(inq.status)}</td>

                      <td className="p-4 text-[#2B1A16]/60 text-[11px]">
                        {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(inq)}
                            className="p-1.5 rounded-lg border border-[#DDD2C0] hover:bg-[#FAF8F5] text-[#2B1A16]"
                            title="Inspect & Reply"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#9A8029]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete inquiry #${inq.id}?`)) {
                                deleteInquiry(inq.id);
                                addToast(`Removed inquiry #${inq.id}`, 'info');
                              }
                            }}
                            className="p-1.5 rounded-lg border border-[#DDD2C0] hover:bg-rose-50 text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch-Friendly Card View (Visible on small screens) */}
            <div className="lg:hidden divide-y divide-[#E5E0D8]">
              {filtered.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiry(inq)}
                  className={`p-4 space-y-3 cursor-pointer active:bg-[#FAF8F5] ${
                    inq.status === 'new' ? 'bg-[#9A8029]/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#9A8029]">
                      {inq.id}
                    </span>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(inq.priority)}
                      {getStatusBadge(inq.status)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#2B1A16]">{inq.subject}</h4>
                    <p className="text-xs text-[#2B1A16]/70 line-clamp-2 mt-1">
                      {inq.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#2B1A16]/60 pt-2 border-t border-[#E5E0D8]/60">
                    <div>
                      <span className="font-semibold text-[#2B1A16] block">{inq.name}</span>
                      <span className="text-[11px]">{inq.email}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono block">
                        {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInquiry(inq);
                        }}
                        className="text-[#9A8029] font-bold text-xs underline mt-0.5 inline-block"
                      >
                        View & Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Inspect & Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-[#E5E0D8] w-full max-w-2xl rounded-2xl shadow-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E5E0D8] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#9A8029]">
                    {selectedInquiry.id}
                  </span>
                  <span className="text-[#DDD2C0]">•</span>
                  <span className="capitalize text-xs font-semibold text-[#2B1A16]">
                    {selectedInquiry.type} Request
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#2B1A16] mt-0.5">
                  {selectedInquiry.subject}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value as InquiryStatus;
                    updateInquiryStatus(selectedInquiry.id, nextStatus);
                    setSelectedInquiry({ ...selectedInquiry, status: nextStatus });
                    addToast(`Updated status to ${nextStatus}`, 'success');
                  }}
                  className="bg-white border border-[#DDD2C0] rounded-xl px-2.5 py-1 text-xs font-semibold outline-none"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1.5 rounded-lg border border-[#DDD2C0] text-[#2B1A16]/60 hover:text-[#2B1A16]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Patron Card */}
              <div className="bg-[#FAF8F5] border border-[#DDD2C0] p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[#2B1A16]/60 text-[10px] uppercase font-semibold block">Patron</span>
                  <span className="font-bold text-[#2B1A16] text-sm">{selectedInquiry.name}</span>
                </div>
                <div>
                  <span className="text-[#2B1A16]/60 text-[10px] uppercase font-semibold block">Email</span>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-[#9A8029] underline font-medium">
                    {selectedInquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-[#2B1A16]/60 text-[10px] uppercase font-semibold block">Phone</span>
                  <span>{selectedInquiry.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Hardware Model & Serial Info */}
              {selectedInquiry.deviceModel && (
                <div className="bg-white border border-[#DDD2C0] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[#2B1A16]/60 text-[10px] uppercase font-semibold block">Device Under Care</span>
                    <span className="font-bold text-[#2B1A16]">{selectedInquiry.deviceModel}</span>
                  </div>
                  {selectedInquiry.serialNumber && (
                    <div className="text-right">
                      <span className="text-[#2B1A16]/60 text-[10px] uppercase font-semibold block">Serial / Order #</span>
                      <span className="font-mono text-[#9A8029] font-bold">{selectedInquiry.serialNumber}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Message Content */}
              <div>
                <span className="text-[#2B1A16]/60 text-[10px] uppercase font-semibold block mb-1.5">
                  Patron Inquiry Description
                </span>
                <div className="bg-[#FAF8F5] border border-[#DDD2C0] p-4 rounded-xl text-xs sm:text-sm text-[#2B1A16] leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Previously Sent Reply if any */}
              {selectedInquiry.replySent && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Response Dispatched by Engineering Desk:</span>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed italic">
                    &quot;{selectedInquiry.replySent}&quot;
                  </p>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-[#E5E0D8]">
                <label className="block font-bold text-[#2B1A16]">
                  Compose Concierge Response (Direct to {selectedInquiry.email})
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official response, warranty instructions, or doorstep dispatch schedule..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl p-3 text-xs outline-none"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      updateInquiryStatus(selectedInquiry.id, 'resolved');
                      setSelectedInquiry({ ...selectedInquiry, status: 'resolved' });
                      addToast(`Marked #${selectedInquiry.id} as resolved`, 'info');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-[#DDD2C0] text-[#2B1A16] font-semibold text-xs hover:bg-[#FAF8F5]"
                  >
                    Mark as Resolved
                  </button>

                  <button
                    type="submit"
                    className="bg-[#2B1A16] hover:bg-[#9A8029] text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Engineering Reply</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

