'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  UserCheck,
  UserPlus,
  X,
  KeyRound,
  Edit3,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { UserProfile } from '@/types';
import ConfirmModal from '@/components/common/ConfirmModal';

interface AdminUsersTabProps {
  onRefresh?: () => void;
}

export default function AdminUsersTab({ onRefresh }: AdminUsersTabProps) {
  const addToast = useUIStore((state) => state.addToast);
  const registeredUsers = useAuthStore((state) => state.registeredUsers);
  const currentUser = useAuthStore((state) => state.user);
  const adminDeleteUser = useAuthStore((state) => state.adminDeleteUser);
  const adminUpdateUser = useAuthStore((state) => state.adminUpdateUser);
  const adminClearTestUsers = useAuthStore((state) => state.adminClearTestUsers);

  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Animated Confirm Modal States
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);

  // Edit User State inside Dossier
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer' as 'customer' | 'admin',
    memberTier: 'Gold Patron Member',
    isEmailVerified: true,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer' as 'customer' | 'admin',
    memberTier: 'Gold Patron Member',
    isEmailVerified: true,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Fetch registered users from backend API (/api/admin/users)
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      const data = await res.json();
      setHasFetched(true);
      if (data.success && Array.isArray(data.users)) {
        setDbUsers(data.users);
      } else {
        setDbUsers([]);
      }
    } catch {
      setHasFetched(true);
      // Fallback to local store if offline
      setDbUsers(registeredUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Real Database users are the authoritative source of truth once fetched
  const allUsers = useMemo(() => {
    if (hasFetched) {
      return dbUsers;
    }
    return registeredUsers.length > 0 ? registeredUsers : dbUsers;
  }, [hasFetched, dbUsers, registeredUsers]);

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
  const verifiedUsersCount = allUsers.filter(
    (u) => Boolean(u.isEmailVerified || (u as any).is_email_verified || u.isPhoneVerified || (u as any).is_phone_verified)
  ).length;
  const goldPatronsCount = allUsers.filter((u) => (u.memberTier || (u as any).member_tier || '').includes('Gold')).length;

  // ==============================================================================
  // CRUD Action 1: DELETE USER
  // ==============================================================================
  const handleRequestDelete = (user: UserProfile) => {
    setUserToDelete(user);
  };

  const executeDeleteUser = async () => {
    if (!userToDelete) return;
    const user = userToDelete;
    const displayName = user.name || user.email || 'this patron';

    // Optimistic removal from UI and localStorage immediately
    setDbUsers((prev) => prev.filter((u) => u.id !== user.id && (!user.email || u.email !== user.email)));
    adminDeleteUser(user.id);
    if (user.email) adminDeleteUser(user.email);
    if (selectedUser?.id === user.id) setSelectedUser(null);
    setUserToDelete(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Patron profile "${displayName}" deleted successfully.`, 'info');
      } else {
        addToast(data.error || 'Failed to delete user from database.', 'error');
      }
    } catch {
      addToast(`Removed "${displayName}" from view.`, 'info');
    }
  };

  // ==============================================================================
  // CRUD Action 2: TOGGLE / UPDATE EMAIL VERIFICATION
  // ==============================================================================
  const handleToggleVerifyEmail = async (user: UserProfile) => {
    const isEmailVer = Boolean(
      user.isEmailVerified === true ||
      (user as any).is_email_verified === true
    );
    const newStatus = !isEmailVer;

    // Optimistic update
    setDbUsers((prev) =>
      prev.map((u) =>
        u.id === user.id || (user.email && u.email === user.email)
          ? { ...u, isEmailVerified: newStatus, is_email_verified: newStatus }
          : u
      )
    );
    adminUpdateUser(user.id, { isEmailVerified: newStatus });
    if (user.email) adminUpdateUser(user.email, { isEmailVerified: newStatus });

    if (selectedUser && (selectedUser.id === user.id || selectedUser.email === user.email)) {
      setSelectedUser((prev) => prev ? { ...prev, isEmailVerified: newStatus, is_email_verified: newStatus } : null);
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email, isEmailVerified: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Email verification set to ${newStatus ? 'Verified' : 'Pending'} for "${user.name}".`, 'success');
      } else {
        addToast(data.error || 'Failed to update email verification.', 'error');
        fetchUsers();
      }
    } catch {
      addToast('Network error updating email verification.', 'error');
    }
  };

  // ==============================================================================
  // CRUD Action 3: EDIT USER DETAILS IN DOSSIER
  // ==============================================================================
  const openDossier = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditing(false);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: (user.role as any) === 'admin' ? 'admin' : 'customer',
      memberTier: user.memberTier || (user as any).member_tier || 'Gold Patron Member',
      isEmailVerified: Boolean(user.isEmailVerified || (user as any).is_email_verified),
    });
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          email: selectedUser.email,
          name: editForm.name,
          phone: editForm.phone,
          role: editForm.role,
          memberTier: editForm.memberTier,
          isEmailVerified: editForm.isEmailVerified,
        }),
      });
      const data = await res.json();
      setIsSavingEdit(false);

      if (data.success) {
        const updated: UserProfile = {
          ...selectedUser,
          name: editForm.name,
          phone: editForm.phone,
          role: editForm.role,
          memberTier: editForm.memberTier,
          isEmailVerified: editForm.isEmailVerified,
        };

        setSelectedUser(updated);
        setDbUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id || (selectedUser.email && u.email === selectedUser.email) ? updated : u))
        );
        adminUpdateUser(selectedUser.id, updated);
        if (selectedUser.email) adminUpdateUser(selectedUser.email, updated);

        setIsEditing(false);
        addToast('Patron profile updated successfully.', 'success');
      } else {
        addToast(data.error || 'Failed to update patron details.', 'error');
      }
    } catch {
      setIsSavingEdit(false);
      addToast('Network error saving patron details.', 'error');
    }
  };

  // ==============================================================================
  // CRUD Action 4: CREATE USER (PATRON OR ADMIN)
  // ==============================================================================
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = createForm.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name.trim() || 'Patron',
          email: cleanEmail,
          phone: createForm.phone.trim(),
          password: createForm.password || 'MewakPatron2026!',
          role: createForm.role,
          memberTier: createForm.memberTier,
          isEmailVerified: createForm.isEmailVerified,
        }),
      });

      const data = await res.json();
      setIsCreating(false);

      if (data.success && data.user) {
        addToast(data.message || `Account for "${createForm.name}" created successfully.`, 'success');
        setIsCreateModalOpen(false);
        setCreateForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'customer',
          memberTier: 'Gold Patron Member',
          isEmailVerified: true,
        });
        fetchUsers();
      } else {
        addToast(data.error || 'Failed to create account.', 'error');
      }
    } catch {
      setIsCreating(false);
      addToast('Network error creating account.', 'error');
    }
  };

  // ==============================================================================
  // Action 5: SEND PASSWORD RESET EMAIL TO USER DIRECTLY FROM ADMIN
  // ==============================================================================
  const handleSendResetEmail = async (email: string) => {
    if (!email) return;
    try {
      const res = await fetch('/api/email/reset-password/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`Password reset link dispatched to ${email}.`, 'success');
      } else {
        addToast(data.error || 'Failed to dispatch reset email.', 'error');
      }
    } catch {
      addToast('Network error requesting password reset.', 'error');
    }
  };

  // ==============================================================================
  // Action 6: PURGE STALE TEST PATRONS FROM LOCAL STORAGE
  // ==============================================================================
  const handlePurgeStaleTestData = () => {
    setIsPurgeConfirmOpen(true);
  };

  const executePurgeStaleTestData = () => {
    setIsPurgeConfirmOpen(false);
    adminClearTestUsers();
    fetchUsers();
    addToast('Stale test accounts purged. Synchronized with live database.', 'info');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Actions */}
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
            Full synchronized ledger of all patrons, verified credentials, contact coordinates, role assignments, and CRUD controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#2B1A16] hover:bg-[#9A8029] text-xs font-semibold text-[#EFE8DD] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#9A8029]" />
            Add Patron / Admin
          </button>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl border border-[#DDD2C0] bg-[#FAF8F5] text-xs font-semibold text-[#2B1A16] hover:bg-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#9A8029]' : ''}`} />
            Refresh
          </button>

          {registeredUsers.length > 0 && (
            <button
              type="button"
              onClick={handlePurgeStaleTestData}
              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/60 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-all flex items-center gap-1 cursor-pointer"
              title="Purge legacy local mock patrons from browser storage"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Purge Stale Test Data
            </button>
          )}
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
          <span className="text-[10px] text-[#2B1A16]/60 font-medium">Table & View `public.profiles`</span>
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
            placeholder="Search patron by name, email, mobile, or ID..."
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
                <th className="py-3 px-4">Role & Tier</th>
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
                      When customers sign up via the storefront or you click &quot;Add Patron / Admin&quot;, profiles appear here in real-time.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isEmailVer = Boolean(
                    u.isEmailVerified === true ||
                    (u as any).is_email_verified === true
                  );
                  const isUserAdmin = (u.role || 'customer') === 'admin';

                  return (
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
                        <button
                          type="button"
                          onClick={() => handleToggleVerifyEmail(u)}
                          title={isEmailVer ? 'Click to mark as pending' : 'Click to mark as verified'}
                          className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-semibold transition-all hover:scale-105 cursor-pointer ${
                            isEmailVer
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          {isEmailVer ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-3 h-3 text-zinc-400 shrink-0" />
                          )}
                          Email {isEmailVer ? 'Verified' : 'Pending'}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                            isUserAdmin
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}>
                            {isUserAdmin ? 'Administrator' : 'Customer'}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-[#9A8029]/10 text-[#9A8029] border border-[#9A8029]/20 font-semibold px-2 py-0.5 rounded-full text-[9px]">
                            <Award className="w-2.5 h-2.5" />
                            {u.memberTier || 'Gold Patron Member'}
                          </span>
                        </div>
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
                            onClick={() => handleToggleVerifyEmail(u)}
                            className="p-1.5 rounded-lg border border-[#DDD2C0] bg-white text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer"
                            title="Toggle / Confirm Email Verification"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDossier(u)}
                            className="p-1.5 rounded-lg border border-[#DDD2C0] bg-white text-[#2B1A16] hover:bg-[#9A8029] hover:text-white hover:border-[#9A8029] transition-colors cursor-pointer"
                            title="View Full Profile Dossier & Edit"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestDelete(u)}
                            className="p-1.5 rounded-lg border border-[#DDD2C0] bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                            title="Delete Patron Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DOSSIER & EDIT MODAL */}
      {/* ========================================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#DDD2C0] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] font-bold">
                  PATRON DOSSIER
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2B1A16] mt-0.5">
                  {selectedUser.name || 'Anonymous Patron'}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#DDD2C0] bg-white hover:bg-[#FAF8F5] text-[#2B1A16] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-[#9A8029]" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg text-[#2B1A16]/60 hover:text-[#2B1A16] hover:bg-[#EFE8DD] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditing ? (
              /* EDIT FORM */
              <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#2B1A16]/70 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-lg p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2B1A16]/70 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-white border border-[#DDD2C0] rounded-lg p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2B1A16]/70 mb-1">Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                      className="w-full bg-white border border-[#DDD2C0] rounded-lg p-2.5 text-xs text-[#2B1A16] outline-none"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2B1A16]/70 mb-1">Membership Tier</label>
                    <select
                      value={editForm.memberTier}
                      onChange={(e) => setEditForm({ ...editForm, memberTier: e.target.value })}
                      className="w-full bg-white border border-[#DDD2C0] rounded-lg p-2.5 text-xs text-[#2B1A16] outline-none"
                    >
                      <option value="Gold Patron Member">Gold Patron Member</option>
                      <option value="Platinum Patron Member">Platinum Patron Member</option>
                      <option value="Diamond VIP Patron">Diamond VIP Patron</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isEmailVerified}
                      onChange={(e) => setEditForm({ ...editForm, isEmailVerified: e.target.checked })}
                      className="accent-[#9A8029] w-4 h-4"
                    />
                    <span className="font-semibold text-[#2B1A16]">Email Verified</span>
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#DDD2C0]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg border border-[#DDD2C0] text-xs font-semibold text-[#2B1A16] hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 rounded-lg bg-[#2B1A16] hover:bg-[#9A8029] text-xs font-semibold text-[#EFE8DD] flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW DOSSIER */
              <>
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
                    <span className="text-[#2B1A16]/60 text-[10px] uppercase font-bold block mb-1">Role</span>
                    <span className="font-semibold text-[#2B1A16] capitalize">{selectedUser.role || 'customer'}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#DDD2C0]">
                    <span className="text-[#2B1A16]/60 text-[10px] uppercase font-bold block mb-1">Email Status</span>
                    <span className={`font-semibold inline-flex items-center gap-1 ${Boolean(selectedUser.isEmailVerified || (selectedUser as any).is_email_verified) ? 'text-emerald-700' : 'text-zinc-500'}`}>
                      {Boolean(selectedUser.isEmailVerified || (selectedUser as any).is_email_verified) ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Verified
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                          Pending Verification
                        </>
                      )}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#DDD2C0] col-span-2">
                    <span className="text-[#2B1A16]/60 text-[10px] uppercase font-bold block mb-1">Member Tier</span>
                    <span className="font-semibold text-[#9A8029]">{selectedUser.memberTier || 'Gold Patron Member'}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#DDD2C0]">
                  <div className="flex items-center gap-2">
                    {selectedUser.email && (
                      <button
                        type="button"
                        onClick={() => handleSendResetEmail(selectedUser.email)}
                        className="text-[11px] text-[#9A8029] hover:underline font-semibold flex items-center gap-1"
                        title="Send password reset link to user email"
                      >
                        <KeyRound className="w-3 h-3" />
                        Dispatch Reset Email
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => selectedUser && handleRequestDelete(selectedUser)}
                      className="text-[11px] text-rose-600 hover:underline font-semibold flex items-center gap-1 ml-2 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete Account
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider px-5 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Close Dossier
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE PATRON / ADMIN MODAL */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-start justify-between border-b border-[#DDD2C0] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] font-bold">
                  NEW ACCOUNT
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2B1A16] mt-0.5">
                  Create Patron or Administrator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-[#2B1A16]/60 hover:text-[#2B1A16] hover:bg-[#EFE8DD] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#2B1A16]/70 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white border border-[#DDD2C0] rounded-lg p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2B1A16]/70 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="patron@domain.com"
                  className="w-full bg-white border border-[#DDD2C0] rounded-lg p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2B1A16]/70 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full bg-white border border-[#DDD2C0] rounded-lg p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2B1A16]/70 mb-1">
                  Initial Password (default: MewakPatron2026!)
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Leave blank for MewakPatron2026!"
                  className="w-full bg-white border border-[#DDD2C0] rounded-lg p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2B1A16]/70 mb-1">Account Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-lg p-2.5 text-xs text-[#2B1A16] outline-none"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2B1A16]/70 mb-1">Member Tier</label>
                  <select
                    value={createForm.memberTier}
                    onChange={(e) => setCreateForm({ ...createForm, memberTier: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-lg p-2.5 text-xs text-[#2B1A16] outline-none"
                  >
                    <option value="Gold Patron Member">Gold Patron Member</option>
                    <option value="Platinum Patron Member">Platinum Patron Member</option>
                    <option value="Diamond VIP Patron">Diamond VIP Patron</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.isEmailVerified}
                    onChange={(e) => setCreateForm({ ...createForm, isEmailVerified: e.target.checked })}
                    className="accent-[#9A8029] w-4 h-4"
                  />
                  <span className="font-semibold text-[#2B1A16]">Mark Email as Verified Immediately</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#DDD2C0]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#DDD2C0] text-xs font-semibold text-[#2B1A16] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-lg bg-[#2B1A16] hover:bg-[#9A8029] text-xs font-semibold text-[#EFE8DD] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {isCreating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LUXURY ANIMATED CONFIRM MODALS (REPLACING BROWSER NATIVE DIALOGS) */}
      {/* ========================================================================= */}
      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        title="Delete Patron Account"
        message={`Are you sure you want to delete patron account "${userToDelete?.name || userToDelete?.email}"? This will permanently remove their profile and credentials from the database.`}
        confirmText="Delete Account"
        cancelText="Cancel"
        isDestructive={true}
        variant="danger"
        onConfirm={executeDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />

      <ConfirmModal
        isOpen={isPurgeConfirmOpen}
        title="Purge Stale Test Data"
        message="This will purge legacy local mock/demo test patrons stored in browser storage and synchronize cleanly with your live Supabase database. Proceed?"
        confirmText="Purge Stale Accounts"
        cancelText="Cancel"
        isDestructive={true}
        variant="warning"
        onConfirm={executePurgeStaleTestData}
        onCancel={() => setIsPurgeConfirmOpen(false)}
      />
    </div>
  );
}
