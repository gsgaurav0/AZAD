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
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Address, Order, OrderStatus } from '@/types';

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
  } = useAuthStore();

  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const addToast = useUIStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'returns'>('profile');

  // Profile Edit Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    alternatePhone: user?.alternatePhone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: (user?.gender || 'Prefer not to say') as 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say',
  });

  // Account Deletion Confirm Modal
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Address Modal (Add / Edit) State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
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

  // Expanded Orders for detailed timeline
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  // Return Request Form State
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('Comfort or fit issue with ear cushions / watch band');
  const [returnRefundMode, setReturnRefundMode] = useState('Original Payment Method');
  const [returnSuccess, setReturnSuccess] = useState(false);

  if (!isLoggedIn || !user) {
    return (
      <div className="bg-[#EFE8DD] min-h-screen py-24 text-center px-4">
        <div className="max-w-md mx-auto bg-[#FBF7F0] border border-[#DDD2C0] p-8 rounded-[4px] shadow-sm font-sans">
          <div className="w-16 h-16 rounded-full bg-[#EFE8DD] flex items-center justify-center text-[#9A8029] mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#2B1A16] mb-2">
            Patron Profile Access
          </h2>
          <p className="text-xs text-[#2B1A16]/70 mb-6 leading-relaxed">
            Sign in or create your patron profile to manage your personal details, saved delivery addresses, and track orders with live step-by-step progress.
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

  // Handle Edit Profile Open
  const handleOpenEditProfile = () => {
    setProfileForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      alternatePhone: user.alternatePhone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || 'Prefer not to say',
    });
    setShowEditProfileModal(true);
  };

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      addToast('Name and email are required fields.', 'error');
      return;
    }
    updateProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
      alternatePhone: profileForm.alternatePhone.trim() || undefined,
      dateOfBirth: profileForm.dateOfBirth || undefined,
      gender: profileForm.gender,
    });
    setShowEditProfileModal(false);
    addToast('Profile details updated successfully.', 'success');
  };

  // Handle Delete Optional Field
  const handleDeleteField = (field: keyof typeof user, fieldLabel: string) => {
    if (confirm(`Are you sure you want to remove your ${fieldLabel}?`)) {
      deleteProfileField(field);
      addToast(`${fieldLabel} removed from your profile.`, 'info');
    }
  };

  // Handle Address Modal Open for Add
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

  // Handle Address Modal Open for Edit
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

  // Handle Address Save (Add or Update)
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      addToast('Please complete all mandatory address fields.', 'error');
      return;
    }

    if (editingAddressId) {
      updateAddress({
        ...addressForm,
        id: editingAddressId,
      });
      addToast('Delivery address updated successfully.', 'success');
    } else {
      addAddress(addressForm);
      addToast('New delivery address added.', 'success');
    }

    setShowAddressModal(false);
    setEditingAddressId(null);
  };

  // Handle Order Advance Step (Simulation for Testing)
  const handleAdvanceOrder = (orderId: string) => {
    advanceOrderStatus(orderId);
    addToast(`Order #${orderId} tracking milestone updated!`, 'success');
  };

  // Handle Order Cancel
  const handleCancelOrder = (orderId: string) => {
    const reason = prompt('Please enter a cancellation reason:', 'Changed delivery preferences');
    if (reason !== null) {
      const ok = cancelOrder(orderId, reason);
      if (ok) {
        addToast(`Order #${orderId} has been cancelled.`, 'info');
      } else {
        addToast('This order cannot be cancelled as it is already delivered.', 'error');
      }
    }
  };

  // Copy tracking number
  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    addToast(`Tracking ID ${tracking} copied to clipboard!`, 'info');
  };

  const statusMilestones: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const getMilestoneIndex = (status: OrderStatus) => {
    const idx = statusMilestones.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-10 md:py-16 border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Account Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-[#DDD2C0] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-sans">
              <span className="text-xs uppercase tracking-[0.25em] text-[#9A8029] font-bold">
                PATRON PROFILE
              </span>
              <span className="text-[10px] bg-[#9A8029]/15 text-[#9A8029] font-bold px-2 py-0.5 rounded-[2px] uppercase">
                {user.memberTier || 'Gold Patron Member'}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1A16] font-normal">
              Salutations, {user.name}
            </h1>
            <p className="text-xs text-[#2B1A16]/70 mt-1 font-sans">
              {user.email} • {user.phone} • Member since {user.joinedDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenEditProfile}
              className="inline-flex items-center gap-1.5 text-xs bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] font-semibold px-4 py-2 rounded-[3px] transition-colors font-sans"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs border border-[#DDD2C0] bg-white hover:bg-[#EFE8DD] text-[#B3402F] font-semibold px-4 py-2 rounded-[3px] transition-colors font-sans"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-[4px] border border-[#DDD2C0] bg-[#FBF7F0] p-1 mb-8 max-w-3xl overflow-x-auto text-xs font-semibold uppercase tracking-wider font-sans">
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
            <span>Personal Info</span>
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
            <span>My Orders ({orders.length})</span>
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
            <span>Addresses ({savedAddresses.length})</span>
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
        {/* TAB 1: PERSONAL INFO (PROFILE CRUD) */}
        {/* ============================================================ */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
            {/* Left: Profile Summary Card */}
            <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 text-center space-y-4">
              <div className="relative w-24 h-24 rounded-full bg-[#EFE8DD] border-2 border-[#9A8029] flex items-center justify-center mx-auto text-[#2B1A16] text-2xl font-serif font-bold shadow-inner">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <div>
                <h3 className="font-serif text-xl font-semibold text-[#2B1A16]">
                  {user.name}
                </h3>
                <span className="inline-block text-[11px] bg-[#9A8029]/15 text-[#9A8029] font-bold px-2.5 py-0.5 rounded-[2px] uppercase mt-1">
                  {user.memberTier || 'Gold Patron Member'}
                </span>
              </div>

              <div className="pt-4 border-t border-[#DDD2C0] grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-[#EFE8DD]/50 rounded-[3px]">
                  <span className="text-[10px] text-[#2B1A16]/60 uppercase block font-semibold">
                    Total Orders
                  </span>
                  <strong className="text-base font-serif text-[#2B1A16]">{orders.length}</strong>
                </div>
                <div className="p-2.5 bg-[#EFE8DD]/50 rounded-[3px]">
                  <span className="text-[10px] text-[#2B1A16]/60 uppercase block font-semibold">
                    Saved Addresses
                  </span>
                  <strong className="text-base font-serif text-[#2B1A16]">{savedAddresses.length}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider py-2.5 rounded-[3px] transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile Details
              </button>
            </div>

            {/* Right: Detailed Personal Info & Security Actions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#DDD2C0]">
                  <h3 className="font-serif text-xl font-semibold text-[#2B1A16]">
                    Personal Information Details
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="text-xs text-[#9A8029] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Full Legal Name
                    </span>
                    <strong className="text-sm text-[#2B1A16]">{user.name}</strong>
                  </div>

                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Email Address
                    </span>
                    <strong className="text-sm text-[#2B1A16]">{user.email}</strong>
                  </div>

                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px]">
                    <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                      Primary Mobile Number
                    </span>
                    <strong className="text-sm text-[#2B1A16]">{user.phone}</strong>
                  </div>

                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px] flex items-center justify-between">
                    <div>
                      <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                        Alternate Contact Number
                      </span>
                      <strong className="text-sm text-[#2B1A16]">
                        {user.alternatePhone || 'Not provided'}
                      </strong>
                    </div>
                    {user.alternatePhone && (
                      <button
                        type="button"
                        onClick={() => handleDeleteField('alternatePhone', 'Alternate Phone')}
                        className="text-[#B3402F] hover:underline text-[11px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px] flex items-center justify-between">
                    <div>
                      <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                        Date of Birth
                      </span>
                      <strong className="text-sm text-[#2B1A16]">
                        {user.dateOfBirth || 'Not provided'}
                      </strong>
                    </div>
                    {user.dateOfBirth && (
                      <button
                        type="button"
                        onClick={() => handleDeleteField('dateOfBirth', 'Date of Birth')}
                        className="text-[#B3402F] hover:underline text-[11px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="p-3 bg-[#EFE8DD]/40 border border-[#DDD2C0]/70 rounded-[3px] flex items-center justify-between">
                    <div>
                      <span className="text-[#2B1A16]/60 block mb-0.5 font-medium uppercase text-[10px]">
                        Gender Identification
                      </span>
                      <strong className="text-sm text-[#2B1A16]">
                        {user.gender || 'Prefer not to say'}
                      </strong>
                    </div>
                    {user.gender && user.gender !== 'Prefer not to say' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteField('gender', 'Gender')}
                        className="text-[#B3402F] hover:underline text-[11px]"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Security & Data Management */}
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-4 text-xs">
                <h4 className="font-serif text-base font-semibold text-[#2B1A16]">
                  Security & Profile Lifecycle
                </h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-[#DDD2C0] bg-white rounded-[3px]">
                  <div>
                    <strong className="text-[#2B1A16] block text-xs">Delete Patron Account</strong>
                    <p className="text-[11px] text-[#2B1A16]/60 mt-0.5">
                      Permanently erase all personal profile records and saved delivery destinations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="border border-[#B3402F] text-[#B3402F] hover:bg-[#B3402F] hover:text-white px-3.5 py-1.5 rounded-[3px] text-xs font-semibold transition-colors shrink-0"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MY ORDERS WITH STEP-BY-STEP LIVE LOCATION TRACKING */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <div className="space-y-6 font-sans">
            {orders.length === 0 ? (
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-12 text-center rounded-[4px]">
                <Package className="w-12 h-12 text-[#9A8029]/50 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-medium text-[#2B1A16] mb-1">
                  No orders placed yet
                </h3>
                <p className="text-xs text-[#2B1A16]/60 mb-6 font-sans max-w-sm mx-auto">
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
              orders.map((order) => {
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
                            onClick={() => handleCopyTracking(order.trackingNumber)}
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
                            onClick={() => handleAdvanceOrder(order.id)}
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
                          onClick={() => toggleOrderExpand(order.id)}
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

                    {/* Order Bottom Destination & Action Row */}
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
                            onClick={() => handleCancelOrder(order.id)}
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
        )}

        {/* ============================================================ */}
        {/* TAB 3: SAVED ADDRESSES (ADDRESS CRUD) */}
        {/* ============================================================ */}
        {activeTab === 'addresses' && (
          <div className="space-y-6 max-w-4xl font-sans">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16]">
                  Saved Delivery Destinations
                </h3>
                <p className="text-xs text-[#2B1A16]/70 mt-0.5">
                  Manage your personal shipping addresses for expedited 1-click checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-[3px] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Address
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-10 text-center rounded-[4px]">
                <MapPin className="w-10 h-10 text-[#9A8029]/50 mx-auto mb-2" />
                <h4 className="font-serif text-lg font-medium text-[#2B1A16] mb-1">
                  No delivery address saved yet
                </h4>
                <p className="text-xs text-[#2B1A16]/60 mb-4">
                  Add your primary residence or workplace for seamless checkout.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase px-5 py-2.5 rounded-[3px] transition-colors"
                >
                  Add Address Now
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
                            Default Address
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
                            if (confirm('Delete this delivery address?')) {
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
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-[#4C7A34] text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Primary
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
          <div className="max-w-2xl bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 sm:p-8 font-sans">
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
      {/* MODAL: EDIT PROFILE MODAL */}
      {/* ============================================================ */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/70 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-lg bg-[#FBF7F0] border border-[#DDD2C0] shadow-2xl rounded-[4px] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-4 right-4 text-[#2B1A16]/60 hover:text-[#2B1A16] p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-semibold text-[#2B1A16] mb-1">
              Edit Patron Profile Details
            </h3>
            <p className="text-xs text-[#2B1A16]/70 mb-5">
              Update your real contact information and personal preferences.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                  Full Name *
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
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Primary Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#2B1A16]/80 mb-1">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={profileForm.alternatePhone}
                    onChange={(e) => setProfileForm({ ...profileForm, alternatePhone: e.target.value })}
                    placeholder="Optional secondary phone"
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
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
                    Gender
                  </label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        gender: e.target.value as any,
                      })
                    }
                    className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#DDD2C0]">
                <button
                  type="submit"
                  className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase px-5 py-2.5 rounded-[3px] transition-colors"
                >
                  Save Changes
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
      {/* MODAL: ADD / EDIT ADDRESS MODAL */}
      {/* ============================================================ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/70 backdrop-blur-xs font-sans">
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
      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      {/* ============================================================ */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1A16]/75 backdrop-blur-xs font-sans">
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