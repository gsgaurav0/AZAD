'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Package,
  RotateCcw,
  MapPin,
  LogOut,
  CheckCircle2,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Clock,
  Compass,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Copy,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  PlayCircle,
  Briefcase,
  Building2,
  ShieldCheck,
  KeyRound,
  Lock,
  Camera,
  Check,
  FileText,
  BadgeCheck,
  Send,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Address, Order, OrderStatus } from '@/types';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
];

export default function AccountPage() {
  const {
    isLoggedIn,
    user,
    orders,
    savedAddresses,
    logout,
    updateProfile,
    deleteProfileField,
    deleteAccount,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    advanceOrderStatus,
    cancelOrder,
    requestReturn,
    changePasswordWithVerification,
    changeEmailWithVerification,
    changePhoneWithVerification,
  } = useAuthStore();

  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const addToast = useUIStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'returns'>('profile');

  // Modal States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);
  const [showPhoneVerifyModal, setShowPhoneVerifyModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    company: user?.company || '',
    industry: user?.industry || '',
    bio: user?.bio || '',
    alternatePhone: user?.alternatePhone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: (user?.gender || 'Prefer not to say') as 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say',
    gstNumber: user?.gstNumber || '',
    preferredDeliveryTime: (user?.preferredDeliveryTime || 'Anytime') as any,
  });

  // Email Change with Verification State
  const [newEmail, setNewEmail] = useState('');
  const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input');
  const [emailToken, setEmailToken] = useState('');
  const [inputEmailCode, setInputEmailCode] = useState('');

  // Phone Change with Verification State
  const [newPhone, setNewPhone] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input');
  const [phoneToken, setPhoneToken] = useState('');
  const [inputPhoneCode, setInputPhoneCode] = useState('');

  // Password Change with Verification State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  // Address Form State
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    name: user?.name || '',
    phone: user?.phone?.replace(/\D/g, '').slice(-10) || '',
    street: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home',
    isDefault: false,
  });

  // Expanded Orders State
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  // Return Form State
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('Comfort or fit issue with ear cushions / watch band');
  const [returnRefundMode, setReturnRefundMode] = useState('Original Payment Method');
  const [returnSuccess, setReturnSuccess] = useState(false);

  if (!isLoggedIn || !user) {
    return (
      <div className="bg-[#EFE8DD] min-h-screen py-24 text-center px-4 font-sans">
        <div className="max-w-md mx-auto bg-[#FBF7F0] border border-[#DDD2C0] p-8 rounded-[4px] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#EFE8DD] flex items-center justify-center text-[#9A8029] mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#2B1A16] mb-2">
            Patron Profile Access
          </h2>
          <p className="text-xs text-[#2B1A16]/70 mb-6 leading-relaxed">
            Sign in or create your patron profile to manage your personal details, verify contact channels, and track your orders live.
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={openLoginModal}
              className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-widest py-3 rounded-[3px] transition-colors"
            >
              Sign In / Create Account
            </button>
            <Link
              href="/login"
              className="block w-full border border-[#DDD2C0] bg-white hover:bg-[#EFE8DD] text-[#2B1A16] text-xs font-semibold uppercase tracking-widest py-3 rounded-[3px] transition-colors"
            >
              Go to Authentication Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate profile completion percentage
  const calculateProfileScore = () => {
    let score = 30; // base (name, email, phone)
    if (user.headline) score += 15;
    if (user.company) score += 10;
    if (user.bio) score += 15;
    if (user.avatarUrl) score += 10;
    if (savedAddresses.length > 0) score += 10;
    if (user.gstNumber) score += 10;
    return Math.min(score, 100);
  };

  const profileScore = calculateProfileScore();

  // Handlers for Edit Profile Details
  const handleOpenEditProfile = () => {
    setProfileForm({
      name: user.name,
      headline: user.headline || '',
      company: user.company || '',
      industry: user.industry || '',
      bio: user.bio || '',
      alternatePhone: user.alternatePhone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || 'Prefer not to say',
      gstNumber: user.gstNumber || '',
      preferredDeliveryTime: user.preferredDeliveryTime || 'Anytime',
    });
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      addToast('Name is a required field.', 'error');
      return;
    }
    updateProfile({
      name: profileForm.name.trim(),
      headline: profileForm.headline.trim() || undefined,
      company: profileForm.company.trim() || undefined,
      industry: profileForm.industry.trim() || undefined,
      bio: profileForm.bio.trim() || undefined,
      alternatePhone: profileForm.alternatePhone.trim() || undefined,
      dateOfBirth: profileForm.dateOfBirth || undefined,
      gender: profileForm.gender,
      gstNumber: profileForm.gstNumber.trim().toUpperCase() || undefined,
      preferredDeliveryTime: profileForm.preferredDeliveryTime,
    });
    setShowEditProfileModal(false);
    addToast('Professional profile updated successfully.', 'success');
  };

  // Handlers for Verified Email Change
  const handleStartEmailChange = () => {
    setNewEmail('');
    setEmailStep('input');
    setInputEmailCode('');
    setShowEmailVerifyModal(true);
  };

  const handleSendEmailVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@') || clean === user.email.toLowerCase()) {
      addToast('Please enter a different valid email address.', 'error');
      return;
    }
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    setEmailToken(token);
    setEmailStep('verify');
    addToast(`Verification code sent to ${clean}`, 'info');
  };

  const handleConfirmEmailVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputEmailCode.trim() !== emailToken) {
      addToast('Invalid verification token. Please enter the generated code.', 'error');
      return;
    }
    const res = changeEmailWithVerification(newEmail, inputEmailCode);
    if (res.success) {
      addToast('Email verified and updated successfully!', 'success');
      setShowEmailVerifyModal(false);
    } else {
      addToast(res.error || 'Verification failed.', 'error');
    }
  };

  // Handlers for Verified Phone Change
  const handleStartPhoneChange = () => {
    setNewPhone('');
    setPhoneStep('input');
    setInputPhoneCode('');
    setShowPhoneVerifyModal(true);
  };

  const handleSendPhoneVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPhone.replace(/\D/g, '');
    if (clean.length !== 10) {
      addToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    setPhoneToken(token);
    setPhoneStep('verify');
    addToast(`OTP transmitted to +91 ${clean}`, 'info');
  };

  const handleConfirmPhoneVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPhoneCode.trim() !== phoneToken) {
      addToast('Invalid verification OTP code. Please enter the generated code.', 'error');
      return;
    }
    const res = changePhoneWithVerification(newPhone, inputPhoneCode);
    if (res.success) {
      addToast('Mobile number verified and updated successfully!', 'success');
      setShowPhoneVerifyModal(false);
    } else {
      addToast(res.error || 'Verification failed.', 'error');
    }
  };

  // Handlers for Password Change
  const handleSavePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please provide your current account password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must contain at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    const res = changePasswordWithVerification(passwordForm.currentPassword, passwordForm.newPassword);
    if (res.success) {
      addToast('Security credentials updated successfully.', 'success');
      setShowPasswordChangeModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordError(res.error || 'Could not update password.');
    }
  };

  // Address Modal Handlers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      name: user.name || '',
      phone: user.phone?.replace(/\D/g, '').slice(-10) || '',
      street: '',
      locality: '',
      city: '',
      state: '',
      pincode: '',
      type: 'Home',
      isDefault: savedAddresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      locality: addr.locality,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      addToast('Please complete all mandatory address fields.', 'error');
      return;
    }

    if (editingAddressId) {
      updateAddress({ ...addressForm, id: editingAddressId });
      addToast('Delivery address updated successfully.', 'success');
    } else {
      addAddress(addressForm);
      addToast('New delivery address added.', 'success');
    }
    setShowAddressModal(false);
    setEditingAddressId(null);
  };

  const statusMilestones: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const getMilestoneIndex = (status: OrderStatus) => {
    const idx = statusMilestones.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-10 md:py-16 border-b border-[#DDD2C0] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Executive Profile Top Banner */}
        <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[6px] p-6 sm:p-8 mb-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* Avatar & Identification */}
            <div className="flex items-center gap-5">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#EFE8DD] border-2 border-[#9A8029] overflow-hidden flex items-center justify-center text-[#2B1A16] text-2xl font-serif font-bold shadow-md">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute bottom-0 right-0 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] p-1.5 rounded-full shadow transition-colors"
                  title="Change avatar photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2B1A16]">
                    {user.name}
                  </h1>
                </div>

                <p className="text-xs text-[#2B1A16]/80 font-medium">
                  {user.headline || 'Hardware & Acoustics Patron'}
                  {user.company ? ` • ${user.company}` : ''}
                </p>

                <div className="flex items-center gap-3 text-xs text-[#2B1A16]/60 mt-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#9A8029]" />
                    {user.email}
                    <span className="text-[10px] text-[#4C7A34] bg-[#4C7A34]/10 px-1.5 py-0.2 rounded font-bold">
                      Verified
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#9A8029]" />
                    {user.phone}
                    <span className="text-[10px] text-[#4C7A34] bg-[#4C7A34]/10 px-1.5 py-0.2 rounded font-bold">
                      Verified
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions & Completion Meter */}
            <div className="flex flex-col sm:items-end justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="inline-flex items-center gap-1.5 text-xs bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] font-semibold px-4 py-2.5 rounded-[3px] transition-colors shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 text-xs border border-[#DDD2C0] bg-white hover:bg-[#EFE8DD] text-[#B3402F] font-semibold px-4 py-2.5 rounded-[3px] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>

              {/* Profile Strength Meter */}
              <div className="w-full sm:w-56">
                <div className="flex items-center justify-between text-[11px] text-[#2B1A16]/70 mb-1">
                  <span>Profile Strength</span>
                  <span className="font-bold text-[#9A8029]">{profileScore}% Complete</span>
                </div>
                <div className="w-full h-1.5 bg-[#DDD2C0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#9A8029] transition-all duration-500 rounded-full"
                    style={{ width: `${profileScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-[4px] border border-[#DDD2C0] bg-[#FBF7F0] p-1 mb-8 max-w-3xl overflow-x-auto text-xs font-semibold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-[3px] transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Security</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-[3px] transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders & Live Tracking ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-[3px] transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'addresses'
                ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Destinations ({savedAddresses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-[3px] transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'returns'
                ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Returns & Warranty</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: PROFESSIONAL PROFILE & VERIFIED SECURITY */}
        {/* ============================================================ */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Comprehensive Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Professional & Legal Details Card */}
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#DDD2C0]">
                  <h3 className="font-serif text-xl font-semibold text-[#2B1A16] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#9A8029]" />
                    Professional & Identity Credentials
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="text-xs text-[#9A8029] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Full Legal Name
                    </span>
                    <strong className="text-sm text-[#2B1A16]">{user.name}</strong>
                  </div>

                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Professional Headline / Role
                    </span>
                    <strong className="text-sm text-[#2B1A16]">
                      {user.headline || 'Acoustics & Tech Connoisseur'}
                    </strong>
                  </div>

                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Organization / Studio
                    </span>
                    <strong className="text-sm text-[#2B1A16]">
                      {user.company || 'Private Patron Client'}
                    </strong>
                  </div>

                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Industry Sector
                    </span>
                    <strong className="text-sm text-[#2B1A16]">
                      {user.industry || 'High-Fidelity Audio / Tech'}
                    </strong>
                  </div>

                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Date of Birth
                    </span>
                    <strong className="text-sm text-[#2B1A16]">
                      {user.dateOfBirth || 'Not specified'}
                    </strong>
                  </div>

                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Gender Identification
                    </span>
                    <strong className="text-sm text-[#2B1A16]">
                      {user.gender || 'Prefer not to say'}
                    </strong>
                  </div>
                </div>

                {user.bio && (
                  <div className="p-3.5 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px] text-xs">
                    <span className="text-[#2B1A16]/60 block mb-1 font-medium uppercase text-[10px]">
                      Executive Bio / Sound Profile
                    </span>
                    <p className="text-xs text-[#2B1A16]/80 leading-relaxed italic">
                      "{user.bio}"
                    </p>
                  </div>
                )}
              </div>

              {/* Verified Contact Channels & Changes */}
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#DDD2C0]">
                  <h3 className="font-serif text-xl font-semibold text-[#2B1A16] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#4C7A34]" />
                    Verified Contact Channels (OTP Guarded)
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Primary Email */}
                  <div className="p-4 bg-white border border-[#DDD2C0] rounded-[3px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[#2B1A16]/60 uppercase text-[10px] font-bold">
                          Primary Email Address
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-[#4C7A34]/15 text-[#4C7A34] px-1.5 py-0.5 rounded font-bold">
                          <Check className="w-3 h-3" /> Authenticated
                        </span>
                      </div>
                      <strong className="text-sm text-[#2B1A16]">{user.email}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartEmailChange}
                      className="border border-[#DDD2C0] hover:bg-[#EFE8DD] text-[#2B1A16] px-3.5 py-1.5 rounded-[2px] text-xs font-semibold transition-colors shrink-0"
                    >
                      Change Email with Verification
                    </button>
                  </div>

                  {/* Primary Mobile */}
                  <div className="p-4 bg-white border border-[#DDD2C0] rounded-[3px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[#2B1A16]/60 uppercase text-[10px] font-bold">
                          Primary Mobile Number
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-[#4C7A34]/15 text-[#4C7A34] px-1.5 py-0.5 rounded font-bold">
                          <Check className="w-3 h-3" /> Authenticated
                        </span>
                      </div>
                      <strong className="text-sm text-[#2B1A16]">{user.phone}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartPhoneChange}
                      className="border border-[#DDD2C0] hover:bg-[#EFE8DD] text-[#2B1A16] px-3.5 py-1.5 rounded-[2px] text-xs font-semibold transition-colors shrink-0"
                    >
                      Change Mobile with OTP
                    </button>
                  </div>

                  {/* Alternate Phone */}
                  <div className="p-4 bg-white border border-[#DDD2C0] rounded-[3px] flex items-center justify-between">
                    <div>
                      <span className="text-[#2B1A16]/60 uppercase text-[10px] font-bold block mb-0.5">
                        Alternate Concierge Phone
                      </span>
                      <strong className="text-sm text-[#2B1A16]">
                        {user.alternatePhone || 'None registered'}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenEditProfile}
                      className="text-[#9A8029] hover:underline text-xs font-semibold"
                    >
                      {user.alternatePhone ? 'Update' : '+ Add Number'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Enterprise Hardware & Tax Billing */}
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-4 text-xs">
                <h3 className="font-serif text-lg font-semibold text-[#2B1A16] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#9A8029]" />
                  Enterprise & Dispatch Preferences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-[#DDD2C0] rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Business GSTIN (Input Tax Credit)
                    </span>
                    <strong className="text-sm text-[#2B1A16]">
                      {user.gstNumber || 'Not specified (Individual Patron)'}
                    </strong>
                  </div>

                  <div className="p-3 bg-white border border-[#DDD2C0] rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Preferred Courier Delivery Window
                    </span>
                    <strong className="text-sm text-[#2B1A16]">
                      {user.preferredDeliveryTime || 'Anytime'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Security, Password & Account Controls */}
            <div className="space-y-6">
              {/* Security & Credentials Card */}
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#DDD2C0]">
                  <KeyRound className="w-4 h-4 text-[#9A8029]" />
                  <h4 className="font-serif text-base font-semibold text-[#2B1A16]">
                    Account Security & Password
                  </h4>
                </div>

                <p className="text-[#2B1A16]/70 leading-relaxed text-xs">
                  Your credentials protect your order history, delivery destinations, and enterprise warranty claims.
                </p>

                <div className="p-3 bg-white border border-[#DDD2C0] rounded-[3px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#2B1A16]/70 font-medium">Patron Password</span>
                    <span className="text-[10px] text-[#4C7A34] bg-[#4C7A34]/10 px-1.5 py-0.5 rounded font-bold">
                      Protected
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordError('');
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowPasswordChangeModal(true);
                    }}
                    className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase py-2.5 rounded-[2px] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Change Password with Verification
                  </button>
                </div>

                <div className="pt-2 text-[11px] text-[#2B1A16]/60 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4C7A34]" />
                    <span>256-Bit TLS End-to-End Encryption</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#4C7A34]" />
                    <span>Multi-factor OTP verification enabled</span>
                  </div>
                </div>
              </div>

              {/* Account Overview Card */}
              <div className="bg-[#FAF8F5] border border-[#DDD2C0] rounded-[4px] p-6 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#9A8029]" />
                  <h4 className="font-serif text-base font-bold text-[#2B1A16]">
                    Account Summary
                  </h4>
                </div>
                <div className="space-y-2 text-xs text-[#2B1A16]/80 pt-1">
                  <div className="flex justify-between py-1 border-b border-[#DDD2C0]/50">
                    <span className="text-[#2B1A16]/60">Registered On</span>
                    <strong className="text-[#2B1A16]">{user.joinedDate}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DDD2C0]/50">
                    <span className="text-[#2B1A16]/60">Total Orders</span>
                    <strong className="text-[#2B1A16]">{orders.length}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#2B1A16]/60">Saved Destinations</span>
                    <strong className="text-[#2B1A16]">{savedAddresses.length}</strong>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-3 text-xs">
                <h4 className="font-serif text-base font-semibold text-[#B3402F] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Account Lifecycle
                </h4>
                <p className="text-[11px] text-[#2B1A16]/70 leading-relaxed">
                  Permanently delete your patron profile, saved addresses, and active session tokens.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="w-full border border-[#B3402F] text-[#B3402F] hover:bg-[#B3402F] hover:text-white py-2 rounded-[2px] font-semibold text-xs transition-colors"
                >
                  Delete Patron Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MY ORDERS WITH STEP-BY-STEP LIVE LOCATION TRACKING */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (() => {
          const userOrders = orders.filter(
            (o) =>
              !o.userId ||
              o.userId === user?.id ||
              (user?.phone && o.address?.phone?.replace(/\D/g, '').includes(user.phone.replace(/\D/g, '').slice(-10)))
          );

          return (
            <div className="space-y-6">
              {userOrders.length === 0 ? (
                <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-12 text-center rounded-[4px]">
                  <Package className="w-12 h-12 text-[#9A8029]/50 mx-auto mb-3" />
                  <h3 className="font-serif text-xl font-medium text-[#2B1A16] mb-1">
                    No orders placed yet
                  </h3>
                  <p className="text-xs text-[#2B1A16]/60 mb-6 max-w-sm mx-auto">
                    Experience acoustic purity and titanium flagships. Place your first order to watch live step-by-step dispatch tracking.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block bg-[#2B1A16] text-[#EFE8DD] text-xs font-semibold uppercase px-6 py-3 rounded-[3px] hover:bg-[#9A8029] transition-colors"
                  >
                    Explore Hardware Collection
                  </Link>
                </div>
              ) : (
                userOrders.map((order) => {
                  const currentMilestoneIdx = getMilestoneIndex(order.status);
                  const isExpanded = !!expandedOrderIds[order.id];

                  return (
                    <div
                      key={order.id}
                      className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-6 shadow-xs"
                    >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDD2C0]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-lg text-[#2B1A16]">
                            Order #{order.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] uppercase ${
                              order.status === 'Delivered'
                                ? 'bg-[#4C7A34]/15 text-[#4C7A34]'
                                : order.status === 'Cancelled'
                                ? 'bg-[#B3402F]/15 text-[#B3402F]'
                                : 'bg-[#9A8029]/15 text-[#9A8029]'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <span className="text-xs text-[#2B1A16]/60 mt-0.5 block">
                          Placed on {order.date} • Paid via {order.paymentMethod}
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-[#2B1A16]/60 block uppercase">Total Amount</span>
                        <strong className="font-serif text-xl text-[#2B1A16]">
                          ₹{order.total.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    {/* Step-by-Step Live Journey Banner */}
                    <div className="bg-[#EFE8DD]/70 border border-[#DDD2C0] p-4 rounded-[4px] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-[#2B1A16]">
                          <Truck className="w-4 h-4 text-[#9A8029]" />
                          <span>
                            Courier:{' '}
                            <strong className="text-[#2B1A16]">
                              {order.courierPartner || 'BlueDart Express Air'}
                            </strong>
                          </span>
                          <span className="text-[#DDD2C0]">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(order.trackingNumber);
                              addToast(`Tracking ID ${order.trackingNumber} copied!`, 'info');
                            }}
                            className="inline-flex items-center gap-1 text-[#9A8029] hover:underline font-mono"
                          >
                            <code>{order.trackingNumber}</code>
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-xs text-[#4C7A34] font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#9A8029]" />
                          <span>Est. Delivery: {order.estimatedDelivery || 'In 3-4 Days'}</span>
                        </div>
                      </div>

                      {/* Where it is right now */}
                      <div className="p-3 bg-white rounded-[3px] border border-[#DDD2C0] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#9A8029] shrink-0" />
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#2B1A16]/50 block">
                              Current Shipment Hub Location
                            </span>
                            <strong className="text-[#2B1A16] text-xs">
                              {order.currentLocation || 'In Transit to Regional Logistics Hub'}
                            </strong>
                          </div>
                        </div>

                        {/* Interactive Advance Step Simulation Button */}
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => {
                              advanceOrderStatus(order.id);
                              addToast(`Order #${order.id} tracking milestone updated!`, 'success');
                            }}
                            className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-[2px] transition-colors flex items-center gap-1 shrink-0"
                            title="Advance to next step to test real-time tracking progression"
                          >
                            <PlayCircle className="w-3 h-3 text-[#9A8029]" /> Next Tracking Step
                          </button>
                        )}
                      </div>

                      {/* Visual 5-Step Stepper */}
                      <div className="pt-2">
                        <div className="grid grid-cols-5 gap-1 text-center relative py-2">
                          {statusMilestones.map((step, idx) => {
                            const isCompleted = idx <= currentMilestoneIdx && order.status !== 'Cancelled';
                            const isCurrent = idx === currentMilestoneIdx && order.status !== 'Cancelled';

                            return (
                              <div key={step} className="flex flex-col items-center relative">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    isCompleted
                                      ? 'bg-[#2B1A16] text-[#EFE8DD]'
                                      : 'bg-[#DDD2C0] text-[#2B1A16]/40'
                                  } ${isCurrent ? 'ring-2 ring-[#9A8029] scale-110 shadow-xs' : ''}`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-[#9A8029]" />
                                  ) : (
                                    idx + 1
                                  )}
                                </div>
                                <span
                                  className={`text-[10px] font-bold mt-1.5 leading-tight ${
                                    isCompleted ? 'text-[#2B1A16]' : 'text-[#2B1A16]/40'
                                  }`}
                                >
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Detailed Step-by-Step Timeline Dropdown */}
                      <div className="pt-2 border-t border-[#DDD2C0]/50">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrderIds((prev) => ({ ...prev, [order.id]: !prev[order.id] }))
                          }
                          className="flex items-center justify-between w-full text-xs text-[#2B1A16]/70 hover:text-[#2B1A16] font-semibold"
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#9A8029]" />
                            {isExpanded ? 'Hide Detailed Transit Logs' : 'View Detailed Transit Logs & History'}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-3 pt-3 border-t border-[#DDD2C0]/40 pl-2">
                            {order.statusHistory.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-3 text-xs">
                                <div
                                  className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                                    step.completed ? 'bg-[#9A8029]' : 'bg-[#DDD2C0]'
                                  }`}
                                />
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                    <strong
                                      className={`${
                                        step.completed ? 'text-[#2B1A16]' : 'text-[#2B1A16]/40'
                                      }`}
                                    >
                                      {step.status} {step.location ? `• ${step.location}` : ''}
                                    </strong>
                                    <span className="text-[10px] text-[#2B1A16]/50 font-mono">
                                      {step.timestamp}
                                    </span>
                                  </div>
                                  <p
                                    className={`text-[11px] mt-0.5 ${
                                      step.completed ? 'text-[#2B1A16]/70' : 'text-[#2B1A16]/40'
                                    }`}
                                  >
                                    {step.note}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="divide-y divide-[#DDD2C0]/40">
                      {order.items.map((item, i) => (
                        <div key={i} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-14 rounded-[2px] overflow-hidden bg-[#DDD2C0]/30 shrink-0">
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <Link
                                href={`/product/${item.product.slug}`}
                                className="font-serif font-medium text-sm text-[#2B1A16] hover:text-[#9A8029] line-clamp-1"
                              >
                                {item.product.name}
                              </Link>
                              <span className="text-[#2B1A16]/70 mt-0.5 block">
                                {item.selectedColor} • Edition: {item.selectedSize} • Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <span className="font-serif font-bold text-sm text-[#2B1A16]">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Destination & Action Footer */}
                    <div className="pt-3 border-t border-[#DDD2C0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-[#2B1A16]/80">
                        <span className="font-semibold text-[#2B1A16]">Recipient:</span>{' '}
                        {order.address.name} ({order.address.phone}) • {order.address.street},{' '}
                        {order.address.city} - {order.address.pincode}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('Please enter cancellation reason:', 'Delivery schedule adjustment');
                              if (reason) {
                                cancelOrder(order.id, reason);
                                addToast(`Order #${order.id} cancelled.`, 'info');
                              }
                            }}
                            className="text-[#B3402F] hover:underline font-semibold"
                          >
                            Cancel Order
                          </button>
                        )}
                        {order.status === 'Delivered' && (
                          <button
                            type="button"
                            onClick={() => {
                              setReturnOrderId(order.id);
                              setActiveTab('returns');
                            }}
                            className="text-[#9A8029] hover:underline font-semibold"
                          >
                            Request Return / Exchange
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            </div>
          );
        })()}

        {/* ============================================================ */}
        {/* TAB 3: SAVED ADDRESSES (DESTINATIONS CRUD) */}
        {/* ============================================================ */}
        {activeTab === 'addresses' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16]">
                  Saved Delivery Destinations
                </h3>
                <p className="text-xs text-[#2B1A16]/70 mt-0.5">
                  Manage your verified delivery locations for expedited checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-[3px] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Destination
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-10 text-center rounded-[4px]">
                <MapPin className="w-10 h-10 text-[#9A8029]/50 mx-auto mb-2" />
                <h4 className="font-serif text-lg font-medium text-[#2B1A16] mb-1">
                  No destinations saved yet
                </h4>
                <p className="text-xs text-[#2B1A16]/60 mb-4">
                  Add your primary residence or studio for seamless checkout.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase px-5 py-2.5 rounded-[3px] transition-colors"
                >
                  Add Destination Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <strong className="font-serif text-sm text-[#2B1A16]">
                            {addr.name}
                          </strong>
                          <span className="text-[10px] bg-[#2B1A16]/10 text-[#2B1A16] px-1.5 py-0.5 rounded-[2px] uppercase font-bold">
                            {addr.type}
                          </span>
                        </div>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-[#9A8029]/15 text-[#9A8029] font-bold px-2 py-0.5 rounded-[2px] uppercase">
                            Primary
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#2B1A16]/80 leading-relaxed mb-3">
                        {addr.street}, {addr.locality ? `${addr.locality}, ` : ''}
                        {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <span className="text-xs text-[#2B1A16]/60">Phone: +91 {addr.phone}</span>
                    </div>

                    <div className="pt-4 border-t border-[#DDD2C0]/50 mt-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="text-[#9A8029] hover:underline font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this delivery destination?')) {
                              deleteAddress(addr.id);
                              addToast('Address deleted.', 'info');
                            }
                          }}
                          className="text-[#B3402F] hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>

                      {!addr.isDefault ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDefaultAddress(addr.id);
                            addToast('Primary delivery address updated.', 'success');
                          }}
                          className="text-[#2B1A16] hover:text-[#9A8029] font-semibold text-[11px]"
                        >
                          Set as Primary
                        </button>
                      ) : (
                        <span className="text-[#4C7A34] text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Default Address
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: COMPLIMENTARY RETURNS & WARRANTY */}
        {/* ============================================================ */}
        {activeTab === 'returns' && (
          <div className="max-w-2xl bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 sm:p-8">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16] mb-2">
              Complimentary 15-Day Return & Hardware Warranty
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mb-6 leading-relaxed">
              Every authentic Mewak hardware product includes doorstep pickup and diagnostic exchange privilege. Verified refunds are credited within 48 hours of inspection.
            </p>

            {orders.length === 0 ? (
              <div className="p-4 bg-[#EFE8DD]/50 rounded-[3px] text-xs text-[#2B1A16]/70 text-center">
                You have no active orders eligible for return requests.
              </div>
            ) : returnSuccess ? (
              <div className="bg-[#4C7A34]/15 border border-[#4C7A34] text-[#2B1A16] p-6 rounded-[4px] text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#4C7A34] mx-auto" />
                <h4 className="font-serif text-lg font-bold text-[#2B1A16]">
                  Return Request Initiated
                </h4>
                <p className="text-xs text-[#2B1A16]/80 max-w-md mx-auto">
                  Doorstep reverse logistics scheduled for Order <strong>#{returnOrderId}</strong>. A reverse courier tracking SMS has been transmitted.
                </p>
                <button
                  type="button"
                  onClick={() => setReturnSuccess(false)}
                  className="bg-[#2B1A16] text-[#EFE8DD] text-xs font-semibold uppercase px-4 py-2 rounded-[2px]"
                >
                  Create Another Request
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!returnOrderId) return;
                  requestReturn(returnOrderId, returnReason);
                  setReturnSuccess(true);
                  addToast(`Return request initiated for Order #${returnOrderId}`, 'success');
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                    Select Order Identifier *
                  </label>
                  <select
                    value={returnOrderId}
                    onChange={(e) => setReturnOrderId(e.target.value)}
                    required
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  >
                    <option value="">-- Choose Order to Return --</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        Order #{o.id} ({o.date}) - ₹{o.total.toLocaleString('en-IN')} [{o.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                    Reason for Return / Exchange *
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  >
                    <option>Comfort or fit issue with ear cushions / watch band</option>
                    <option>Exchange for different colorway or storage edition</option>
                    <option>Diagnostic hardware issue or audio calibration discrepancy</option>
                    <option>Packaging arrived damaged in courier transit</option>
                    <option>Changed mind / 15-day risk-free return</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16]/80 mb-1">
                    Refund / Resolution Preference
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="refundMode"
                        checked={returnRefundMode === 'Original Payment Method'}
                        onChange={() => setReturnRefundMode('Original Payment Method')}
                        className="accent-[#9A8029]"
                      />
                      <span>Refund to original bank account / card / UPI (3-5 days)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="refundMode"
                        checked={returnRefundMode === 'Mewak Store Credit'}
                        onChange={() => setReturnRefundMode('Mewak Store Credit')}
                        className="accent-[#9A8029]"
                      />
                      <span>Instant Mewak Store Credit + 5% bonus privilege coupon</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-widest py-3 rounded-[3px] transition-colors"
                  >
                    Schedule Doorstep Pickup
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: EDIT PROFESSIONAL PROFILE DETAILS */}
      {/* ============================================================ */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-4 right-4 text-[#2B1A16]/60 hover:text-[#2B1A16] p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-semibold text-[#2B1A16] mb-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#9A8029]" />
              Edit Professional Patron Profile
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mb-5">
              Refine your professional credentials, business identity, and dispatch preferences.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Professional Headline / Role
                  </label>
                  <input
                    type="text"
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    placeholder="e.g. Lead Acoustic Consultant"
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                    placeholder="e.g. Studio Acoustics Ltd"
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={profileForm.industry}
                    onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  >
                    <option value="">-- Select Industry --</option>
                    <option value="Audio & Sound Engineering">Audio & Sound Engineering</option>
                    <option value="Information Technology / Software">Information Technology / Software</option>
                    <option value="Design & Architecture">Design & Architecture</option>
                    <option value="Finance & Executive Leadership">Finance & Executive Leadership</option>
                    <option value="Medical & Science">Medical & Science</option>
                    <option value="Other">Other Private Connoisseur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Executive Bio / Sound Profile
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Share a brief note about your studio setup or acoustic preference..."
                  className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Alternate Contact Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.alternatePhone}
                    onChange={(e) => setProfileForm({ ...profileForm, alternatePhone: e.target.value })}
                    placeholder="Optional secondary phone"
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Business GSTIN (Tax Invoice)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={profileForm.gstNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Preferred Delivery Window
                  </label>
                  <select
                    value={profileForm.preferredDeliveryTime}
                    onChange={(e) => setProfileForm({ ...profileForm, preferredDeliveryTime: e.target.value as any })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  >
                    <option value="Anytime">Anytime (Express Courier)</option>
                    <option value="Morning (9 AM - 1 PM)">Morning (9 AM - 1 PM)</option>
                    <option value="Afternoon (1 PM - 6 PM)">Afternoon (1 PM - 6 PM)</option>
                    <option value="Evening (6 PM - 9 PM)">Evening (6 PM - 9 PM)</option>
                    <option value="Weekends Only">Weekends Only</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#DDD2C0]">
                <button
                  type="submit"
                  className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase px-5 py-2.5 rounded-[3px] transition-colors"
                >
                  Save Profile Details
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="border border-[#DDD2C0] text-[#2B1A16] text-xs font-semibold uppercase px-4 py-2.5 rounded-[3px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CHANGE EMAIL WITH VERIFICATION CODE */}
      {/* ============================================================ */}
      {showEmailVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setShowEmailVerifyModal(false)}
              className="absolute top-4 right-4 text-[#2B1A16]/60 hover:text-[#2B1A16] p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-semibold text-[#2B1A16] mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#9A8029]" />
              Change Verified Email Address
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mb-5">
              Requires verification token transmission to prevent unauthorized access.
            </p>

            {emailStep === 'input' ? (
              <form onSubmit={handleSendEmailVerification} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter your new email address"
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider py-2.5 rounded-[3px] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send 6-Digit Verification Token
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmEmailVerification} className="space-y-4 text-xs">
                <div className="p-3 bg-[#9A8029]/10 border border-[#9A8029]/30 rounded-[3px] text-center">
                  <span className="text-[11px] text-[#2B1A16]/80 block">
                    Verification code sent to <strong>{newEmail}</strong>
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="text-xs text-[#9A8029] font-bold">Code: {emailToken}</span>
                    <button
                      type="button"
                      onClick={() => setInputEmailCode(emailToken)}
                      className="text-[10px] bg-[#2B1A16] text-[#EFE8DD] px-2 py-0.5 rounded-[2px] font-bold uppercase"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Enter 6-Digit Token
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={inputEmailCode}
                    onChange={(e) => setInputEmailCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-center text-sm font-bold tracking-widest text-[#2B1A16] outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase py-2.5 rounded-[3px] transition-colors"
                  >
                    Confirm & Update Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailStep('input')}
                    className="border border-[#DDD2C0] text-[#2B1A16] text-xs font-semibold uppercase px-4 py-2.5 rounded-[3px]"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: CHANGE PHONE WITH OTP VERIFICATION */}
      {/* ============================================================ */}
      {showPhoneVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setShowPhoneVerifyModal(false)}
              className="absolute top-4 right-4 text-[#2B1A16]/60 hover:text-[#2B1A16] p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-semibold text-[#2B1A16] mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#9A8029]" />
              Change Verified Mobile Number
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mb-5">
              Requires 6-digit SMS OTP verification before linking to your account.
            </p>

            {phoneStep === 'input' ? (
              <form onSubmit={handleSendPhoneVerification} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    New 10-Digit Mobile Number
                  </label>
                  <div className="flex rounded-[3px] border border-[#DDD2C0] bg-white overflow-hidden">
                    <span className="bg-[#EFE8DD] px-3 py-2 text-[#9A8029] border-r border-[#DDD2C0] text-xs font-semibold text-[#2B1A16]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98XXXXXXXX"
                      className="w-full px-3 py-2 text-xs text-[#2B1A16] outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider py-2.5 rounded-[3px] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Transmit 6-Digit OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmPhoneVerification} className="space-y-4 text-xs">
                <div className="p-3 bg-[#9A8029]/10 border border-[#9A8029]/30 rounded-[3px] text-center">
                  <span className="text-[11px] text-[#2B1A16]/80 block">
                    Authentication OTP sent to <strong>+91 {newPhone}</strong>
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="text-xs text-[#9A8029] font-bold">OTP: {phoneToken}</span>
                    <button
                      type="button"
                      onClick={() => setInputPhoneCode(phoneToken)}
                      className="text-[10px] bg-[#2B1A16] text-[#EFE8DD] px-2 py-0.5 rounded-[2px] font-bold uppercase"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={inputPhoneCode}
                    onChange={(e) => setInputPhoneCode(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-center text-sm font-bold tracking-widest text-[#2B1A16] outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase py-2.5 rounded-[3px] transition-colors"
                  >
                    Confirm & Update Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneStep('input')}
                    className="border border-[#DDD2C0] text-[#2B1A16] text-xs font-semibold uppercase px-4 py-2.5 rounded-[3px]"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: CHANGE PASSWORD WITH CURRENT PASSWORD VERIFICATION */}
      {/* ============================================================ */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setShowPasswordChangeModal(false)}
              className="absolute top-4 right-4 text-[#2B1A16]/60 hover:text-[#2B1A16] p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-semibold text-[#2B1A16] mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#9A8029]" />
              Change Security Password
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mb-5">
              Requires verification of your current password before updating credentials.
            </p>

            {passwordError && (
              <div className="mb-4 p-2.5 bg-[#B3402F]/10 border border-[#B3402F]/30 text-[#B3402F] text-xs rounded-[3px]">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleSavePasswordChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  New Password * (Min 6 Characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new strong password"
                  className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#DDD2C0]">
                <button
                  type="submit"
                  className="flex-1 bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase py-2.5 rounded-[3px] transition-colors"
                >
                  Verify & Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="border border-[#DDD2C0] text-[#2B1A16] text-xs font-semibold uppercase px-4 py-2.5 rounded-[3px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: AVATAR CUSTOMIZATION */}
      {/* ============================================================ */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-4 right-4 text-[#2B1A16]/60 hover:text-[#2B1A16] p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-semibold text-[#2B1A16] mb-1">
              Select Patron Avatar
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mb-4">
              Choose an executive profile portrait or use default initials.
            </p>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {AVATAR_PRESETS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    updateProfile({ avatarUrl: url });
                    setShowAvatarModal(false);
                    addToast('Avatar photo updated.', 'success');
                  }}
                  className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-transparent hover:border-[#9A8029] transition-all shadow-xs mx-auto"
                >
                  <Image src={url} alt="Preset" fill className="object-cover" />
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#DDD2C0] flex justify-between items-center text-xs">
              {user.avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    deleteProfileField('avatarUrl');
                    setShowAvatarModal(false);
                    addToast('Reset to default initials badge.', 'info');
                  }}
                  className="text-[#B3402F] hover:underline"
                >
                  Remove Photo
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="border border-[#DDD2C0] text-[#2B1A16] px-4 py-2 rounded-[3px] ml-auto uppercase text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: ADD / EDIT DELIVERY ADDRESS */}
      {/* ============================================================ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="absolute top-4 right-4 text-[#2B1A16]/60 hover:text-[#2B1A16] p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-semibold text-[#2B1A16] mb-1">
              {editingAddressId ? 'Edit Delivery Destination' : 'Add New Delivery Destination'}
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mb-5">
              Enter precise delivery coordinates for our express logistics courier.
            </p>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })
                    }
                    placeholder="10-digit mobile"
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Street Address, Flat / House No, Building *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="e.g. 402, Signature Towers, MG Road"
                  className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Locality / Landmark
                </label>
                <input
                  type="text"
                  value={addressForm.locality}
                  onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                  placeholder="e.g. Near City Center Mall"
                  className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  {(['Home', 'Work', 'Other'] as const).map((t) => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="addrType"
                        checked={addressForm.type === t}
                        onChange={() => setAddressForm({ ...addressForm, type: t })}
                        className="accent-[#9A8029]"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="accent-[#9A8029]"
                  />
                  <span>Set as Default</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#DDD2C0]">
                <button
                  type="submit"
                  className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase px-5 py-2.5 rounded-[3px] transition-colors"
                >
                  {editingAddressId ? 'Save Address' : 'Add Destination'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="border border-[#DDD2C0] text-[#2B1A16] text-xs font-semibold uppercase px-4 py-2.5 rounded-[3px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 7: DELETE ACCOUNT CONFIRMATION */}
      {/* ============================================================ */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FBF7F0] border border-[#B3402F]/40 shadow-2xl rounded-[4px] p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#B3402F]/15 flex items-center justify-center text-[#B3402F] mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#2B1A16]">
              Permanently Delete Profile?
            </h3>

            <p className="text-xs text-[#2B1A16]/80 leading-relaxed">
              This action will completely remove your personal patron record, addresses, and sign you out of all sessions. This cannot be undone.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  deleteAccount();
                  setShowDeleteAccountModal(false);
                  addToast('Your patron profile has been deleted.', 'info');
                }}
                className="flex-1 bg-[#B3402F] hover:bg-[#8F2E20] text-white text-xs font-semibold uppercase py-2.5 rounded-[3px] transition-colors"
              >
                Yes, Delete My Account
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 border border-[#DDD2C0] text-[#2B1A16] text-xs font-semibold uppercase py-2.5 rounded-[3px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}