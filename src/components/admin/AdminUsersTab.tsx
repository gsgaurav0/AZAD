'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Users,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Award,
  Building2,
  UserCheck,
  X,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { UserProfile } from '@/types';

interface AdminUsersTabProps {
  onRefresh?: () => void;
}

export default function AdminUsersTab({ onRefresh }: AdminUsersTabProps) {
  const addToast = useUIStore((state) => state.addToast);
  const registeredUsers = useAuthStore((state) => state.registeredUsers);
  const currentUser = useAuthStore((state) => state.user);

  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Fetch registered users from backend API (/api/admin/users)
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        setDbUsers(data.users);
      } else {
        // Fallback to local store registered users if database is empty/offline
        const combined = [...registeredUsers];
        if (currentUser && !combined.some((u) => u.id === currentUser.id)) {
          combined.unshift(currentUser);
        }
        setDbUsers(combined);
      }
    } catch {
      const combined = [...registeredUsers];
      if (currentUser && !combined.some((u) => u.id === currentUser.id)) {
        combined.unshift(currentUser);
      }
      setDbUsers(combined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [registeredUsers]);

  // Combine and deduplicate users
  const allUsers = useMemo(() => {
    const map = new Map<string, UserProfile>();
    // Add local registered users
    registeredUsers.forEach((u) => map.set(u.id || u.email, u));
    if (currentUser) map.set(currentUser.id || currentUser.email, currentUser);
    // Add database users
    dbUsers.forEach((u) => map.set(u.id || u.email, u));
    return Array.from(map.values());
  }, [dbUsers, registeredUsers, currentUser]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (roleFilter !== 'all' && (u.role || 'customer') !== roleFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q)) ||
          (u.company && u.company.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [allUsers, roleFilter, searchQuery]);

  // Key Metrics
  const totalUsersCount = allUsers.length;
  const verifiedUsersCount = allUsers.filter((u) => u.isEmailVerified || u.isPhoneVerified).length;
  const goldPatronsCount = allUsers.filter((u) => (u.memberTier || '').includes('Gold')).length;

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete patron account "${userName}"?`)) return;

    try {
      await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setDbUsers((prev) => prev.filter((u) => u.id !== userId));
      addToast(`Patron profile "${userName}" deleted.`, 'info');
    } catch {
      setDbUsers((prev) => prev.filter((u) => u.id !== userId));
      addToast(`Removed "${userName}" from list.`, 'info');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E5E0D8] p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#9A8029] font-bold">
              PATRON REGISTRY
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2B1A16] mt-1">
            Registered Customers & User Profiles
          </h2>
          <p className="text-xs text-[#2B1A16]/70 mt-0.5">
            Complete synchronized ledger of all patrons who created accounts, their verified credentials, contact details, and orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl border border-[#DDD2C0] bg-[#FAF8F5] text-xs font-semibold text-[#2B1A16] hover:bg-white transition-all flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#9A8029]' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E5E0D8] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Registered</span>
            <Users className="w-4 h-4 text-[#9A8029]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#2B1A16]">{totalUsersCount}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Synced with Supabase profiles</span>
        </div>

        <div className="bg-white border border-[#E5E0D8] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Verified Patrons</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#2B1A16]">{verifiedUsersCount}</div>
          <span className="text-[10px] text-[#2B1A16]/60 font-medium">Email or mobile verified</span>
        </div>

        <div className="bg-white border border-[#E5E0D8] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Gold Tier Members</span>
            <Award className="w-4 h-4 text-[#9A8029]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#2B1A16]">{goldPatronsCount}</div>
          <span className="text-[10px] text-[#9A8029] font-medium">Bespoke concierge access</span>
        </div>

        <div className="bg-white border border-[#E5E0D8] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Database Sync</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#2B1A16]">Active</div>
          <span className="text-[10px] text-[#2B1A16]/60 font-medium">Table & View `public.users`</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#E5E0D8] p-3.5 rounded-xl shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#2B1A16]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patron by name, email, mobile, or company..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg text-xs text-[#2B1A16] outline-none focus:border-[#9A8029] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-3 py-2 text-xs text-[#2B1A16] outline-none font-medium"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] uppercase tracking-wider text-[10px] font-bold text-[#2B1A16]/70 font-mono">
              <tr>
                <th className="py-3 px-4">Patron Details</th>
                <th className="py-3 px-4">Contact Coordinates</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Membership Tier</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#2B1A16]/60">
                    <Users className="w-8 h-8 text-[#DDD2C0] mx-auto mb-2" />
                    <span className="font-serif text-base text-[#2B1A16] block">No registered patrons found</span>
                    <span className="text-xs text-[#2B1A16]/60">
                      When customers sign up via the website, their full profile records will appear here in real-time.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id || u.email} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EFE8DD] border border-[#DDD2C0] flex items-center justify-center font-serif text-sm font-bold text-[#9A8029] shrink-0 overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name?.charAt(0) || 'P'
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-[#2B1A16] block">{u.name || 'Anonymous Patron'}</span>
                          <span className="font-mono text-[10px] text-[#2B1A16]/50 block">ID: {u.id?.slice(0, 16)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[#2B1A16]/80 font-medium">
                          <Mail className="w-3.5 h-3.5 text-[#9A8029] shrink-0" />
                          <span>{u.email || 'N/A'}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-[#2B1A16]/60">
                            <Phone className="w-3.5 h-3.5 text-[#2B1A16]/40 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            u.isEmailVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {u.isEmailVerified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          Email {u.isEmailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 bg-[#9A8029]/10 text-[#9A8029] border border-[#9A8029]/20 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">
                        <Award className="w-3 h-3" />
                        {u.memberTier || 'Gold Patron Member'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#2B1A16]/70">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-[#2B1A16]/40" />
                        <span>{u.joinedDate || 'Recently Joined'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 rounded-lg border border-[#DDD2C0] bg-white text-[#2B1A16] hover:bg-[#9A8029] hover:text-white hover:border-[#9A8029] transition-colors"
                          title="View Full Profile Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg border border-[#DDD2C0] bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                          title="Delete Patron Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dossier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-[#DDD2C0] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] font-bold">
                  PATRON DOSSIER
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2B1A16] mt-0.5">{selectedUser.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-[#2B1A16]/60 hover:text-[#2B1A16] hover:bg-[#EFE8DD]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60 text-[10px] uppercase font-bold block mb-1">Email</span>
                <span className="font-semibold text-[#2B1A16] break-all">{selectedUser.email || 'N/A'}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60 text-[10px] uppercase font-bold block mb-1">Mobile</span>
                <span className="font-semibold text-[#2B1A16]">{selectedUser.phone || 'N/A'}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60 text-[10px] uppercase font-bold block mb-1">Date of Birth</span>
                <span className="font-semibold text-[#2B1A16]">{selectedUser.dateOfBirth || 'Not specified'}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60 text-[10px] uppercase font-bold block mb-1">Gender</span>
                <span className="font-semibold text-[#2B1A16]">{selectedUser.gender || 'Prefer not to say'}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60 text-[10px] uppercase font-bold block mb-1">Company / GST</span>
                <span className="font-semibold text-[#2B1A16]">{selectedUser.company || selectedUser.gstNumber || 'Individual Patron'}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#DDD2C0]">
                <span className="text-[#2B1A16]/60 text-[10px] uppercase font-bold block mb-1">Member Tier</span>
                <span className="font-semibold text-[#9A8029]">{selectedUser.memberTier || 'Gold Patron Member'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider px-5 py-2 rounded-lg transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
