'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ShieldCheck,
  MapPin,
  CreditCard,
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
  User,
  Key,
  Sparkles,
  AlertCircle,
  Truck,
  Smartphone,
  Mail,
  ShoppingBag,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useCouponStore } from '@/store/couponStore';
import { useIsMounted } from '@/hooks/useIsMounted';
import { loadRazorpayScript } from '@/lib/loadRazorpay';

export default function CheckoutPage() {
  const router = useRouter();
  const isMounted = useIsMounted();

  // Stores
  const {
    items,
    getSubtotal,
    getShippingFee,
    getCouponDiscount,
    getTotal,
    appliedCoupon,
    clearCart,
  } = useCartStore();

  const {
    isLoggedIn,
    user,
    savedAddresses,
    addAddress,
    placeOrder,
    login,
    loginWithOtp,
    signup,
  } = useAuthStore();

  const addToast = useUIStore((state) => state.addToast);

  // Stepper State (1: Address, 2: Payment, 3: Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Auth Gate State (when unauthenticated)
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [authError, setAuthError] = useState('');

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Selected Address & New Address Form
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    street: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home' as 'Home' | 'Work' | 'Other',
  });
  const [addressError, setAddressError] = useState('');

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<
    'Online Payment (Razorpay)' | 'Cash on Delivery' | 'UPI' | 'Credit/Debit Card' | 'Net Banking'
  >('Online Payment (Razorpay)');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Sync address form and selected address when user or savedAddresses change
  useEffect(() => {
    if (user) {
      setAddressForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone?.replace(/\D/g, '').slice(-10) || '',
      }));
    }

    if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      if (!selectedAddressId && defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
      setIsAddingNewAddress(false);
    } else {
      setIsAddingNewAddress(true);
    }
  }, [user, savedAddresses, selectedAddressId]);

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const discount = getCouponDiscount();
  const total = getTotal();

  const selectedAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  // Auth Gate Handlers
  const handleSendOtp = () => {
    const clean = authIdentifier.trim();
    if (!clean) {
      setAuthError('Please enter your email or 10-digit mobile number.');
      return;
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setAuthError('');
    useAuthStore.getState().sendOtp(clean).catch(() => {});
    addToast(`Verification code dispatched to ${clean}.`, 'info');
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authIdentifier.trim()) {
      setAuthError('Please provide your registered mobile number or email address.');
      return;
    }

    if (loginMethod === 'otp') {
      if (!otpSent) {
        handleSendOtp();
        return;
      }
      if (authOtp.trim() !== generatedOtp) {
        setAuthError('Invalid verification code. Please check and enter the valid code.');
        return;
      }
    } else {
      if (!authPassword) {
        setAuthError('Please enter your password.');
        return;
      }
    }

    const res =
      loginMethod === 'otp'
        ? await loginWithOtp(authIdentifier, authOtp)
        : await login(authIdentifier, authPassword);

    if (!res.success) {
      setAuthError(res.error || 'Authentication failed. Please verify credentials.');
      return;
    }

    addToast(`Welcome back, ${res.user?.name || 'Patron'}! Checkout unlocked.`, 'success');
  };

  const handleInlineSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!signupForm.name.trim()) {
      setAuthError('Full Name is required.');
      return;
    }
    const emailClean = signupForm.email.trim().toLowerCase();
    if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      setAuthError('Please enter a valid, complete email address (e.g. patron@domain.com).');
      return;
    }
    if (emailClean.endsWith('@gmail.com') && emailClean.split('@gmail.com')[0].length < 6) {
      setAuthError('Gmail usernames must contain at least 6 characters before @gmail.com.');
      return;
    }
    const cleanPhone = signupForm.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setAuthError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (signupForm.password.length < 6) {
      setAuthError('Password must contain at least 6 characters.');
      return;
    }

    const res = await signup({
      name: signupForm.name.trim(),
      email: signupForm.email.trim(),
      phone: cleanPhone,
      password: signupForm.password,
    });

    if (!res.success) {
      setAuthError(res.error || 'Unable to create account.');
      return;
    }

    addToast(`Account created successfully! Welcome, ${res.user?.name}.`, 'success');
  };

  // Address Handlers
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addressForm.name ||
      !addressForm.phone ||
      !addressForm.street ||
      !addressForm.city ||
      !addressForm.pincode
    ) {
      setAddressError('Please fill out all required address coordinates.');
      return;
    }

    const cleanPhone = addressForm.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setAddressError('Please enter a valid 10-digit mobile number for dispatch updates.');
      return;
    }

    const created = await addAddress({
      name: addressForm.name.trim(),
      phone: cleanPhone,
      street: addressForm.street.trim(),
      locality: addressForm.locality.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim() || 'Delhi',
      pincode: addressForm.pincode.trim(),
      type: addressForm.type,
      isDefault: savedAddresses.length === 0,
    });

    setSelectedAddressId(created.id);
    setIsAddingNewAddress(false);
    setAddressError('');
    addToast('Delivery destination added to your patron profile.', 'success');
  };

  const handleStep1Continue = () => {
    if (!selectedAddress && !isAddingNewAddress) {
      setAddressError('Please select or add a verified delivery destination.');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Continue = () => {
    setCurrentStep(3);
  };

  const handleFinalPlaceOrder = async () => {
    if (!selectedAddress) {
      addToast('Please select a valid delivery address.', 'error');
      setCurrentStep(1);
      return;
    }

    setIsPlacingOrder(true);
    let createdOrderId = '';

    try {
      // 1. Call server-side /api/checkout to validate catalog prices and create order
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          items: items.map((i) => ({
            productId: i.product.id,
            selectedColor: i.selectedColor,
            selectedSize: i.selectedSize,
            quantity: i.quantity,
          })),
          address: selectedAddress,
          couponCode: appliedCoupon || undefined,
          paymentMethod,
          customer: {
            name: user?.name || selectedAddress.name,
            email: user?.email || '',
            phone: user?.phone || selectedAddress.phone,
          },
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutData.success) {
        addToast(checkoutData.error || 'Checkout verification failed.', 'error');
        setIsPlacingOrder(false);
        return;
      }

      createdOrderId = checkoutData.orderId;

      // 2. If Cash on Delivery, complete and inscribe immediately
      if (paymentMethod === 'Cash on Delivery') {
        if (appliedCoupon) {
          useCouponStore.getState().incrementUsage(appliedCoupon);
        }
        if (checkoutData.order) {
          useAuthStore.getState().addOrderToStore({
            ...checkoutData.order,
            status: 'Placed',
          });
        }

        clearCart();
        setIsPlacingOrder(false);
        addToast(`Order #${createdOrderId} confirmed with Doorstep Verification!`, 'success');
        router.push(`/order-success/${createdOrderId}`);
        return;
      }

      // 3. For Online Payments (UPI, Cards, Net Banking, Razorpay): Call Razorpay order API
      const rzpRes = await fetch('/api/payments/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrderId,
          amount: total,
        }),
      });

      const rzpData = await rzpRes.json();
      if (!rzpRes.ok || !rzpData.success) {
        setIsPlacingOrder(false);
        // Clean up the draft order from database so it never dangles as an active order
        try {
          await fetch('/api/orders/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: createdOrderId,
              reason: 'Payment initiation failed: ' + (rzpData.error || 'Gateway error'),
            }),
          });
        } catch {}
        useAuthStore.getState().deleteOrder(createdOrderId);

        const errorMsg =
          rzpData.error ||
          'Failed to initiate payment gateway order. Please check payment credentials.';
        addToast(errorMsg, 'error');
        return;
      }

      // Ensure Razorpay SDK script is loaded
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || typeof window === 'undefined' || !(window as any).Razorpay) {
        setIsPlacingOrder(false);
        try {
          await fetch('/api/orders/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: createdOrderId,
              reason: 'Razorpay script failed to load',
            }),
          });
        } catch {}
        useAuthStore.getState().deleteOrder(createdOrderId);

        addToast(
          'Razorpay payment gateway script could not be loaded. Please check your internet connection.',
          'error'
        );
        return;
      }

      const options = {
        key: rzpData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpData.amount,
        currency: rzpData.currency || 'INR',
        name: 'Mewak Luxury Tech',
        description: `Order #${createdOrderId}`,
        order_id: rzpData.razorpayOrderId,
        prefill: {
          name: selectedAddress.name,
          email: user?.email || '',
          contact: selectedAddress.phone,
        },
        theme: {
          color: '#2B1A16',
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          cleanupRzpMask();
          try {
            // Verify HMAC-SHA256 signature server-side
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: createdOrderId,
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              if (appliedCoupon) {
                useCouponStore.getState().incrementUsage(appliedCoupon);
              }
              // Only add order to user's orders once payment is confirmed & verified
              if (checkoutData.order) {
                useAuthStore.getState().addOrderToStore({
                  ...checkoutData.order,
                  status: 'Placed',
                  paymentStatus: 'paid',
                });
              }
              clearCart();
              addToast(`Payment of ₹${total.toLocaleString('en-IN')} verified successfully!`, 'success');
              router.push(`/order-success/${createdOrderId}`);
            } else {
              addToast(verifyData.error || 'Payment signature verification failed.', 'error');
              setIsPlacingOrder(false);
            }
          } catch (vErr: any) {
            console.error('Payment verification request failed:', vErr);
            addToast(vErr.message || 'Error communicating with verification service.', 'error');
            setIsPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: async function () {
            cleanupRzpMask();
            setIsPlacingOrder(false);
            // Cancel unpaid order in backend so it never appears as an active placed shipment
            try {
              await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: createdOrderId,
                  reason: 'Patron closed Razorpay modal before completing payment.',
                }),
              });
            } catch {}
            useAuthStore.getState().deleteOrder(createdOrderId);
            addToast('Payment cancelled. No order was placed.', 'info');
          },
        },
      };

      // Mask and suppress Razorpay Test Mode banner
      const applyRzpMask = () => {
        let mask = document.getElementById('rzp-test-mode-cover');
        if (!mask) {
          mask = document.createElement('div');
          mask.id = 'rzp-test-mode-cover';
          mask.style.position = 'fixed';
          mask.style.top = '0';
          mask.style.right = '0';
          mask.style.width = '200px';
          mask.style.height = '200px';
          mask.style.background = 'rgba(0, 0, 0, 0.65)';
          mask.style.clipPath = 'polygon(100% 0, 0 0, 100% 100%)';
          mask.style.zIndex = '21474836479';
          mask.style.pointerEvents = 'none';
          document.body.appendChild(mask);
        }
      };

      const cleanupRzpMask = () => {
        const mask = document.getElementById('rzp-test-mode-cover');
        if (mask) mask.remove();
        if (observer) observer.disconnect();
      };

      let observer: MutationObserver | null = null;
      if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(() => {
          const container = document.querySelector('.razorpay-container');
          if (container) {
            applyRzpMask();
            // Also hide any direct host DOM nodes
            const directBadges = document.querySelectorAll(
              '.razorpay-container .ribbon, [class*="ribbon"], div[style*="rotate(45deg)"]'
            );
            directBadges.forEach((node) => {
              (node as HTMLElement).style.setProperty('display', 'none', 'important');
              (node as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
            });
          } else {
            const mask = document.getElementById('rzp-test-mode-cover');
            if (mask) mask.remove();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }

      const razorpayInstance = new (window as any).Razorpay(options);

      // Handle payment failure event
      razorpayInstance.on('payment.failed', async function (failureData: any) {
        cleanupRzpMask();
        console.error('Razorpay payment.failed event:', failureData?.error);
        const description = failureData?.error?.description || 'Payment was declined or failed. Please try again.';
        try {
          await fetch('/api/orders/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: createdOrderId,
              reason: description,
            }),
          });
        } catch {}
        useAuthStore.getState().deleteOrder(createdOrderId);
        addToast(description, 'error');
        setIsPlacingOrder(false);
      });

      razorpayInstance.open();
      applyRzpMask();
      setIsPlacingOrder(false);
    } catch (err: any) {
      console.warn('Place order notice:', err?.message || err);
      if (createdOrderId) {
        try {
          await fetch('/api/orders/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: createdOrderId,
              reason: 'Checkout error: ' + (err?.message || err),
            }),
          });
        } catch {}
        useAuthStore.getState().deleteOrder(createdOrderId);
      }
      addToast(err?.message || 'Error communicating with checkout gateway.', 'error');
      setIsPlacingOrder(false);
    }
  };

  // SSR Hydration Fallback
  if (!isMounted) {
    return (
      <div className="bg-[#EFE8DD] min-h-screen py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#9A8029] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-[#2B1A16]/70 font-sans">
            Loading Secure Checkout...
          </span>
        </div>
      </div>
    );
  }

  // Empty Bag Check
  if (items.length === 0) {
    return (
      <div className="bg-[#EFE8DD] min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-10 sm:p-14 text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#EFE8DD] flex items-center justify-center text-[#9A8029] mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 opacity-70" />
          </div>
          <h2 className="font-serif text-2xl text-[#2B1A16] font-medium mb-2">
            Your shopping bag is empty
          </h2>
          <p className="text-xs text-[#2B1A16]/70 font-sans mb-6 leading-relaxed">
            Please add hardware or apparel to your bag before proceeding to patron checkout.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-widest px-8 py-3.5 rounded-[4px] transition-colors"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EFE8DD] min-h-screen py-10 md:py-16 border-b border-[#DDD2C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================================================================ */}
        {/* CASE 1: USER IS NOT LOGGED IN -> PATRON AUTHENTICATION GATE      */}
        {/* ================================================================ */}
        {!isLoggedIn || !user ? (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header Badge */}
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[#9A8029] font-bold bg-[#9A8029]/10 px-3.5 py-1 rounded-full mb-3">
                <Lock className="w-3 h-3" /> Patron Authentication Mandatory
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1A16] font-normal mb-3">
                Sign In to Complete Your Order
              </h1>
              <p className="text-xs sm:text-sm text-[#2B1A16]/75 font-sans leading-relaxed">
                Official 2-year warranty registration, transit insurance, and step-by-step courier dispatch tracking require a verified patron account before placing an order.
              </p>
            </div>

            {/* Split layout: Auth Card (Left) + Cart Summary (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Auth Column */}
              <div className="lg:col-span-7 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 sm:p-8 shadow-sm">
                {/* Auth Mode Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#EFE8DD] rounded-[4px] mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setAuthError('');
                    }}
                    className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-[3px] transition-all ${
                      authTab === 'login'
                        ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                        : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
                    }`}
                  >
                    Patron Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signup');
                      setAuthError('');
                    }}
                    className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-[3px] transition-all ${
                      authTab === 'signup'
                        ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-xs'
                        : 'text-[#2B1A16]/70 hover:text-[#2B1A16]'
                    }`}
                  >
                    New Patron Registration
                  </button>
                </div>

                {authError && (
                  <div className="mb-5 p-3 rounded-[3px] bg-[#B3402F]/10 border border-[#B3402F]/30 text-[#B3402F] text-xs font-sans flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                    {authError.includes('create an account') && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('signup');
                          setAuthError('');
                        }}
                        className="underline font-bold text-[#2B1A16] whitespace-nowrap hover:text-[#9A8029] text-xs shrink-0"
                      >
                        Register Now →
                      </button>
                    )}
                  </div>
                )}

                {/* SIGN IN TAB */}
                {authTab === 'login' && (
                  <form onSubmit={handleInlineLogin} className="space-y-4 font-sans">
                    {/* Method Toggle: Password vs Instant OTP */}
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-[#DDD2C0]">
                      <span className="text-[#2B1A16]/70 font-medium">Authentication Type:</span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="loginMethod"
                            checked={loginMethod === 'password'}
                            onChange={() => {
                              setLoginMethod('password');
                              setAuthError('');
                            }}
                            className="accent-[#9A8029]"
                          />
                          <span className="font-semibold text-[#2B1A16]">Password</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="loginMethod"
                            checked={loginMethod === 'otp'}
                            onChange={() => {
                              setLoginMethod('otp');
                              setAuthError('');
                            }}
                            className="accent-[#9A8029]"
                          />
                          <span className="font-semibold text-[#9A8029]">Instant OTP</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                        Mobile Number or Email Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={authIdentifier}
                        onChange={(e) => setAuthIdentifier(e.target.value)}
                        placeholder="e.g. 9876543210 or patron@email.com"
                        className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                      />
                    </div>

                    {loginMethod === 'password' ? (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-semibold text-[#2B1A16]/80">
                            Account Password *
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginMethod('otp');
                              handleSendOtp();
                            }}
                            className="text-[11px] text-[#9A8029] hover:underline"
                          >
                            Forgot? Use Instant OTP
                          </button>
                        </div>
                        <input
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Enter your patron password"
                          className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                              4-Digit Verification Code *
                            </label>
                            <input
                              type="text"
                              maxLength={4}
                              value={authOtp}
                              onChange={(e) => setAuthOtp(e.target.value)}
                              placeholder="Enter 4-digit code"
                              className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none tracking-widest font-mono text-center font-bold"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="bg-[#EFE8DD] hover:bg-[#DDD2C0] text-[#2B1A16] text-xs font-semibold px-4 py-2.5 rounded-[3px] border border-[#DDD2C0] transition-colors whitespace-nowrap"
                            >
                              {otpSent ? 'Resend Code' : 'Send Code'}
                            </button>
                          </div>
                        </div>

                        {otpSent && (
                          <div className="p-2.5 bg-[#9A8029]/10 rounded-[3px] text-[11px] text-[#9A8029] flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Verification code dispatched to <strong>{authIdentifier}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] py-3.5 px-4 rounded-[4px] text-xs font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-4"
                    >
                      <Lock className="w-4 h-4 text-[#9A8029]" />
                      <span>Sign In & Continue Checkout</span>
                    </button>

                    <div className="pt-3 text-center">
                      <Link
                        href={`/login?redirect=/checkout`}
                        className="text-[11px] text-[#2B1A16]/70 hover:text-[#9A8029] underline"
                      >
                        Prefer dedicated sign-in portal? Click here →
                      </Link>
                    </div>
                  </form>
                )}

                {/* SIGN UP TAB */}
                {authTab === 'signup' && (
                  <form onSubmit={handleInlineSignup} className="space-y-3 font-sans">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                        placeholder="e.g. Gaurav Sharma"
                        className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          placeholder="patron@domain.com"
                          className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                          10-Digit Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={signupForm.phone}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              phone: e.target.value.replace(/\D/g, ''),
                            })
                          }
                          placeholder="9876543210"
                          className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                        Create Account Password *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        placeholder="At least 6 characters"
                        className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none focus:border-[#9A8029]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#9A8029] hover:bg-[#7F6A1F] text-white py-3.5 px-4 rounded-[4px] text-xs font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-4"
                    >
                      <User className="w-4 h-4" />
                      <span>Create Patron Account & Unlock Checkout</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Right Order Teaser Column */}
              <div className="lg:col-span-5 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#DDD2C0]">
                  <h3 className="font-serif text-lg font-semibold text-[#2B1A16]">
                    Your Reserved Order
                  </h3>
                  <span className="text-xs bg-[#2B1A16] text-[#EFE8DD] px-2 py-0.5 rounded-full font-mono">
                    {items.reduce((acc, i) => acc + i.quantity, 0)} Items
                  </span>
                </div>

                {/* Items preview list */}
                <div className="divide-y divide-[#DDD2C0]/50 max-h-64 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-11 h-14 rounded-[2px] overflow-hidden bg-[#DDD2C0]/30 shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-serif font-medium text-xs text-[#2B1A16] line-clamp-1">
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] text-[#2B1A16]/65">
                            {item.selectedColor} • {item.selectedSize} × {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-xs text-[#2B1A16]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-1.5 text-xs font-sans text-[#2B1A16]/80 pt-3 border-t border-[#DDD2C0]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#4C7A34]">
                      <span>Coupon Discount ({appliedCoupon})</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-[#4C7A34] uppercase font-bold">FREE</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-[#2B1A16] pt-2 border-t border-[#DDD2C0]">
                    <span>Total Payable</span>
                    <span className="font-serif text-xl">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-[#2B1A16]/65 space-y-1.5 border-t border-[#DDD2C0]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4C7A34]" />
                    <span>Cart is preserved and immediately unlocked upon sign in</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4C7A34]" />
                    <span>Real-time dispatch tracking enabled for registered patrons</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================ */
          /* CASE 2: LOGGED IN PATRON -> 3-STEP SEAMLESS CHECKOUT FLOW        */
          /* ================================================================ */
          <>
            {/* Patron Welcome Top Bar */}
            <div className="max-w-4xl mx-auto mb-8 bg-[#FBF7F0] border border-[#DDD2C0] p-4 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2B1A16] text-[#EFE8DD] flex items-center justify-center font-serif text-base font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs sm:text-sm text-[#2B1A16]">{user.name}</strong>
                    <span className="text-[10px] bg-[#9A8029]/15 text-[#9A8029] font-bold px-2 py-0.5 rounded-[2px] uppercase">
                      Gold Patron
                    </span>
                  </div>
                  <span className="text-[11px] text-[#2B1A16]/70">
                    {user.email || user.phone} • Verified Patron Session
                  </span>
                </div>
              </div>

              <Link
                href="/account"
                className="text-xs text-[#9A8029] hover:underline font-semibold whitespace-nowrap self-start sm:self-auto"
              >
                Manage Profile & Addresses →
              </Link>
            </div>

            {/* Checkout Stepper Bar */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-[#DDD2C0] -z-0" />
                <div
                  className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] bg-[#9A8029] transition-all duration-500 -z-0"
                  style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
                />

                {/* Step 1 */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex flex-col items-center gap-1.5 relative z-10"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      currentStep >= 1
                        ? 'bg-[#2B1A16] text-[#EFE8DD] ring-4 ring-[#EFE8DD]'
                        : 'bg-[#DDD2C0] text-[#2B1A16]'
                    }`}
                  >
                    {currentStep > 1 ? <Check className="w-4 h-4 text-[#9A8029]" /> : '1'}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2B1A16]">
                    Address
                  </span>
                </button>

                {/* Step 2 */}
                <button
                  type="button"
                  onClick={() => currentStep > 1 && setCurrentStep(2)}
                  className="flex flex-col items-center gap-1.5 relative z-10"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      currentStep >= 2
                        ? 'bg-[#2B1A16] text-[#EFE8DD] ring-4 ring-[#EFE8DD]'
                        : 'bg-[#DDD2C0] text-[#2B1A16]'
                    }`}
                  >
                    {currentStep > 2 ? <Check className="w-4 h-4 text-[#9A8029]" /> : '2'}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2B1A16]">
                    Payment
                  </span>
                </button>

                {/* Step 3 */}
                <button
                  type="button"
                  onClick={() => currentStep === 3 && setCurrentStep(3)}
                  className="flex flex-col items-center gap-1.5 relative z-10"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      currentStep === 3
                        ? 'bg-[#2B1A16] text-[#EFE8DD] ring-4 ring-[#EFE8DD]'
                        : 'bg-[#DDD2C0] text-[#2B1A16]'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2B1A16]">
                    Review
                  </span>
                </button>
              </div>
            </div>

            {/* 2-Column Checkout Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Stepper Form Column */}
              <div className="lg:col-span-8 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 sm:p-8 shadow-sm">
                {/* STEP 1: ADDRESS */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#DDD2C0]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#9A8029]" />
                        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16]">
                          Delivery Destination
                        </h2>
                      </div>
                      {!isAddingNewAddress && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewAddress(true);
                            setAddressError('');
                          }}
                          className="text-xs font-semibold uppercase tracking-wider text-[#9A8029] hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add New Address
                        </button>
                      )}
                    </div>

                    {addressError && (
                      <p className="text-xs text-[#B3402F] bg-[#B3402F]/10 p-2.5 rounded-[3px] font-sans">
                        {addressError}
                      </p>
                    )}

                    {/* Saved Addresses List */}
                    {!isAddingNewAddress && savedAddresses.length > 0 && (
                      <div className="space-y-3">
                        {savedAddresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`block p-4 border rounded-[4px] cursor-pointer transition-all ${
                              selectedAddressId === addr.id
                                ? 'border-[#9A8029] bg-[#EFE8DD]/60 ring-1 ring-[#9A8029]'
                                : 'border-[#DDD2C0] bg-white hover:border-[#9A8029]/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="selectedAddress"
                                  checked={selectedAddressId === addr.id}
                                  onChange={() => setSelectedAddressId(addr.id)}
                                  className="accent-[#9A8029]"
                                />
                                <strong className="text-xs font-bold text-[#2B1A16] font-sans">
                                  {addr.name}
                                </strong>
                                <span className="text-[10px] bg-[#2B1A16]/10 text-[#2B1A16] px-1.5 py-0.5 rounded-[2px] uppercase font-bold">
                                  {addr.type}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] text-[#9A8029] font-bold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-[#2B1A16]/70 font-sans">
                                +91 {addr.phone}
                              </span>
                            </div>
                            <p className="text-xs text-[#2B1A16]/80 mt-2 pl-5 font-sans leading-relaxed">
                              {addr.street}, {addr.locality && `${addr.locality}, `}
                              {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                            </p>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Add New Address Form */}
                    {isAddingNewAddress && (
                      <form onSubmit={handleSaveNewAddress} className="space-y-4 pt-2 font-sans">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                              Recipient Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={addressForm.name}
                              onChange={(e) =>
                                setAddressForm({ ...addressForm, name: e.target.value })
                              }
                              className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                              10-Digit Mobile Number (For Delivery SMS) *
                            </label>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              value={addressForm.phone}
                              onChange={(e) =>
                                setAddressForm({
                                  ...addressForm,
                                  phone: e.target.value.replace(/\D/g, ''),
                                })
                              }
                              className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                            Street Address / House / Flat / Suite *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.street}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, street: e.target.value })
                            }
                            placeholder="Flat/House No., Building Name, Street"
                            className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                              Locality / Sector
                            </label>
                            <input
                              type="text"
                              value={addressForm.locality}
                              onChange={(e) =>
                                setAddressForm({ ...addressForm, locality: e.target.value })
                              }
                              placeholder="Landmark or Area"
                              className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              required
                              value={addressForm.city}
                              onChange={(e) =>
                                setAddressForm({ ...addressForm, city: e.target.value })
                              }
                              className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#2B1A16]/80 mb-1">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={addressForm.pincode}
                              onChange={(e) =>
                                setAddressForm({
                                  ...addressForm,
                                  pincode: e.target.value.replace(/\D/g, ''),
                                })
                              }
                              placeholder="6-digit PIN"
                              className="w-full bg-white border border-[#DDD2C0] rounded-[3px] p-2.5 text-xs text-[#2B1A16] outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                          <span className="text-xs font-semibold text-[#2B1A16]/80">Address Type:</span>
                          {(['Home', 'Work', 'Other'] as const).map((t) => (
                            <label key={t} className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input
                                type="radio"
                                name="addressType"
                                checked={addressForm.type === t}
                                onChange={() => setAddressForm({ ...addressForm, type: t })}
                                className="accent-[#9A8029]"
                              />
                              <span className="text-[#2B1A16]">{t}</span>
                            </label>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase px-5 py-2.5 rounded-[3px] transition-colors cursor-pointer"
                          >
                            Save Destination
                          </button>
                          {savedAddresses.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setIsAddingNewAddress(false)}
                              className="border border-[#DDD2C0] text-[#2B1A16] text-xs font-semibold uppercase px-4 py-2.5 rounded-[3px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    )}

                    {/* Continue to Payment button */}
                    {!isAddingNewAddress && (
                      <div className="pt-4 border-t border-[#DDD2C0] flex justify-end">
                        <button
                          type="button"
                          onClick={handleStep1Continue}
                          className="bg-[#9A8029] hover:bg-[#7F6A1F] text-white text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 rounded-[4px] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <span>Proceed to Payment</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: PAYMENT */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#DDD2C0]">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#9A8029]" />
                        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16]">
                          Select Payment Mode
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-[#9A8029] hover:underline"
                      >
                        Change Destination
                      </button>
                    </div>

                    {/* Payment Option Tabs */}
                    <div className="space-y-4 font-sans">
                      {/* Option 1: Razorpay Online Payment */}
                      <label
                        className={`block p-5 border rounded-[4px] cursor-pointer transition-all ${
                          paymentMethod !== 'Cash on Delivery'
                            ? 'border-[#9A8029] bg-[#FBF7F0] ring-1 ring-[#9A8029] shadow-xs'
                            : 'border-[#DDD2C0] bg-white hover:border-[#9A8029]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod !== 'Cash on Delivery'}
                              onChange={() => setPaymentMethod('Online Payment (Razorpay)')}
                              className="accent-[#9A8029] mt-0.5"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs sm:text-sm text-[#2B1A16]">
                                  Razorpay Secure Online Checkout
                                </span>
                                <span className="text-[10px] bg-[#4C7A34]/15 text-[#4C7A34] px-2 py-0.5 rounded-[2px] font-bold">
                                  FAST &amp; RECOMMENDED
                                </span>
                              </div>
                              <p className="text-xs text-[#2B1A16]/75 mt-1 leading-relaxed">
                                Instant UPI (Google Pay, PhonePe, Paytm, QR) • Debit &amp; Credit Cards (Visa, Mastercard, RuPay, Amex) • Net Banking (50+ Banks) • EMI &amp; Wallets
                              </p>

                              {/* Method Badges */}
                              <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] font-medium text-[#2B1A16]/80">
                                <span className="bg-[#EFE8DD] px-2.5 py-1 rounded-[3px] border border-[#DDD2C0]">
                                  ⚡ Instant UPI / QR
                                </span>
                                <span className="bg-[#EFE8DD] px-2.5 py-1 rounded-[3px] border border-[#DDD2C0]">
                                  💳 Visa / Mastercard / RuPay
                                </span>
                                <span className="bg-[#EFE8DD] px-2.5 py-1 rounded-[3px] border border-[#DDD2C0]">
                                  🏦 All Indian Banks
                                </span>
                              </div>

                              <div className="mt-3.5 pt-3 border-t border-[#DDD2C0]/50 flex items-center gap-2 text-[11px] text-[#4C7A34] font-medium">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>256-Bit SSL Encrypted • RBI Authorized • PCI-DSS Certified Gateway</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>

                      {/* Option 2: Cash on Delivery */}
                      <label
                        className={`block p-5 border rounded-[4px] cursor-pointer transition-all ${
                          paymentMethod === 'Cash on Delivery'
                            ? 'border-[#9A8029] bg-[#FBF7F0] ring-1 ring-[#9A8029] shadow-xs'
                            : 'border-[#DDD2C0] bg-white hover:border-[#9A8029]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === 'Cash on Delivery'}
                              onChange={() => setPaymentMethod('Cash on Delivery')}
                              className="accent-[#9A8029] mt-0.5"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm text-[#2B1A16]">
                                  Cash on Delivery (Doorstep Verification)
                                </span>
                              </div>
                              <p className="text-xs text-[#2B1A16]/75 mt-1 leading-relaxed">
                                Pay via Cash or UPI at your doorstep upon courier handover. Includes complimentary 18-point hardware unboxing and serial verification.
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="pt-4 border-t border-[#DDD2C0] flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-[#2B1A16]/70 hover:text-[#2B1A16] uppercase font-semibold cursor-pointer"
                      >
                        ← Back to Destination
                      </button>
                      <button
                        type="button"
                        onClick={handleStep2Continue}
                        className="bg-[#9A8029] hover:bg-[#7F6A1F] text-white text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 rounded-[4px] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span>Review Order</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: REVIEW & CONFIRM */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="pb-4 border-b border-[#DDD2C0]">
                      <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1A16]">
                        Review Your Order
                      </h2>
                      <p className="text-xs text-[#2B1A16]/70 mt-1 font-sans">
                        Please double-check your delivery coordinates and selected garments before placing order.
                      </p>
                    </div>

                    {/* Delivery Destination Snapshot */}
                    <div className="bg-[#EFE8DD]/60 border border-[#DDD2C0] p-4 rounded-[4px] flex justify-between items-start text-xs font-sans">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#9A8029] block mb-1">
                          DELIVERING TO
                        </span>
                        <strong className="text-sm font-serif text-[#2B1A16] block">
                          {selectedAddress.name} (+91 {selectedAddress.phone})
                        </strong>
                        <p className="text-[#2B1A16]/80 mt-1">
                          {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} -{' '}
                          {selectedAddress.pincode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-[#9A8029] font-bold hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Payment Snapshot */}
                    <div className="bg-[#EFE8DD]/60 border border-[#DDD2C0] p-4 rounded-[4px] flex justify-between items-center text-xs font-sans">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#9A8029] block mb-0.5">
                          PAYMENT METHOD
                        </span>
                        <strong className="text-sm font-serif text-[#2B1A16]">
                          {paymentMethod}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-[#9A8029] font-bold hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    {/* Garments Preview */}
                    <div className="space-y-3">
                      <span className="text-xs uppercase font-semibold text-[#2B1A16]/70 block font-sans">
                        Order Items ({items.length})
                      </span>
                      <div className="divide-y divide-[#DDD2C0]/40">
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            className="py-3 flex items-center justify-between text-xs font-sans"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-16 rounded-[2px] overflow-hidden bg-[#DDD2C0]/30 shrink-0">
                                <Image
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-serif font-medium text-sm text-[#2B1A16]">
                                  {item.product.name}
                                </h4>
                                <span className="text-[#2B1A16]/70">
                                  {item.selectedColor} • Edition: {item.selectedSize} • Qty:{' '}
                                  {item.quantity}
                                </span>
                              </div>
                            </div>
                            <span className="font-bold text-sm text-[#2B1A16]">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Final Place Order Button */}
                    <div className="pt-4 border-t border-[#DDD2C0] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs text-[#2B1A16]/70 hover:text-[#2B1A16] uppercase font-semibold cursor-pointer"
                      >
                        ← Back to Payment
                      </button>
                      <button
                        type="button"
                        disabled={isPlacingOrder}
                        onClick={handleFinalPlaceOrder}
                        className="bg-[#2B1A16] hover:bg-[#9A8029] text-[#EFE8DD] text-xs font-semibold uppercase tracking-[0.2em] px-10 py-4 rounded-[4px] transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-[#9A8029]" />
                        <span>
                          {isPlacingOrder
                            ? 'Inscribing Order...'
                            : `Place Order (₹${total.toLocaleString('en-IN')})`}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Summary Column */}
              <div className="lg:col-span-4 bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-6 space-y-4 sticky top-24 shadow-sm">
                <h3 className="font-serif text-lg font-semibold text-[#2B1A16] pb-3 border-b border-[#DDD2C0]">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs font-sans text-[#2B1A16]/80">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#4C7A34]">
                      <span>Coupon Discount ({appliedCoupon})</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-[#4C7A34] uppercase font-semibold">FREE</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-[#2B1A16] pt-3 border-t border-[#DDD2C0]">
                    <span>Total Payable</span>
                    <span className="font-serif text-xl">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#2B1A16]/70 space-y-1.5 border-t border-[#DDD2C0]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4C7A34]" />
                    <span>15-Day Doorstep Complimentary Returns</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4C7A34]" />
                    <span>256-Bit Encrypted Indian Banking Gateway</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#9A8029]" />
                    <span>Express Air Dispatch via BlueDart Logistics</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
