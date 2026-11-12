'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Eye,
  RotateCcw,
  Download,
  Upload,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  Sliders,
  Image as ImageIcon,
  ExternalLink,
  Flame,
  Layers,
  ShoppingBag,
  MessageSquare,
  BookOpen,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { useCMSStore, DEFAULT_CMS_DATA } from '@/store/cmsStore';
import { useProductStore } from '@/store/productStore';
import { useUIStore } from '@/store/uiStore';
import { StorefrontCMS } from '@/types/cms';

export default function AdminStorefrontTab() {
  const {
    cms,
    updateHero,
    updateBento,
    updateBentoTile,
    updateNewArrivals,
    updateTrending,
    updateShopByOccasion,
    updateOccasionTab,
    updateShopTheLook,
    updateLookPin,
    updateBrandStory,
    updateTestimonials,
    updateSocials,
    toggleSection,
    resetToDefaults,
    setAllCMS,
  } = useCMSStore();

  const products = useProductStore((state) => state.products);
  const addToast = useUIStore((state) => state.addToast);

  // Active accordion section
  const [activeSection, setActiveSection] = useState<string>('bento');
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const toggleAccordion = (id: string) => {
    setActiveSection((curr) => (curr === id ? '' : id));
  };

  const handleReset = () => {
    if (window.confirm('Reset all storefront sections back to studio default templates?')) {
      resetToDefaults();
      addToast('All storefront sections restored to default layout', 'info');
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cms, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mewak-storefront-cms-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Exported CMS configuration JSON', 'success');
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput) as StorefrontCMS;
      if (!parsed.hero || !parsed.bento) {
        throw new Error('Invalid CMS JSON schema');
      }
      setAllCMS(parsed);
      setShowJsonModal(false);
      setJsonInput('');
      addToast('Successfully imported storefront CMS configuration', 'success');
    } catch {
      alert('Invalid JSON. Please verify structure.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E5E0D8] p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] bg-[#9A8029]/10 px-2 py-0.5 rounded font-bold">
              LIVE CMS STUDIO
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-[#2B1A16]/60">Instant Storefront Synchronization</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2B1A16]">
            Storefront & Section Customizer
          </h2>
          <p className="text-xs text-[#2B1A16]/70 mt-1 max-w-2xl leading-relaxed">
            Customize headlines, imagery, grid layouts, bento tiles, and product allocations across all homepage sections. Changes update on the live store in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE8DD] border border-[#DDD2C0] text-[#2B1A16] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#9A8029]" />
            <span>Preview Store</span>
            <ExternalLink className="w-3 h-3 text-[#2B1A16]/50" />
          </Link>

          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#DDD2C0] text-[#2B1A16] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CMS</span>
          </button>

          <button
            type="button"
            onClick={() => setShowJsonModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#DDD2C0] text-[#2B1A16] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-[#DDD2C0] text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Sections List Accordions */}
      <div className="space-y-4">
        {/* ================= SECTION 1: BENTO (CURATED TECH ECOSYSTEM) ================= */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs transition-all">
          <div
            onClick={() => toggleAccordion('bento')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#9A8029]/10 text-[#9A8029] flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                    Curated Tech Ecosystem (Bento Grid)
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      cms.bento.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {cms.bento.enabled ? 'Enabled' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-[#2B1A16]/60">
                  Headline, narrative description, and individual customizable showcase cards (Headphones, Phones, Watches, Accessories).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2B1A16]/70"
              >
                <span>Visible</span>
                <input
                  type="checkbox"
                  checked={cms.bento.enabled}
                  onChange={(e) => toggleSection('bento', e.target.checked)}
                  className="accent-[#9A8029] w-4 h-4 rounded"
                />
              </label>
              {activeSection === 'bento' ? <ChevronUp className="w-5 h-5 text-[#2B1A16]/50" /> : <ChevronDown className="w-5 h-5 text-[#2B1A16]/50" />}
            </div>
          </div>

          {activeSection === 'bento' && (
            <div className="p-6 border-t border-[#E5E0D8] bg-[#FAF8F5]/50 space-y-6">
              {/* Main Section Heading Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Eyebrow Badge Tag
                  </label>
                  <input
                    type="text"
                    value={cms.bento.eyebrow}
                    onChange={(e) => updateBento({ eyebrow: e.target.value })}
                    placeholder="e.g. HARDWARE ARCHITECTURE"
                    className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={cms.bento.title}
                    onChange={(e) => updateBento({ title: e.target.value })}
                    placeholder="e.g. Curated Tech Ecosystem"
                    className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                  Section Subtitle / Narrative
                </label>
                <textarea
                  rows={2}
                  value={cms.bento.description}
                  onChange={(e) => updateBento({ description: e.target.value })}
                  placeholder="Editorial summary describing the ecosystem lines..."
                  className="w-full bg-white border border-[#DDD2C0] focus:border-[#9A8029] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                />
              </div>

              {/* Bento Tiles Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-[#2B1A16]">
                    Bento Tiles Allocation ({cms.bento.tiles.length})
                  </h4>
                  <span className="text-[11px] text-[#2B1A16]/60">
                    Arranged in a responsive 12-column grid (e.g. 7 cols + 5 cols).
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cms.bento.tiles.map((tile, idx) => (
                    <div
                      key={tile.id}
                      className="bg-white border border-[#DDD2C0] rounded-xl p-4 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
                        <span className="text-xs font-bold text-[#9A8029] font-mono">
                          Tile #{idx + 1}: {tile.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          <label className="text-[#2B1A16]/60">Width:</label>
                          <select
                            value={tile.colSpan}
                            onChange={(e) => updateBentoTile(tile.id, { colSpan: Number(e.target.value) })}
                            className="bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2 py-0.5 text-xs font-semibold"
                          >
                            <option value={7}>Large (7 cols)</option>
                            <option value={5}>Compact (5 cols)</option>
                            <option value={6}>Half (6 cols)</option>
                            <option value={12}>Full (12 cols)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[#2B1A16]/70 mb-1">Title</label>
                          <input
                            type="text"
                            value={tile.title}
                            onChange={(e) => updateBentoTile(tile.id, { title: e.target.value })}
                            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1.5 outline-none font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[#2B1A16]/70 mb-1">Category Route Link</label>
                          <input
                            type="text"
                            value={tile.categorySlug}
                            onChange={(e) => updateBentoTile(tile.id, { categorySlug: e.target.value })}
                            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1.5 outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[#2B1A16]/70 mb-1">Gold Pill Badge</label>
                          <input
                            type="text"
                            value={tile.badge}
                            onChange={(e) => updateBentoTile(tile.id, { badge: e.target.value })}
                            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1.5 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[#2B1A16]/70 mb-1">Sub-Tagline</label>
                          <input
                            type="text"
                            value={tile.tagline}
                            onChange={(e) => updateBentoTile(tile.id, { tagline: e.target.value })}
                            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1.5 outline-none uppercase"
                          />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block text-[#2B1A16]/70 mb-1">Card Description</label>
                        <input
                          type="text"
                          value={tile.description}
                          onChange={(e) => updateBentoTile(tile.id, { description: e.target.value })}
                          className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1.5 outline-none"
                        />
                      </div>

                      {/* Image URL & Thumbnail */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#DDD2C0] bg-[#0F172A] shrink-0">
                          <Image
                            src={tile.image}
                            alt={tile.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="block text-[11px] text-[#2B1A16]/70 mb-1">Background Image URL</label>
                          <input
                            type="text"
                            value={tile.image}
                            onChange={(e) => updateBentoTile(tile.id, { image: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1 text-xs outline-none font-mono truncate"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 2: LATEST RELEASES (NEW ARRIVALS) ================= */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs transition-all">
          <div
            onClick={() => toggleAccordion('newArrivals')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#9A8029]/10 text-[#9A8029] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                    Latest Releases (Horizontal Hardware Carousel)
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      cms.newArrivals.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {cms.newArrivals.enabled ? 'Enabled' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-[#2B1A16]/60">
                  Headline, view all link, automatic new-arrival filter, or curated manual product selection.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2B1A16]/70"
              >
                <span>Visible</span>
                <input
                  type="checkbox"
                  checked={cms.newArrivals.enabled}
                  onChange={(e) => toggleSection('newArrivals', e.target.checked)}
                  className="accent-[#9A8029] w-4 h-4 rounded"
                />
              </label>
              {activeSection === 'newArrivals' ? <ChevronUp className="w-5 h-5 text-[#2B1A16]/50" /> : <ChevronDown className="w-5 h-5 text-[#2B1A16]/50" />}
            </div>
          </div>

          {activeSection === 'newArrivals' && (
            <div className="p-6 border-t border-[#E5E0D8] bg-[#FAF8F5]/50 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Eyebrow Text
                  </label>
                  <input
                    type="text"
                    value={cms.newArrivals.eyebrow}
                    onChange={(e) => updateNewArrivals({ eyebrow: e.target.value })}
                    placeholder="e.g. FRESH OFF THE HARDWARE LAB"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={cms.newArrivals.title}
                    onChange={(e) => updateNewArrivals({ title: e.target.value })}
                    placeholder="e.g. Latest Releases"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    &quot;View All&quot; Button Label
                  </label>
                  <input
                    type="text"
                    value={cms.newArrivals.buttonLabel}
                    onChange={(e) => updateNewArrivals({ buttonLabel: e.target.value })}
                    placeholder="View All"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Button Destination URL
                  </label>
                  <input
                    type="text"
                    value={cms.newArrivals.buttonUrl}
                    onChange={(e) => updateNewArrivals({ buttonUrl: e.target.value })}
                    placeholder="/shop?filter=new"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Max Items In Carousel: {cms.newArrivals.displayCount}
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={16}
                    value={cms.newArrivals.displayCount}
                    onChange={(e) => updateNewArrivals({ displayCount: Number(e.target.value) })}
                    className="w-full accent-[#9A8029] mt-2 cursor-pointer"
                  />
                </div>
              </div>

              {/* Selection Mode */}
              <div className="bg-white border border-[#DDD2C0] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2B1A16]">
                    Product Population Mode
                  </label>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="newArrivalsMode"
                        checked={cms.newArrivals.selectionMode === 'auto'}
                        onChange={() => updateNewArrivals({ selectionMode: 'auto' })}
                        className="accent-[#9A8029]"
                      />
                      <span>Automatic (Items with &quot;New Arrival&quot; flag)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="newArrivalsMode"
                        checked={cms.newArrivals.selectionMode === 'manual'}
                        onChange={() => updateNewArrivals({ selectionMode: 'manual' })}
                        className="accent-[#9A8029]"
                      />
                      <span>Manual Pick From Catalog</span>
                    </label>
                  </div>
                </div>

                {cms.newArrivals.selectionMode === 'manual' && (
                  <div className="pt-2 border-t border-[#E5E0D8] space-y-2">
                    <span className="text-[11px] text-[#2B1A16]/70 block font-semibold">
                      Select specific hardware to pin to the Latest Releases carousel:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                      {products.map((p) => {
                        const isSelected = (cms.newArrivals.manualProductIds || []).includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#9A8029]/10 border-[#9A8029] font-semibold text-[#2B1A16]'
                                : 'bg-[#FAF8F5] border-[#DDD2C0] text-[#2B1A16]/80 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const current = cms.newArrivals.manualProductIds || [];
                                const next = isSelected
                                  ? current.filter((id) => id !== p.id)
                                  : [...current, p.id];
                                updateNewArrivals({ manualProductIds: next });
                              }}
                              className="accent-[#9A8029]"
                            />
                            <span className="truncate">{p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 3: TRENDING TECH GRID ================= */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs transition-all">
          <div
            onClick={() => toggleAccordion('trending')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#B3402F]/10 text-[#B3402F] flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                    Trending Tech (Most Popular 8-Grid)
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      cms.trending.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {cms.trending.enabled ? 'Enabled' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-[#2B1A16]/60">
                  Curated flagship grid, flame badge title, catalog redirection, and manual or auto trending picks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2B1A16]/70"
              >
                <span>Visible</span>
                <input
                  type="checkbox"
                  checked={cms.trending.enabled}
                  onChange={(e) => toggleSection('trending', e.target.checked)}
                  className="accent-[#9A8029] w-4 h-4 rounded"
                />
              </label>
              {activeSection === 'trending' ? <ChevronUp className="w-5 h-5 text-[#2B1A16]/50" /> : <ChevronDown className="w-5 h-5 text-[#2B1A16]/50" />}
            </div>
          </div>

          {activeSection === 'trending' && (
            <div className="p-6 border-t border-[#E5E0D8] bg-[#FAF8F5]/50 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Flame Badge Text
                  </label>
                  <input
                    type="text"
                    value={cms.trending.badge}
                    onChange={(e) => updateTrending({ badge: e.target.value })}
                    placeholder="e.g. MOST POPULAR HARDWARE"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={cms.trending.title}
                    onChange={(e) => updateTrending({ title: e.target.value })}
                    placeholder="e.g. Trending Tech"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Link Label
                  </label>
                  <input
                    type="text"
                    value={cms.trending.linkText}
                    onChange={(e) => updateTrending({ linkText: e.target.value })}
                    placeholder="Explore Catalog"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Link URL
                  </label>
                  <input
                    type="text"
                    value={cms.trending.linkUrl}
                    onChange={(e) => updateTrending({ linkUrl: e.target.value })}
                    placeholder="/shop"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Max Grid Items: {cms.trending.displayCount}
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={12}
                    step={2}
                    value={cms.trending.displayCount}
                    onChange={(e) => updateTrending({ displayCount: Number(e.target.value) })}
                    className="w-full accent-[#9A8029] mt-2 cursor-pointer"
                  />
                </div>
              </div>

              {/* Selection Mode */}
              <div className="bg-white border border-[#DDD2C0] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2B1A16]">
                    Trending Source Mode
                  </label>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="trendingMode"
                        checked={cms.trending.selectionMode === 'auto'}
                        onChange={() => updateTrending({ selectionMode: 'auto' })}
                        className="accent-[#9A8029]"
                      />
                      <span>Automatic (Items with &quot;Trending&quot; flag)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="trendingMode"
                        checked={cms.trending.selectionMode === 'manual'}
                        onChange={() => updateTrending({ selectionMode: 'manual' })}
                        className="accent-[#9A8029]"
                      />
                      <span>Manual Pick From Catalog</span>
                    </label>
                  </div>
                </div>

                {cms.trending.selectionMode === 'manual' && (
                  <div className="pt-2 border-t border-[#E5E0D8] space-y-2">
                    <span className="text-[11px] text-[#2B1A16]/70 block font-semibold">
                      Select specific hardware to display in the Trending Tech grid:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                      {products.map((p) => {
                        const isSelected = (cms.trending.manualProductIds || []).includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#9A8029]/10 border-[#9A8029] font-semibold text-[#2B1A16]'
                                : 'bg-[#FAF8F5] border-[#DDD2C0] text-[#2B1A16]/80 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const current = cms.trending.manualProductIds || [];
                                const next = isSelected
                                  ? current.filter((id) => id !== p.id)
                                  : [...current, p.id];
                                updateTrending({ manualProductIds: next });
                              }}
                              className="accent-[#9A8029]"
                            />
                            <span className="truncate">{p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 4: HERO BANNER ================= */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs transition-all">
          <div
            onClick={() => toggleAccordion('hero')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shrink-0">
                <LayoutTemplate className="w-5 h-5 text-[#9A8029]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                    Hero Stage & Architectural Banner
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      cms.hero.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {cms.hero.enabled ? 'Enabled' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-[#2B1A16]/60">
                  Primary hero image background, headline, button links, and 4 value proposition badges.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2B1A16]/70"
              >
                <span>Visible</span>
                <input
                  type="checkbox"
                  checked={cms.hero.enabled}
                  onChange={(e) => toggleSection('hero', e.target.checked)}
                  className="accent-[#9A8029] w-4 h-4 rounded"
                />
              </label>
              {activeSection === 'hero' ? <ChevronUp className="w-5 h-5 text-[#2B1A16]/50" /> : <ChevronDown className="w-5 h-5 text-[#2B1A16]/50" />}
            </div>
          </div>

          {activeSection === 'hero' && (
            <div className="p-6 border-t border-[#E5E0D8] bg-[#FAF8F5]/50 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Sub-Badge Text
                  </label>
                  <input
                    type="text"
                    value={cms.hero.subBadge}
                    onChange={(e) => updateHero({ subBadge: e.target.value })}
                    placeholder="Next-Gen Audio & Flagship Silicon 2026"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Main Headline
                  </label>
                  <input
                    type="text"
                    value={cms.hero.headline}
                    onChange={(e) => updateHero({ headline: e.target.value })}
                    placeholder="Architectural Sound. Pure Silicon Mastery."
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                  Hero Paragraph Narrative
                </label>
                <textarea
                  rows={2}
                  value={cms.hero.description}
                  onChange={(e) => updateHero({ description: e.target.value })}
                  placeholder="Engineered with custom beryllium drivers..."
                  className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#DDD2C0]">
                  <span className="text-xs font-bold text-[#9A8029] block">Primary Button</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cms.hero.primaryButtonLabel}
                      onChange={(e) => updateHero({ primaryButtonLabel: e.target.value })}
                      placeholder="Explore All Gear"
                      className="bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={cms.hero.primaryButtonUrl}
                      onChange={(e) => updateHero({ primaryButtonUrl: e.target.value })}
                      placeholder="/shop"
                      className="bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#DDD2C0]">
                  <span className="text-xs font-bold text-[#2B1A16] block">Secondary Button</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cms.hero.secondaryButtonLabel}
                      onChange={(e) => updateHero({ secondaryButtonLabel: e.target.value })}
                      placeholder="Audio & Headphones"
                      className="bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={cms.hero.secondaryButtonUrl}
                      onChange={(e) => updateHero({ secondaryButtonUrl: e.target.value })}
                      placeholder="/shop/headphones"
                      className="bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Background Image */}
              <div className="bg-white border border-[#DDD2C0] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-44 h-24 rounded-lg overflow-hidden border border-[#DDD2C0] bg-[#0F172A] shrink-0">
                  <Image
                    src={cms.hero.backgroundImage}
                    alt="Hero preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 w-full space-y-2">
                  <label className="block text-xs font-semibold text-[#2B1A16]">
                    Hero Background Image Link
                  </label>
                  <input
                    type="text"
                    value={cms.hero.backgroundImage}
                    onChange={(e) => updateHero({ backgroundImage: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-3 py-2 text-xs font-mono outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateHero({
                          backgroundImage:
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2000&q=85',
                        })
                      }
                      className="text-[10px] text-[#9A8029] underline"
                    >
                      Use Studio Headphones Preset
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateHero({
                          backgroundImage:
                            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=2000&q=85',
                        })
                      }
                      className="text-[10px] text-[#9A8029] underline"
                    >
                      Use Titanium Phone Preset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 5: SHOP BY LIFESTYLE & SETUP ================= */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs transition-all">
          <div
            onClick={() => toggleAccordion('shopByOccasion')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#9A8029]/10 text-[#9A8029] flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                    Shop by Lifestyle & Setup (Occasion Filters)
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      cms.shopByOccasion.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {cms.shopByOccasion.enabled ? 'Enabled' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-[#2B1A16]/60">
                  Customizable category tabs: Work & Studio, Sports & Adventure, Gaming & Esports, Daily Flagships.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2B1A16]/70"
              >
                <span>Visible</span>
                <input
                  type="checkbox"
                  checked={cms.shopByOccasion.enabled}
                  onChange={(e) => toggleSection('shopByOccasion', e.target.checked)}
                  className="accent-[#9A8029] w-4 h-4 rounded"
                />
              </label>
              {activeSection === 'shopByOccasion' ? <ChevronUp className="w-5 h-5 text-[#2B1A16]/50" /> : <ChevronDown className="w-5 h-5 text-[#2B1A16]/50" />}
            </div>
          </div>

          {activeSection === 'shopByOccasion' && (
            <div className="p-6 border-t border-[#E5E0D8] bg-[#FAF8F5]/50 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Eyebrow Text
                  </label>
                  <input
                    type="text"
                    value={cms.shopByOccasion.eyebrow}
                    onChange={(e) => updateShopByOccasion({ eyebrow: e.target.value })}
                    placeholder="ENGINEERED FOR YOUR WORKFLOW"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={cms.shopByOccasion.title}
                    onChange={(e) => updateShopByOccasion({ title: e.target.value })}
                    placeholder="Shop by Lifestyle & Setup"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-[#2B1A16] block">
                  Configurable Lifestyle Tabs ({cms.shopByOccasion.tabs.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cms.shopByOccasion.tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className="bg-white border border-[#DDD2C0] rounded-xl p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={tab.label}
                          onChange={(e) => updateOccasionTab(tab.id, { label: e.target.value })}
                          className="bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2 py-1 font-semibold text-[#2B1A16] outline-none"
                        />
                        <span className="font-mono text-[10px] text-[#9A8029] bg-[#9A8029]/10 px-2 py-0.5 rounded">
                          Matches: {tab.occasionKey}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[#2B1A16]/60 text-[11px] mb-1">Tagline Under Header</label>
                        <input
                          type="text"
                          value={tab.tagline}
                          onChange={(e) => updateOccasionTab(tab.id, { tagline: e.target.value })}
                          className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2 py-1 text-[11px] outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 6: INTERACTIVE SHOP THE LOOK ================= */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs transition-all">
          <div
            onClick={() => toggleAccordion('shopTheLook')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#9A8029]/10 text-[#9A8029] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                    Interactive Workspace Lookbook (Hotspot Stage)
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      cms.shopTheLook.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {cms.shopTheLook.enabled ? 'Enabled' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-[#2B1A16]/60">
                  Monolithic workstation photo with clickable interactive hotspot pins linking directly to cart items.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2B1A16]/70"
              >
                <span>Visible</span>
                <input
                  type="checkbox"
                  checked={cms.shopTheLook.enabled}
                  onChange={(e) => toggleSection('shopTheLook', e.target.checked)}
                  className="accent-[#9A8029] w-4 h-4 rounded"
                />
              </label>
              {activeSection === 'shopTheLook' ? <ChevronUp className="w-5 h-5 text-[#2B1A16]/50" /> : <ChevronDown className="w-5 h-5 text-[#2B1A16]/50" />}
            </div>
          </div>

          {activeSection === 'shopTheLook' && (
            <div className="p-6 border-t border-[#E5E0D8] bg-[#FAF8F5]/50 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Eyebrow Text
                  </label>
                  <input
                    type="text"
                    value={cms.shopTheLook.eyebrow}
                    onChange={(e) => updateShopTheLook({ eyebrow: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={cms.shopTheLook.title}
                    onChange={(e) => updateShopTheLook({ title: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              {/* Lookbook Main Image */}
              <div className="bg-white border border-[#DDD2C0] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-40 h-28 rounded-lg overflow-hidden border border-[#DDD2C0] bg-[#0F172A] shrink-0">
                  <Image
                    src={cms.shopTheLook.lookImage}
                    alt="Look preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 w-full space-y-2">
                  <label className="block text-xs font-semibold text-[#2B1A16]">
                    Main Workspace Background Image URL
                  </label>
                  <input
                    type="text"
                    value={cms.shopTheLook.lookImage}
                    onChange={(e) => updateShopTheLook({ lookImage: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              {/* Hotspot Pins */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#2B1A16] block">
                  Interactive Hotspot Pins ({cms.shopTheLook.pins.length})
                </span>
                <div className="space-y-3">
                  {cms.shopTheLook.pins.map((pin, idx) => (
                    <div
                      key={pin.id}
                      className="bg-white border border-[#DDD2C0] rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-xs"
                    >
                      <div>
                        <label className="block text-[#2B1A16]/60 text-[10px]">Product Name</label>
                        <input
                          type="text"
                          value={pin.productName}
                          onChange={(e) => updateLookPin(pin.id, { productName: e.target.value })}
                          className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2.5 py-1.5 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[#2B1A16]/60 text-[10px]">Price (₹)</label>
                        <input
                          type="number"
                          value={pin.price}
                          onChange={(e) => updateLookPin(pin.id, { price: Number(e.target.value) })}
                          className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2.5 py-1.5 font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-[#2B1A16]/60 text-[10px]">Pos X %</label>
                          <input
                            type="number"
                            min={5}
                            max={95}
                            value={pin.x}
                            onChange={(e) => updateLookPin(pin.id, { x: Number(e.target.value) })}
                            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2 py-1.5"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[#2B1A16]/60 text-[10px]">Pos Y %</label>
                          <input
                            type="number"
                            min={5}
                            max={95}
                            value={pin.y}
                            onChange={(e) => updateLookPin(pin.id, { y: Number(e.target.value) })}
                            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2 py-1.5"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#2B1A16]/60 text-[10px]">Thumbnail Image</label>
                        <input
                          type="text"
                          value={pin.image}
                          onChange={(e) => updateLookPin(pin.id, { image: e.target.value })}
                          className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2.5 py-1.5 font-mono truncate"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 7: BRAND STORY ================= */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs transition-all">
          <div
            onClick={() => toggleAccordion('brandStory')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#9A8029]/10 text-[#9A8029] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                    Engineering Philosophy & Brand Story
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      cms.brandStory.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {cms.brandStory.enabled ? 'Enabled' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-[#2B1A16]/60">
                  Laboratory collage images, editorial quote, brand manifesto, and gold monogram seal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2B1A16]/70"
              >
                <span>Visible</span>
                <input
                  type="checkbox"
                  checked={cms.brandStory.enabled}
                  onChange={(e) => toggleSection('brandStory', e.target.checked)}
                  className="accent-[#9A8029] w-4 h-4 rounded"
                />
              </label>
              {activeSection === 'brandStory' ? <ChevronUp className="w-5 h-5 text-[#2B1A16]/50" /> : <ChevronDown className="w-5 h-5 text-[#2B1A16]/50" />}
            </div>
          </div>

          {activeSection === 'brandStory' && (
            <div className="p-6 border-t border-[#E5E0D8] bg-[#FAF8F5]/50 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Eyebrow Text
                  </label>
                  <input
                    type="text"
                    value={cms.brandStory.eyebrow}
                    onChange={(e) => updateBrandStory({ eyebrow: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={cms.brandStory.title}
                    onChange={(e) => updateBrandStory({ title: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                  Editorial Quote
                </label>
                <textarea
                  rows={2}
                  value={cms.brandStory.quote}
                  onChange={(e) => updateBrandStory({ quote: e.target.value })}
                  className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none italic"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Paragraph 1 (Materials)
                  </label>
                  <textarea
                    rows={3}
                    value={cms.brandStory.paragraph1}
                    onChange={(e) => updateBrandStory({ paragraph1: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Paragraph 2 (Silicon & Architecture)
                  </label>
                  <textarea
                    rows={3}
                    value={cms.brandStory.paragraph2}
                    onChange={(e) => updateBrandStory({ paragraph2: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Collage Photo 1 URL
                  </label>
                  <input
                    type="text"
                    value={cms.brandStory.image1}
                    onChange={(e) => updateBrandStory({ image1: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Collage Photo 2 URL
                  </label>
                  <input
                    type="text"
                    value={cms.brandStory.image2}
                    onChange={(e) => updateBrandStory({ image2: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Seal Monogram Text
                  </label>
                  <input
                    type="text"
                    value={cms.brandStory.sealText}
                    onChange={(e) => updateBrandStory({ sealText: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs uppercase font-mono font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 8: TESTIMONIALS ================= */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs transition-all">
          <div
            onClick={() => toggleAccordion('testimonials')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#9A8029]/10 text-[#9A8029] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                    Verified Owner Reviews & Testimonials
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      cms.testimonials.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {cms.testimonials.enabled ? 'Enabled' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-[#2B1A16]/60">
                  Highlighted verified reviews, quotes, author credentials, and star ratings.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2B1A16]/70"
              >
                <span>Visible</span>
                <input
                  type="checkbox"
                  checked={cms.testimonials.enabled}
                  onChange={(e) => toggleSection('testimonials', e.target.checked)}
                  className="accent-[#9A8029] w-4 h-4 rounded"
                />
              </label>
              {activeSection === 'testimonials' ? <ChevronUp className="w-5 h-5 text-[#2B1A16]/50" /> : <ChevronDown className="w-5 h-5 text-[#2B1A16]/50" />}
            </div>
          </div>

          {activeSection === 'testimonials' && (
            <div className="p-6 border-t border-[#E5E0D8] bg-[#FAF8F5]/50 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Eyebrow Text
                  </label>
                  <input
                    type="text"
                    value={cms.testimonials.eyebrow}
                    onChange={(e) => updateTestimonials({ eyebrow: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs text-[#2B1A16] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1A16] mb-1.5">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={cms.testimonials.title}
                    onChange={(e) => updateTestimonials({ title: e.target.value })}
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2B1A16] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-[#2B1A16] block">
                  Reviews Carousel Cards ({cms.testimonials.items.length})
                </span>
                <div className="space-y-3">
                  {cms.testimonials.items.map((rev, idx) => (
                    <div
                      key={rev.id}
                      className="bg-white border border-[#DDD2C0] rounded-xl p-4 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
                        <span className="font-bold text-[#9A8029] font-mono">
                          Review #{idx + 1}: {rev.author}
                        </span>
                        <div className="flex items-center gap-1 text-[#9A8029]">
                          <span>Rating:</span>
                          <select
                            value={rev.rating}
                            onChange={(e) => {
                              const updated = cms.testimonials.items.map((item) =>
                                item.id === rev.id ? { ...item, rating: Number(e.target.value) } : item
                              );
                              updateTestimonials({ items: updated });
                            }}
                            className="bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2 py-0.5 font-bold"
                          >
                            <option value={5}>5 Stars</option>
                            <option value={4}>4 Stars</option>
                            <option value={3}>3 Stars</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#2B1A16]/70 mb-1">Quote</label>
                        <textarea
                          rows={2}
                          value={rev.quote}
                          onChange={(e) => {
                            const updated = cms.testimonials.items.map((item) =>
                              item.id === rev.id ? { ...item, quote: e.target.value } : item
                            );
                            updateTestimonials({ items: updated });
                          }}
                          className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-lg px-2.5 py-1.5 outline-none italic"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[#2B1A16]/70 mb-0.5">Author Name</label>
                          <input
                            type="text"
                            value={rev.author}
                            onChange={(e) => {
                              const updated = cms.testimonials.items.map((item) =>
                                item.id === rev.id ? { ...item, author: e.target.value } : item
                              );
                              updateTestimonials({ items: updated });
                            }}
                            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2 py-1"
                          />
                        </div>

                        <div>
                          <label className="block text-[#2B1A16]/70 mb-0.5">Role / Profession</label>
                          <input
                            type="text"
                            value={rev.role}
                            onChange={(e) => {
                              const updated = cms.testimonials.items.map((item) =>
                                item.id === rev.id ? { ...item, role: e.target.value } : item
                              );
                              updateTestimonials({ items: updated });
                            }}
                            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2 py-1"
                          />
                        </div>

                        <div>
                          <label className="block text-[#2B1A16]/70 mb-0.5">Product Purchased</label>
                          <input
                            type="text"
                            value={rev.productName}
                            onChange={(e) => {
                              const updated = cms.testimonials.items.map((item) =>
                                item.id === rev.id ? { ...item, productName: e.target.value } : item
                              );
                              updateTestimonials({ items: updated });
                            }}
                            className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded px-2 py-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 9: SOCIAL MEDIA & CHANNELS ================= */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-xs transition-all">
          <div
            onClick={() => toggleAccordion('socials')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#9A8029]/10 text-[#9A8029] flex items-center justify-center shrink-0 font-bold">
                𝕏
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                  Social Media Handles & Support Channels
                </h3>
                <p className="text-xs text-[#2B1A16]/60">
                  Configure links for Instagram, YouTube, X/Twitter, Discord, Facebook, support email, and hotline phone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activeSection === 'socials' ? <ChevronUp className="w-5 h-5 text-[#2B1A16]/50" /> : <ChevronDown className="w-5 h-5 text-[#2B1A16]/50" />}
            </div>
          </div>

          {activeSection === 'socials' && (
            <div className="p-6 border-t border-[#E5E0D8] bg-[#FAF8F5]/50 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    Instagram Profile URL
                  </label>
                  <input
                    type="text"
                    value={cms.socials?.instagram || ''}
                    onChange={(e) => updateSocials({ instagram: e.target.value })}
                    placeholder="https://instagram.com/mewak_electronics"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    YouTube Labs Channel URL
                  </label>
                  <input
                    type="text"
                    value={cms.socials?.youtube || ''}
                    onChange={(e) => updateSocials({ youtube: e.target.value })}
                    placeholder="https://youtube.com/@mewak_audio"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    Twitter / 𝕏 Handle URL
                  </label>
                  <input
                    type="text"
                    value={cms.socials?.twitter || ''}
                    onChange={(e) => updateSocials({ twitter: e.target.value })}
                    placeholder="https://x.com/mewak_tech"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    Discord Community Server URL
                  </label>
                  <input
                    type="text"
                    value={cms.socials?.discord || ''}
                    onChange={(e) => updateSocials({ discord: e.target.value })}
                    placeholder="https://discord.gg/mewak"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="text"
                    value={cms.socials?.facebook || ''}
                    onChange={(e) => updateSocials({ facebook: e.target.value })}
                    placeholder="https://facebook.com/mewakelectronics"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    LinkedIn Organization URL
                  </label>
                  <input
                    type="text"
                    value={cms.socials?.linkedin || ''}
                    onChange={(e) => updateSocials({ linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/mewak"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    Official Support & Concierge Email
                  </label>
                  <input
                    type="email"
                    value={cms.socials?.supportEmail || ''}
                    onChange={(e) => updateSocials({ supportEmail: e.target.value })}
                    placeholder="concierge@mewak.com"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1">
                    Toll-Free Phone Hotline
                  </label>
                  <input
                    type="text"
                    value={cms.socials?.supportPhone || ''}
                    onChange={(e) => updateSocials({ supportPhone: e.target.value })}
                    placeholder="+91 80 4920 1800"
                    className="w-full bg-white border border-[#DDD2C0] rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* JSON Import Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#2B1A16]">
              Import Storefront CMS Configuration
            </h3>
            <p className="text-xs text-[#2B1A16]/70">
              Paste the exported JSON to instantly restore or replicate layout settings, hero copy, and bento tiles.
            </p>
            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON config here..."
              className="w-full bg-[#FAF8F5] border border-[#DDD2C0] rounded-xl p-3 text-xs font-mono outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 border border-[#DDD2C0] rounded-xl text-xs font-semibold text-[#2B1A16]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportJson}
                className="px-5 py-2 bg-[#2B1A16] hover:bg-[#9A8029] text-white rounded-xl text-xs font-semibold"
              >
                Apply Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

