'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useInquiryStore } from '@/store/inquiryStore';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Product, Order, OrderStatus } from '@/types';

import AdminAuthGate from '@/components/admin/AdminAuthGate';
import AdminProductsTab from '@/components/admin/AdminProductsTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminAnalyticsTab from '@/components/admin/AdminAnalyticsTab';
import AdminStorefrontTab from '@/components/admin/AdminStorefrontTab';
import AdminInquiriesTab from '@/components/admin/AdminInquiriesTab';
import AdminReviewsTab from '@/components/admin/AdminReviewsTab';
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

  // Active Tab
  type AdminTab = 'products' | 'orders' | 'inquiries' | 'reviews' | 'sections' | 'analytics';
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Stores
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStock,
    duplicateProduct,
    resetToDefaults,
  } = useProductStore();

  const {
    orders,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    createAdminOrder,
    resetOrdersToDefault,
  } = useAuthStore();

  const inquiries = useInquiryStore((state) => state.inquiries);
  const unreadInquiriesCount = inquiries.filter((i) => i.status === 'new').length;
  const totalReviewsCount = products.reduce((acc, p) => acc + (p.reviews?.length || 0), 0);

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

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (productToEdit) {
      updateProduct(productToEdit.id, productData);
      addToast(`Updated specifications for "${productData.name}"`, 'success');
    } else {
      const created = addProduct(productData as Omit<Product, 'id' | 'reviews'>);
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

  const handleDuplicateProduct = (id: string) => {
    const duplicated = duplicateProduct(id);
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

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#2B1A16] font-sans pb-24 selection:bg-[#9A8029] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" title="Open Storefront in New Tab">
              <Logo size="sm" asLink={false} />
            </Link>
            <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l border-[#E5E0D8]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] bg-[#9A8029]/10 px-2.5 py-0.5 rounded font-bold">
                SUPERADMIN COMMAND
              </span>
              <span className="text-[#DDD2C0] text-xs">•</span>
              <span className="text-xs text-[#2B1A16]/60">Private Administration Engine</span>
            </div>
          </div>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="bg-[#FAF8F5] hover:bg-[#EFE8DD] text-[#2B1A16] text-xs px-3.5 py-2 rounded-xl border border-[#DDD2C0] transition-colors flex items-center gap-1.5 font-semibold"
            >
              <span className="hidden sm:inline">View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#9A8029]" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#2B1A16]/60 hover:text-rose-600 hover:bg-rose-50 border border-[#DDD2C0] transition-colors"
              title="Lock Superadmin Session"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-3">
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E0D8] p-1.5 rounded-2xl shadow-xs overflow-x-auto scrollbar-none max-w-full">
            {/* Products */}
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'products'
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-sm'
                  : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products</span>
              <span className="bg-[#9A8029]/20 text-[#9A8029] text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                {products.length}
              </span>
            </button>

            {/* Orders */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-sm'
                  : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders</span>
              <span className="bg-[#9A8029]/20 text-[#9A8029] text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                {orders.length}
              </span>
            </button>

            {/* Received Emails & Support Tickets */}
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'inquiries'
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-sm'
                  : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#9A8029]" />
              <span>Received Emails</span>
              {unreadInquiriesCount > 0 ? (
                <span className="bg-rose-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {unreadInquiriesCount} new
                </span>
              ) : (
                <span className="bg-[#9A8029]/15 text-[#9A8029] text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  {inquiries.length}
                </span>
              )}
            </button>

            {/* Reviews Moderation */}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'reviews'
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-sm'
                  : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Reviews</span>
              <span className="bg-[#9A8029]/20 text-[#9A8029] text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                {totalReviewsCount}
              </span>
            </button>

            {/* Storefront CMS */}
            <button
              onClick={() => setActiveTab('sections')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'sections'
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-sm'
                  : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#9A8029]" />
              <span>Storefront CMS</span>
            </button>

            {/* Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'analytics'
                  ? 'bg-[#2B1A16] text-[#EFE8DD] shadow-sm'
                  : 'text-[#2B1A16]/60 hover:text-[#2B1A16]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analytics & Sync</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#2B1A16]/60 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-medium">Live Storefront Synchronized</span>
          </div>
        </div>

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

        {/* Tab 3: Received Emails & Support Tickets Inbox */}
        {activeTab === 'inquiries' && (
          <AdminInquiriesTab />
        )}

        {/* Tab 4: Product Reviews Moderation */}
        {activeTab === 'reviews' && (
          <AdminReviewsTab />
        )}

        {/* Tab 5: Storefront CMS & Sections Customizer */}
        {activeTab === 'sections' && (
          <AdminStorefrontTab />
        )}

        {/* Tab 6: Analytics & Sync */}
        {activeTab === 'analytics' && (
          <AdminAnalyticsTab products={products} orders={orders} />
        )}
      </main>

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
