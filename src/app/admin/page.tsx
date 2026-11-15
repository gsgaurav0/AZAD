'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  ExternalLink,
  Lock,
  Layers,
  Mail,
  Star,
  Tag,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useInquiryStore } from '@/store/inquiryStore';
import { useCouponStore } from '@/store/couponStore';
import { useCMSStore } from '@/store/cmsStore';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Product, Order, OrderStatus } from '@/types';

import AdminAuthGate from '@/components/admin/AdminAuthGate';
import AdminProductsTab from '@/components/admin/AdminProductsTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminAnalyticsTab from '@/components/admin/AdminAnalyticsTab';
import AdminStorefrontTab from '@/components/admin/AdminStorefrontTab';
import AdminInquiriesTab from '@/components/admin/AdminInquiriesTab';
import AdminReviewsTab from '@/components/admin/AdminReviewsTab';
import AdminCouponsTab from '@/components/admin/AdminCouponsTab';
import AdminProductModal from '@/components/admin/AdminProductModal';
import AdminOrderDetailModal from '@/components/admin/AdminOrderDetailModal';
import AdminCreateOrderModal from '@/components/admin/AdminCreateOrderModal';

export default function AdminPage() {
  const isMounted = useIsMounted();
  const addToast = useUIStore((state) => state.addToast);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mewak_superadmin_auth') === 'true';
    }
    return false;
  });

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mewak_superadmin_auth', 'true');
    }
    addToast('Authenticated to Superadmin Command Center', 'success');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mewak_superadmin_auth');
    }
    addToast('Superadmin session locked', 'info');
  };

  // Active Tab & Mobile Drawer
  type AdminTab = 'products' | 'orders' | 'users' | 'coupons' | 'inquiries' | 'reviews' | 'sections' | 'analytics';
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Stores
  const {
    products,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStock,
    duplicateProduct,
    resetToDefaults,
  } = useProductStore();

  const {
    orders,
    registeredUsers,
    fetchAdminOrders,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    createAdminOrder,
    resetOrdersToDefault,
  } = useAuthStore();

  const inquiries = useInquiryStore((state) => state.inquiries);
  const fetchInquiries = useInquiryStore((state) => state.fetchInquiries);
  const unreadInquiriesCount = inquiries.filter((i) => i.status === 'new').length;
  const totalReviewsCount = products.reduce((acc, p) => acc + (p.reviews?.length || 0), 0);
  const coupons = useCouponStore((state) => state.coupons);
  const fetchCoupons = useCouponStore((state) => state.fetchCoupons);
  const activeCouponsCount = coupons.filter((c) => c.isActive).length;
  const fetchCMS = useCMSStore((state) => state.fetchCMS);

  // Sync all store collections with Supabase database on mount & auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchAdminOrders();
      fetchCoupons();
      fetchInquiries();
      fetchCMS();
    }
  }, [isAuthenticated, fetchProducts, fetchAdminOrders, fetchCoupons, fetchInquiries, fetchCMS]);

  // Key Financial & Logistics Metrics for KPI Bar
  const validOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'Placed' || o.status === 'Packed').length;
  const inStockProductsCount = products.filter((p) => p.sizes.some((s) => s.inStock)).length;

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [orderToInspect, setOrderToInspect] = useState<Order | null>(null);

  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);

  // Loading state while mounting
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#9A8029] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auth Gate
  if (!isAuthenticated) {
    return <AdminAuthGate onAuthenticated={handleAuthenticated} />;
  }

  // Handlers for Products
  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (productToEdit) {
      await updateProduct(productToEdit.id, productData);
      addToast(`Updated specifications for "${productData.name}"`, 'success');
    } else {
      const created = await addProduct(productData as Omit<Product, 'id' | 'reviews'>);
      addToast(`Added new product "${created.name}" to catalog`, 'success');
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    const item = products.find((p) => p.id === id);
    deleteProduct(id);
    addToast(`Removed "${item?.name || 'Product'}" from catalog`, 'info');
  };

  const handleToggleStock = (id: string) => {
    toggleStock(id);
    addToast('Updated inventory status', 'success');
  };

  const handleDuplicateProduct = async (id: string) => {
    const duplicated = await duplicateProduct(id);
    if (duplicated) {
      addToast(`Duplicated into "${duplicated.name}"`, 'success');
    }
  };

  const handleResetCatalog = () => {
    if (window.confirm('Reset catalog back to initial 24 high-end electronics items?')) {
      resetToDefaults();
      addToast('Restored catalog to 24 default flagship products', 'info');
    }
  };

  // Handlers for Orders
  const handleOpenOrderDetail = (order: Order) => {
    setOrderToInspect(order);
    setIsOrderDetailModalOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    updateOrderStatus(orderId, status, note);
    addToast(`Order #${orderId} marked as ${status}`, 'success');

    // Keep active inspected order in sync
    if (orderToInspect && orderToInspect.id === orderId) {
      const updated = orders.find((o) => o.id === orderId);
      if (updated) {
        setOrderToInspect({ ...updated, status });
      }
    }
  };

  const handleUpdateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    updateOrder(orderId, updates);
    addToast(`Updated order #${orderId}`, 'success');
    if (orderToInspect && orderToInspect.id === orderId) {
      setOrderToInspect((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    addToast(`Deleted order #${orderId}`, 'info');
    if (orderToInspect && orderToInspect.id === orderId) {
      setIsOrderDetailModalOpen(false);
    }
  };

  const handleCreateOrder = (newOrder: Order) => {
    createAdminOrder(newOrder);
    addToast(`Created new order #${newOrder.id} for ${newOrder.address?.name}`, 'success');
    setIsCreateOrderModalOpen(false);
  };

  // Navigation Items Definition
  const NAV_ITEMS = [
    {
      id: 'products' as const,
      label: 'Products',
      shortLabel: 'Catalog',
      icon: Package,
      description: 'Hardware items, stock & specifications',
      badge: `${products.length}`,
      badgeColor: 'bg-[#9A8029]/15 text-[#9A8029]',
    },
    {
      id: 'orders' as const,
      label: 'Orders',
      shortLabel: 'Orders',
      icon: ShoppingBag,
      description: 'Customer fulfillment & dispatch status',
      badge: `${orders.length}`,
      badgeColor: pendingOrdersCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-[#9A8029]/15 text-[#9A8029]',
    },
    {
      id: 'users' as const,
      label: 'Patrons & Users',
      shortLabel: 'Users',
      icon: Users,
      description: 'Registered customer profiles & account records',
      badge: `${registeredUsers.length}`,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'coupons' as const,
      label: 'Discounts',
      shortLabel: 'Coupons',
      icon: Tag,
      description: 'Promo codes & cart vouchers',
      badge: `${activeCouponsCount} Active`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'inquiries' as const,
      label: 'Inbox & Tickets',
      shortLabel: 'Inbox',
      icon: Mail,
      description: 'Patron inquiries & technical support',
      badge: unreadInquiriesCount > 0 ? `${unreadInquiriesCount} new` : `${inquiries.length}`,
      badgeColor: unreadInquiriesCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#9A8029]/15 text-[#9A8029]',
    },
    {
      id: 'reviews' as const,
      label: 'Reviews',
      shortLabel: 'Reviews',
      icon: Star,
      description: 'Hardware ratings & verified feedback',
      badge: `${totalReviewsCount}`,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'sections' as const,
      label: 'Storefront CMS',
      shortLabel: 'CMS',
      icon: Layers,
      description: 'Homepage sections, alerts & social links',
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'analytics' as const,
      label: 'Analytics & Sync',
      shortLabel: 'Analytics',
      icon: TrendingUp,
      description: 'Revenue, performance metrics & backup',
      badge: 'Insights',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
  ];

  const currentNav = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#2B1A16] font-sans pb-28 lg:pb-16 selection:bg-[#9A8029] selection:text-white">
      {/* ================= STICKY TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] px-3 sm:px-6 lg:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" title="Open Storefront in New Tab" className="shrink-0">
              <Logo size="sm" asLink={false} />
            </Link>

            {/* Desktop Brand Details */}
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#E5E0D8]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] bg-[#9A8029]/10 px-2.5 py-0.5 rounded font-bold">
                COMMAND PORTAL
              </span>
              <span className="text-[#DDD2C0] text-xs">•</span>
              <span className="text-xs text-[#2B1A16]/60 truncate max-w-[200px] lg:max-w-none">
                Private Administration Engine
              </span>
            </div>

            {/* Mobile Active Module Pill Indicator */}
            <div className="md:hidden flex items-center gap-1.5 bg-[#FAF8F5] border border-[#DDD2C0] px-2.5 py-1 rounded-xl">
              <currentNav.icon className="w-3.5 h-3.5 text-[#9A8029]" />
              <span className="font-serif text-xs font-bold text-[#2B1A16] truncate max-w-[120px]">
                {currentNav.label}
              </span>
            </div>
          </div>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="bg-[#FAF8F5] hover:bg-[#EFE8DD] text-[#2B1A16] text-xs px-2.5 sm:px-3.5 py-2 rounded-xl border border-[#DDD2C0] transition-colors flex items-center gap-1.5 font-semibold"
              title="Preview Live Storefront"
            >
              <span className="hidden sm:inline">Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#9A8029]" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#2B1A16]/60 hover:text-rose-600 hover:bg-rose-50 border border-[#DDD2C0] transition-colors"
              title="Lock Session"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 rounded-xl border border-[#DDD2C0] bg-white text-[#2B1A16] hover:bg-[#FAF8F5] lg:hidden relative"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-4 h-4" />
              {unreadInquiriesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE SLIDE-OVER DRAWER ================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-[#2B1A16]/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E5E0D8] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Logo size="sm" asLink={false} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] bg-[#9A8029]/10 px-2 py-0.5 rounded font-bold">
                  ADMIN
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-xl text-[#2B1A16]/60 hover:text-[#2B1A16] hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Metrics Mini-Bar */}
            <div className="p-4 border-b border-[#E5E0D8] bg-[#FAF8F5]/50 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E0D8]">
                <span className="text-[10px] uppercase font-mono text-[#2B1A16]/60 block">Live Items</span>
                <span className="font-serif text-lg font-bold text-[#2B1A16]">{products.length}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E0D8]">
                <span className="text-[10px] uppercase font-mono text-[#2B1A16]/60 block">Orders</span>
                <span className="font-serif text-lg font-bold text-[#2B1A16]">{orders.length}</span>
              </div>
            </div>

            {/* Drawer Navigation List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={`drawer-${item.id}`}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-sm'
                        : 'hover:bg-[#FAF8F5] text-[#2B1A16]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-[#9A8029] text-white'
                            : 'bg-[#FAF8F5] text-[#9A8029] border border-[#DDD2C0]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-serif text-sm font-bold block truncate">
                          {item.label}
                        </span>
                        <span className={`text-[10px] block truncate ${isActive ? 'text-[#EFE8DD]/70' : 'text-[#2B1A16]/50'}`}>
                          {item.description}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E5E0D8] bg-[#FAF8F5] space-y-2">
              <Link
                href="/"
                target="_blank"
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#DDD2C0] text-[#2B1A16] font-semibold text-xs flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#9A8029]" />
                <span>Visit Customer Storefront</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Superadmin Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTAINER ================= */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-8 space-y-6 sm:space-y-8">
        {/* ================= EXECUTIVE KPI DASHBOARD SUMMARY BANNER ================= */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E0D8]/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#2B1A16]/60">
                  Real-time Operational Center
                </span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1A16] mt-0.5">
                Executive Overview & Storefront Status
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All Services Healthy
              </span>
            </div>
          </div>

          {/* 4 Responsive Summary Cards (2x2 on mobile, 4 in 1 row on desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
            {/* KPI 1: Active Products */}
            <div
              onClick={() => setActiveTab('products')}
              className="bg-[#FAF8F5] p-3 sm:p-4 rounded-xl border border-[#E5E0D8] hover:border-[#9A8029] cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold font-mono">
                  Catalog Size
                </span>
                <Package className="w-3.5 h-3.5 text-[#9A8029]" />
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#2B1A16]">
                {products.length}{' '}
                <span className="text-xs font-normal text-[#2B1A16]/50">models</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-semibold">
                {inStockProductsCount} Available In Stock
              </div>
            </div>

            {/* KPI 2: Total Orders */}
            <div
              onClick={() => setActiveTab('orders')}
              className="bg-[#FAF8F5] p-3 sm:p-4 rounded-xl border border-[#E5E0D8] hover:border-[#9A8029] cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold font-mono">
                  Orders Booked
                </span>
                <ShoppingBag className="w-3.5 h-3.5 text-[#9A8029]" />
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#2B1A16]">
                {orders.length}{' '}
                <span className="text-xs font-normal text-[#2B1A16]/50">orders</span>
              </div>
              <div className="text-[10px] text-amber-700 font-mono mt-0.5 font-semibold">
                {pendingOrdersCount} Awaiting Fulfillment
              </div>
            </div>

            {/* KPI 3: Total Recorded Revenue */}
            <div
              onClick={() => setActiveTab('analytics')}
              className="bg-[#FAF8F5] p-3 sm:p-4 rounded-xl border border-[#E5E0D8] hover:border-[#9A8029] cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold font-mono">
                  Gross Revenue
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-[#9A8029]" />
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#2B1A16]">
                ₹{totalRevenue >= 100000 ? `${(totalRevenue / 100000).toFixed(2)}L` : totalRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-purple-700 font-mono mt-0.5 font-semibold">
                {validOrders.length} Paid Transactions
              </div>
            </div>

            {/* KPI 4: Support & Inquiries */}
            <div
              onClick={() => setActiveTab('inquiries')}
              className="bg-[#FAF8F5] p-3 sm:p-4 rounded-xl border border-[#E5E0D8] hover:border-[#9A8029] cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold font-mono">
                  Customer Desk
                </span>
                <Mail className="w-3.5 h-3.5 text-[#9A8029]" />
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#2B1A16]">
                {inquiries.length}{' '}
                <span className="text-xs font-normal text-[#2B1A16]/50">tickets</span>
              </div>
              <div className={`text-[10px] font-mono mt-0.5 font-semibold ${
                unreadInquiriesCount > 0 ? 'text-rose-600 font-bold' : 'text-[#2B1A16]/60'
              }`}>
                {unreadInquiriesCount > 0 ? `${unreadInquiriesCount} Unread Emails` : 'All Resolved'}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RESPONSIVE HORIZONTAL NAVIGATION TABS ================= */}
        <div className="border-b border-[#E5E0D8] pb-3">
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E0D8] p-1.5 rounded-2xl shadow-xs overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-sm'
                      : 'text-[#2B1A16]/65 hover:text-[#2B1A16] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#9A8029]" />
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= ACTIVE TAB VIEWPORT ================= */}
        <div className="transition-opacity duration-300">
          {/* Tab 1: Products Management */}
          {activeTab === 'products' && (
            <AdminProductsTab
              products={products}
              onOpenAddModal={handleOpenAddProduct}
              onOpenEditModal={handleOpenEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleStock={handleToggleStock}
              onDuplicateProduct={handleDuplicateProduct}
              onResetDefaults={handleResetCatalog}
            />
          )}

          {/* Tab 2: Orders Management */}
          {activeTab === 'orders' && (
            <AdminOrdersTab
              orders={orders}
              onOpenCreateOrderModal={() => setIsCreateOrderModalOpen(true)}
              onOpenOrderDetailModal={handleOpenOrderDetail}
              onUpdateStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onResetOrders={resetOrdersToDefault}
            />
          )}

          {/* Tab: Registered Patrons & Users */}
          {activeTab === 'users' && <AdminUsersTab />}

          {/* Tab 3: Discounts & Promo Codes Management */}
          {activeTab === 'coupons' && <AdminCouponsTab />}

          {/* Tab 4: Received Emails & Support Tickets Inbox */}
          {activeTab === 'inquiries' && <AdminInquiriesTab />}

          {/* Tab 5: Product Reviews Moderation */}
          {activeTab === 'reviews' && <AdminReviewsTab />}

          {/* Tab 6: Storefront CMS & Sections Customizer */}
          {activeTab === 'sections' && <AdminStorefrontTab />}

          {/* Tab 7: Analytics & Sync */}
          {activeTab === 'analytics' && <AdminAnalyticsTab products={products} orders={orders} />}
        </div>
      </main>

      {/* ================= MOBILE BOTTOM FLOATING NAVIGATION DOCK (PHONE ONLY) ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] px-2 py-2 shadow-xl flex items-center justify-around lg:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'products' ? 'text-[#9A8029] font-bold' : 'text-[#2B1A16]/60'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Products</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'orders' ? 'text-[#9A8029] font-bold' : 'text-[#2B1A16]/60'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Orders</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'users' ? 'text-[#9A8029] font-bold' : 'text-[#2B1A16]/60'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Users</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coupons')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'coupons' ? 'text-[#9A8029] font-bold' : 'text-[#2B1A16]/60'
          }`}
        >
          <Tag className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Discounts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inquiries')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all relative ${
            activeTab === 'inquiries' ? 'text-[#9A8029] font-bold' : 'text-[#2B1A16]/60'
          }`}
        >
          <Mail className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Inbox</span>
          {unreadInquiriesCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all text-[#2B1A16]/60 hover:text-[#2B1A16]`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Modules</span>
        </button>
      </nav>

      {/* ================= MODALS ================= */}
      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <AdminProductModal
          key={productToEdit ? productToEdit.id : 'new-product'}
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleSaveProduct}
          productToEdit={productToEdit}
        />
      )}

      {/* Order Details Modal */}
      {isOrderDetailModalOpen && (
        <AdminOrderDetailModal
          key={orderToInspect ? orderToInspect.id : 'none'}
          order={orderToInspect}
          isOpen={isOrderDetailModalOpen}
          onClose={() => setIsOrderDetailModalOpen(false)}
          onUpdateStatus={handleUpdateOrderStatus}
          onUpdateOrder={handleUpdateOrderDetails}
        />
      )}

      {/* Manual Order Creation Modal */}
      {isCreateOrderModalOpen && (
        <AdminCreateOrderModal
          isOpen={isCreateOrderModalOpen}
          onClose={() => setIsCreateOrderModalOpen(false)}
          products={products}
          onCreateOrder={handleCreateOrder}
        />
      )}
    </div>
  );
}
