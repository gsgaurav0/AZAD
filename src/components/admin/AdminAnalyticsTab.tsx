'use client';

import React, { useRef } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Percent,
} from 'lucide-react';
import { Product, Order } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';

interface AdminAnalyticsTabProps {
  products: Product[];
  orders: Order[];
}

export default function AdminAnalyticsTab({ products, orders }: AdminAnalyticsTabProps) {
  const addToast = useUIStore((state) => state.addToast);
  const resetCatalog = useProductStore((state) => state.resetToDefaults);
  const resetOrders = useAuthStore((state) => state.resetOrdersToDefault);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Financial Analytics
  const validOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const aov = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const inTransitCount = orders.filter(
    (o) => o.status === 'Shipped' || o.status === 'Out for Delivery' || o.status === 'Packed'
  ).length;
  const placedCount = orders.filter((o) => o.status === 'Placed').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  const deliverySuccessRate =
    orders.length > 0 ? Math.round(((deliveredCount + inTransitCount) / orders.length) * 100) : 100;

  // Category Metrics
  const categoryStats = [
    {
      name: 'Headphones & Audio',
      category: 'headphones',
      productsCount: products.filter((p) => p.category === 'headphones').length,
      revenueEstimate: validOrders.reduce((acc, o) => {
        const itemRev = o.items
          .filter((i) => i.product?.category === 'headphones')
          .reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
        return acc + itemRev;
      }, 0),
      color: 'bg-amber-600',
    },
    {
      name: 'Flagship Smartphones',
      category: 'phones',
      productsCount: products.filter((p) => p.category === 'phones').length,
      revenueEstimate: validOrders.reduce((acc, o) => {
        const itemRev = o.items
          .filter((i) => i.product?.category === 'phones')
          .reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
        return acc + itemRev;
      }, 0),
      color: 'bg-indigo-600',
    },
    {
      name: 'Connected Smartwatches',
      category: 'smartwatches',
      productsCount: products.filter((p) => p.category === 'smartwatches').length,
      revenueEstimate: validOrders.reduce((acc, o) => {
        const itemRev = o.items
          .filter((i) => i.product?.category === 'smartwatches')
          .reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
        return acc + itemRev;
      }, 0),
      color: 'bg-emerald-600',
    },
    {
      name: 'Accessories & Power',
      category: 'accessories',
      productsCount: products.filter((p) => p.category === 'accessories').length,
      revenueEstimate: validOrders.reduce((acc, o) => {
        const itemRev = o.items
          .filter((i) => i.product?.category === 'accessories')
          .reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
        return acc + itemRev;
      }, 0),
      color: 'bg-purple-600',
    },
  ];

  // Inventory Health: items with low or out of stock
  const lowStockProducts = products.filter((p) => {
    const totalUnits = p.sizes.reduce((sum, s) => sum + (s.stockCount || 0), 0);
    return totalUnits <= 15 || p.sizes.some((s) => !s.inStock);
  });

  // Export Full Database
  const handleExportFullBackup = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      products,
      orders,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mewak_store_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Store database backup exported successfully', 'success');
  };

  // Restore Database from JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && Array.isArray(parsed.products)) {
          useProductStore.setState({ products: parsed.products });
        }
        if (parsed.orders && Array.isArray(parsed.orders)) {
          useAuthStore.setState({ orders: parsed.orders });
        }
        addToast('Restored catalog and orders from JSON backup', 'success');
      } catch {
        addToast('Invalid JSON backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 font-sans">
      {/* 4 Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-white border border-[#E5E0D8] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <div className="p-2 rounded-xl bg-[#9A8029]/10 text-[#9A8029]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-[#2B1A16]">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#2B1A16]/50 mt-1 font-mono">
            {validOrders.length} confirmed orders
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-[#E5E0D8] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-[#2B1A16]">{orders.length}</div>
          <div className="text-[11px] text-[#2B1A16]/50 mt-1 font-mono">
            {placedCount} placed • {inTransitCount} transit • {deliveredCount} delivered
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white border border-[#E5E0D8] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value (AOV)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-[#2B1A16]">
            ₹{aov.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#2B1A16]/50 mt-1 font-mono">
            Premium acoustics & flagship electronics
          </div>
        </div>

        {/* Fulfillment Rate */}
        <div className="bg-white border border-[#E5E0D8] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#2B1A16]/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fulfillment Health</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-[#2B1A16]">{deliverySuccessRate}%</div>
          <div className="text-[11px] text-[#2B1A16]/50 mt-1 font-mono">
            {cancelledCount > 0 ? `${cancelledCount} cancelled orders` : 'Zero order disputes'}
          </div>
        </div>
      </div>

      {/* Grid: Category Revenue Share & Fulfillment Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Breakdown */}
        <div className="bg-white border border-[#E5E0D8] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                Category Revenue Distribution
              </h3>
              <p className="text-xs text-[#2B1A16]/60">
                Share of sales and active products per category segment.
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#9A8029]" />
          </div>

          <div className="space-y-4 pt-1">
            {categoryStats.map((cat) => {
              const share = totalRevenue > 0 ? Math.round((cat.revenueEstimate / totalRevenue) * 100) : 25;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2B1A16]">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[#2B1A16]/70">
                        ₹{cat.revenueEstimate.toLocaleString('en-IN')}
                      </span>
                      <span className="font-mono font-bold text-[#9A8029] bg-[#9A8029]/10 px-2 py-0.5 rounded text-[10px]">
                        {cat.productsCount} items
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#FAF8F5] rounded-full h-2.5 overflow-hidden border border-[#E5E0D8]">
                    <div
                      className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                      style={{ width: `${Math.max(10, share)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fulfillment Pipeline Funnel */}
        <div className="bg-white border border-[#E5E0D8] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                Order Fulfillment Funnel
              </h3>
              <p className="text-xs text-[#2B1A16]/60">
                Current operational status of all customer orders.
              </p>
            </div>
            <Package className="w-5 h-5 text-[#9A8029]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] text-center">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                Placed
              </span>
              <span className="font-serif text-2xl font-bold text-[#2B1A16] mt-1 block">
                {placedCount}
              </span>
              <span className="text-[10px] text-[#2B1A16]/50">Awaiting packing</span>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] text-center">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                In Transit
              </span>
              <span className="font-serif text-2xl font-bold text-[#2B1A16] mt-1 block">
                {inTransitCount}
              </span>
              <span className="text-[10px] text-[#2B1A16]/50">Packed / Shipped</span>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] text-center">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Delivered
              </span>
              <span className="font-serif text-2xl font-bold text-[#2B1A16] mt-1 block">
                {deliveredCount}
              </span>
              <span className="text-[10px] text-[#2B1A16]/50">Completed</span>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] text-center">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
                Cancelled
              </span>
              <span className="font-serif text-2xl font-bold text-[#2B1A16] mt-1 block">
                {cancelledCount}
              </span>
              <span className="text-[10px] text-[#2B1A16]/50">Voided</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] flex items-center justify-between text-xs text-[#2B1A16]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Express Logistics SLAs: BlueDart Air 48h dispatch target</span>
            </span>
            <span className="font-mono font-bold text-emerald-700 text-xs">99.4% On-Time</span>
          </div>
        </div>
      </div>

      {/* Inventory Health & Low Stock Alert */}
      <div className="bg-white border border-[#E5E0D8] p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                Inventory Health & Stock Attention ({lowStockProducts.length})
              </h3>
              <p className="text-xs text-[#2B1A16]/60">
                Products nearing low-stock threshold (&le; 15 units) or needing variant replenishment.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#2B1A16]/60 font-mono">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Current Stock</th>
                <th className="py-2.5 px-3">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-[#2B1A16]">
              {lowStockProducts.slice(0, 5).map((p) => {
                const totalUnits = p.sizes.reduce((sum, s) => sum + (s.stockCount || 0), 0);
                const hasStock = p.sizes.some((s) => s.inStock);
                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-semibold">{p.name}</td>
                    <td className="py-3 px-3 capitalize font-mono text-[11px] text-[#2B1A16]/70">
                      {p.category}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {totalUnits > 0 ? `${totalUnits} units` : '0 units'}
                    </td>
                    <td className="py-3 px-3 font-mono">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          hasStock && totalUnits > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {hasStock && totalUnits > 0 ? 'LOW STOCK' : 'OUT OF STOCK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Database Sync & Backup Controls */}
      <div className="bg-[#FAF8F5] border border-[#DDD2C0] p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD2C0] pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
              Store Database Sync & Backup Center
            </h3>
            <p className="text-xs text-[#2B1A16]/60">
              Export an instant snapshot of all catalog products, customer orders, and status timelines, or restore from a previous JSON backup file.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white hover:bg-[#EFE8DD] text-[#2B1A16] border border-[#DDD2C0] text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#9A8029]" />
              <span>Import Backup JSON</span>
            </button>

            <button
              type="button"
              onClick={handleExportFullBackup}
              className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-[#EFE8DD]" />
              <span>Export Full Database</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#2B1A16]/70">
          <span>Need to restore default hardware collection?</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset both products catalog and orders to default factory setup?')) {
                resetCatalog();
                resetOrders();
                addToast('Restored catalog and sample orders to factory defaults', 'info');
              }
            }}
            className="text-[#9A8029] hover:underline font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All to Factory Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
}
