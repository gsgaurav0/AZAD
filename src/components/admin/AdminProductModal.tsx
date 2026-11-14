'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { Category, Occasion, Product, ProductColor, ProductSize } from '@/types';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
  productToEdit?: Product | null;
}

const CATEGORY_PRESETS: Record<
  Category,
  {
    subcategories: string[];
    sampleImages: string[];
    sampleColors: ProductColor[];
    sampleSizes: ProductSize[];
    defaultMaterials: string;
    defaultFit: string;
    defaultDetails: string[];
    defaultCare: string[];
  }
> = {
  headphones: {
    subcategories: ['Noise Cancelling', 'Wireless Earbuds', 'Audiophile Wired', 'Gaming Headset'],
    sampleImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80',
    ],
    sampleColors: [
      {
        name: 'Space Black',
        hex: '#111827',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: 'Titanium Silver',
        hex: '#94A3B8',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    sampleSizes: [
      { size: 'Standard Edition', inStock: true, stockCount: 25 },
      { size: 'Studio Bundle (+ DAC)', inStock: true, stockCount: 10 },
    ],
    defaultMaterials: 'Aero-grade Aluminum & Memory Foam Lambskin',
    defaultFit: 'Over-Ear Ergonomic Acoustic Seal • 280g',
    defaultDetails: [
      '40mm Custom Beryllium Acoustic Drivers with <0.05% THD',
      'Hybrid ANC cancelling up to 42dB ambient sound',
      '45 hours battery life with fast Qi & USB-C charge',
      'Bluetooth 5.4 with LDAC & lossless codec streaming',
    ],
    defaultCare: [
      '2-Year Mewak Total Care Replacement Warranty',
      'Protective magnetic hard carrying case included',
      'Braided USB-C fast charge & 3.5mm audio cables included',
    ],
  },
  phones: {
    subcategories: ['Flagship Smartphone', 'Compact Flagship', 'Foldable Concept'],
    sampleImages: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=80',
    ],
    sampleColors: [
      {
        name: 'Obsidian Black',
        hex: '#18181B',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: 'Natural Titanium',
        hex: '#8E8B82',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    sampleSizes: [
      { size: '256GB / 12GB RAM', inStock: true, stockCount: 20 },
      { size: '512GB / 16GB RAM', inStock: true, stockCount: 15 },
      { size: '1TB / 16GB RAM', inStock: true, stockCount: 8 },
    ],
    defaultMaterials: 'Grade-5 Titanium Chassis & Ceramic Shield Glass',
    defaultFit: '6.7-inch Quad-Micro-Curved OLED • 198g',
    defaultDetails: [
      '3nm Silicon Architecture with Neural Processing Unit',
      '6.7-inch Super Retina XDR OLED Display (1-120Hz LTPO)',
      '50MP Triple Studio Camera System with 5x Optical Zoom',
      '5,000mAh Dual-Cell Silicon-Carbon Battery',
    ],
    defaultCare: [
      '2-Year Official Brand Hardware Warranty',
      'Pre-applied sapphire screen protector included',
      '120W GaN Fast Charger & Kevlar cable in retail box',
    ],
  },
  smartwatches: {
    subcategories: ['Rugged Titanium', 'Dress Watch Edition', 'Ultra Fitness Tracker'],
    sampleImages: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80',
    ],
    sampleColors: [
      {
        name: 'Titanium Raw',
        hex: '#9CA3AF',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: 'Midnight Ceramic',
        hex: '#1F2937',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    sampleSizes: [
      { size: '41mm Case', inStock: true, stockCount: 15 },
      { size: '45mm Case', inStock: true, stockCount: 25 },
      { size: '49mm Ultra Case', inStock: true, stockCount: 8 },
    ],
    defaultMaterials: 'Grade-5 Aerospace Titanium & Sapphire Crystal Lens',
    defaultFit: 'Curved Ergonomic Sensor Pod • 42g',
    defaultDetails: [
      'Always-On Sapphire LTPO AMOLED with 3000 nits peak outdoor brightness',
      'Clinical-grade ECG, Continuous Blood Oxygen (SpO2) & Dual-temp Sensors',
      'Multi-band Dual-Frequency L1/L5 Precision GPS',
      '100m Water Resistance with Oceanic Dive Computer standard',
    ],
    defaultCare: [
      '2-Year Mewak Total Care Replacement Warranty',
      'Magnetic braided wireless charging puck included',
      'Fluoroelastomer sport band + Titanium mesh link band',
    ],
  },
  accessories: {
    subcategories: ['Magnetic Charging', 'Desk Setup', 'Audio DAC & Amps', 'Cases & Armor'],
    sampleImages: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622445262464-84b14e30454e?auto=format&fit=crop&w=1000&q=80',
    ],
    sampleColors: [
      {
        name: 'Matte Charcoal',
        hex: '#27272A',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80',
      },
      {
        name: 'Anodized Silver',
        hex: '#E4E4E7',
        image: 'https://images.unsplash.com/photo-1622445262464-84b14e30454e?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    sampleSizes: [
      { size: 'Standard Edition', inStock: true, stockCount: 40 },
      { size: 'Pro Bundle (+ 100W GaN Adapter)', inStock: true, stockCount: 20 },
    ],
    defaultMaterials: 'CNC Machined Aircraft-Grade Aluminum & Walnut Accent',
    defaultFit: 'Modular Desktop Magnetic Stand • 320g',
    defaultDetails: [
      '3-in-1 Simultaneous Fast Qi2 Magnetic Wireless Charging',
      'Smart Thermal Dissipation with Whisper-Silent Conductive Core',
      'Universal Compatibility with iOS, Android & Bluetooth Audio Gear',
    ],
    defaultCare: [
      '2-Year Official Brand Replacement Warranty',
      'Braided 2m 100W USB-C cable included in box',
    ],
  },
};

export default function AdminProductModal({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}: AdminProductModalProps) {
  const isEditing = !!productToEdit;

  // Active form section
  const [activeSection, setActiveSection] = useState<'info' | 'images' | 'variants' | 'specs'>('info');

  // Basic Information
  const [name, setName] = useState(productToEdit?.name || 'Mewak Horizon ANC Headphones');
  const [subtitle, setSubtitle] = useState(
    productToEdit?.subtitle || 'Custom 40mm Beryllium Drivers • 45h Battery • Spatial Audio'
  );
  const [category, setCategory] = useState<Category>(productToEdit?.category || 'headphones');
  const [subcategory, setSubcategory] = useState(productToEdit?.subcategory || 'Noise Cancelling');
  const [occasion, setOccasion] = useState<Occasion>(productToEdit?.occasion || 'Work');

  // Commercial Pricing & Stock
  const [price, setPrice] = useState<number>(productToEdit?.price || 18999);
  const [originalPrice, setOriginalPrice] = useState<number>(productToEdit?.originalPrice || 24999);
  const [isNew, setIsNew] = useState<boolean>(productToEdit ? productToEdit.isNew : true);
  const [isTrending, setIsTrending] = useState<boolean>(productToEdit ? productToEdit.isTrending : false);
  const [isFeatured, setIsFeatured] = useState<boolean>(productToEdit ? productToEdit.isFeatured : false);

  // Dedicated Image Slots with Instant Live Preview
  const [coverImage, setCoverImage] = useState<string>(
    productToEdit?.images?.[0] || CATEGORY_PRESETS.headphones.sampleImages[0]
  );
  const [image2, setImage2] = useState<string>(productToEdit?.images?.[1] || '');
  const [image3, setImage3] = useState<string>(productToEdit?.images?.[2] || '');

  // Colors List
  const [colors, setColors] = useState<ProductColor[]>(
    productToEdit?.colors || CATEGORY_PRESETS.headphones.sampleColors
  );
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#111827');
  const [newColorImg, setNewColorImg] = useState('');

  // Sizes & Editions List
  const [sizes, setSizes] = useState<ProductSize[]>(
    productToEdit?.sizes || CATEGORY_PRESETS.headphones.sampleSizes
  );
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizeStock, setNewSizeStock] = useState(25);

  // Technical Specs & Details
  const [fabric, setFabric] = useState(
    productToEdit?.fabric || CATEGORY_PRESETS.headphones.defaultMaterials
  );
  const [fit, setFit] = useState(productToEdit?.fit || CATEGORY_PRESETS.headphones.defaultFit);
  const [description, setDescription] = useState(
    productToEdit?.description ||
      'Engineered for true acoustic purity, uniting precision silicon architecture with aerospace materials.'
  );
  const [detailsText, setDetailsText] = useState(
    productToEdit?.details?.join('\n') || CATEGORY_PRESETS.headphones.defaultDetails.join('\n')
  );
  const [careText, setCareText] = useState(
    productToEdit?.care?.join('\n') || CATEGORY_PRESETS.headphones.defaultCare.join('\n')
  );
  const [returns, setReturns] = useState(
    productToEdit?.returns ||
      '15-day risk-free home trial with complimentary doorstep replacement and 2-year manufacturer warranty.'
  );

  if (!isOpen) return null;

  const calculatedDiscount =
    originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // Preset Switcher
  const handleApplyPreset = (cat: Category) => {
    const preset = CATEGORY_PRESETS[cat];
    setCategory(cat);
    setSubcategory(preset.subcategories[0]);
    setCoverImage(preset.sampleImages[0]);
    setImage2(preset.sampleImages[1] || '');
    setImage3(preset.sampleImages[2] || '');
    setColors(preset.sampleColors);
    setSizes(preset.sampleSizes);
    setFabric(preset.defaultMaterials);
    setFit(preset.defaultFit);
    setDetailsText(preset.defaultDetails.join('\n'));
    setCareText(preset.defaultCare.join('\n'));

    if (cat === 'headphones') {
      setName('Mewak Apex Pro Studio Headphones');
      setSubtitle('Planar Magnetic 40mm Beryllium Drivers • 45h Playtime');
      setPrice(18999);
      setOriginalPrice(24999);
    } else if (cat === 'phones') {
      setName('Mewak Silicon One Flagship Phone');
      setSubtitle('Custom 3nm Neural Processor • Pure Titanium Frame');
      setPrice(84999);
      setOriginalPrice(94999);
    } else if (cat === 'smartwatches') {
      setName('Mewak Chrono Ultra Smartwatch');
      setSubtitle('Sapphire AMOLED • Dual-Band GPS • 14-Day Battery');
      setPrice(32999);
      setOriginalPrice(39999);
    } else {
      setName('Mewak AeroMag 3-in-1 Charging Hub');
      setSubtitle('100W GaN Charging • CNC Solid Aluminum Block');
      setPrice(9999);
      setOriginalPrice(12999);
    }
  };

  // Add Color Variant
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const added: ProductColor = {
      name: newColorName.trim(),
      hex: newColorHex,
      image: newColorImg.trim() || coverImage,
    };
    setColors([...colors, added]);
    setNewColorName('');
    setNewColorImg('');
  };

  const handleRemoveColor = (idx: number) => {
    if (colors.length > 1) {
      setColors(colors.filter((_, i) => i !== idx));
    }
  };

  // Add Size / Storage Variant
  const handleAddSize = () => {
    if (!newSizeName.trim()) return;
    const added: ProductSize = {
      size: newSizeName.trim(),
      inStock: true,
      stockCount: Number(newSizeStock) || 20,
    };
    setSizes([...sizes, added]);
    setNewSizeName('');
  };

  const handleRemoveSize = (idx: number) => {
    if (sizes.length > 1) {
      setSizes(sizes.filter((_, i) => i !== idx));
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Build images array
    const imageList: string[] = [coverImage.trim()].filter(Boolean);
    if (image2.trim()) imageList.push(image2.trim());
    if (image3.trim()) imageList.push(image3.trim());

    // Ensure colors has at least 1 color with image
    const finalColors = colors.map((c, i) => ({
      ...c,
      image: c.image || imageList[i] || imageList[0],
    }));

    const detailsArray = detailsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const careArray = careText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const productPayload: Partial<Product> = {
      name: name.trim(),
      subtitle: subtitle.trim() || 'Next-Gen Silicon Architecture & Precision Engineering',
      category,
      subcategory: subcategory.trim() || 'Hardware Edition',
      price: Number(price) || 9999,
      originalPrice: Number(originalPrice) || Number(price),
      discountPercent: calculatedDiscount,
      occasion,
      isNew,
      isTrending,
      isFeatured,
      images: imageList.length > 0 ? imageList : CATEGORY_PRESETS[category].sampleImages,
      colors: finalColors.length > 0 ? finalColors : CATEGORY_PRESETS[category].sampleColors,
      sizes: sizes.length > 0 ? sizes : CATEGORY_PRESETS[category].sampleSizes,
      fabric: fabric.trim() || CATEGORY_PRESETS[category].defaultMaterials,
      fit: fit.trim() || CATEGORY_PRESETS[category].defaultFit,
      description:
        description.trim() ||
        `${name} pioneers the convergence of cutting-edge silicon architecture and acoustic purity.`,
      details: detailsArray.length > 0 ? detailsArray : CATEGORY_PRESETS[category].defaultDetails,
      care: careArray.length > 0 ? careArray : CATEGORY_PRESETS[category].defaultCare,
      returns: returns.trim(),
      rating: productToEdit?.rating || 4.9,
      reviewCount: productToEdit?.reviewCount || 18,
    };

    onSave(productPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2B1A16]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-[#E5E0D8] w-full max-w-4xl rounded-2xl shadow-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#E5E0D8] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8029] bg-[#9A8029]/10 px-2.5 py-0.5 rounded font-bold">
                {isEditing ? 'EDIT HARDWARE SPEC' : 'CREATE NEW HARDWARE'}
              </span>
              <span className="text-[#DDD2C0]">•</span>
              <span className="text-xs text-[#2B1A16]/60 font-sans">Mewak Engine</span>
            </div>
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#2B1A16] mt-1">
              {isEditing ? `Edit: ${productToEdit?.name}` : 'Provision New Product'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#2B1A16]/50 hover:text-[#2B1A16] rounded-xl hover:bg-[#EFE8DD] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation in Modal */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-[#E5E0D8] bg-[#FAF8F5] overflow-x-auto scrollbar-none flex-nowrap">
          {[
            { id: 'info', label: '1. Identity & Pricing', icon: DollarSign },
            { id: 'images', label: '2. Images & Cover', icon: ImageIcon },
            { id: 'variants', label: '3. Colors & Storage', icon: Palette },
            { id: 'specs', label: '4. Specs & Warranty', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as 'info' | 'images' | 'variants' | 'specs')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                  activeSection === tab.id
                    ? 'border-[#9A8029] text-[#9A8029] bg-white rounded-t-lg'
                    : 'border-transparent text-[#2B1A16]/60 hover:text-[#2B1A16]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-sans">
          {/* Quick Preset Starters */}
          {!isEditing && (
            <div className="bg-[#FBF7F0] border border-[#DDD2C0] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9A8029]">
                <Sparkles className="w-4 h-4" />
                <span>Quick Category Starter Presets:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(['headphones', 'phones', 'smartwatches', 'accessories'] as Category[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleApplyPreset(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      category === cat
                        ? 'bg-[#2B1A16] text-[#EFE8DD] border-[#2B1A16]'
                        : 'bg-white text-[#2B1A16] border-[#DDD2C0] hover:border-[#9A8029]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Identity & Pricing */}
          {activeSection === 'info' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mewak Apex Pro Wireless Headphones"
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1.5">
                    Subtitle / Tech Tagline
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Custom 40mm Beryllium Drivers • 45h Playtime"
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value as Category;
                      setCategory(newCat);
                      setSubcategory(CATEGORY_PRESETS[newCat].subcategories[0]);
                    }}
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs transition-colors"
                  >
                    <option value="headphones">Headphones & Audio</option>
                    <option value="phones">Smartphones</option>
                    <option value="smartwatches">Smartwatches</option>
                    <option value="accessories">Accessories & Audio Gear</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1.5">Subcategory</label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Noise Cancelling"
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1.5">Occasion / Segment</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value as Occasion)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs transition-colors"
                  >
                    <option value="Work">Work / Studio</option>
                    <option value="Gaming">Gaming / Immersion</option>
                    <option value="Fitness">Fitness / Outdoor</option>
                    <option value="Everyday">Everyday / Commute</option>
                  </select>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DDD2C0]">
                  <label className="block font-semibold text-[#2B1A16] mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white border border-[#DDD2C0] rounded-lg px-3 py-2 text-sm font-bold text-[#2B1A16] outline-none font-mono"
                  />
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DDD2C0]">
                  <label className="block font-semibold text-[#2B1A16] mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full bg-white border border-[#DDD2C0] rounded-lg px-3 py-2 text-sm font-bold text-[#2B1A16] outline-none font-mono"
                  />
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DDD2C0] flex flex-col justify-center">
                  <span className="text-[#2B1A16]/70 font-semibold mb-1">Calculated Discount</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-[#2B1A16]">
                      {calculatedDiscount}%
                    </span>
                    {calculatedDiscount > 0 && (
                      <span className="bg-[#B3402F]/15 text-[#B3402F] text-[10px] font-bold px-2 py-0.5 rounded">
                        Active Discount
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#DDD2C0] bg-[#FAF8F5] cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="accent-[#9A8029] w-4 h-4 rounded"
                  />
                  <div>
                    <span className="block font-semibold text-[#2B1A16]">New Arrival Badge</span>
                    <span className="text-[10px] text-[#2B1A16]/60">Highlights as latest tech</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#DDD2C0] bg-[#FAF8F5] cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="accent-[#9A8029] w-4 h-4 rounded"
                  />
                  <div>
                    <span className="block font-semibold text-[#2B1A16]">Trending Tech Grid</span>
                    <span className="text-[10px] text-[#2B1A16]/60">Shown in trending carousels</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#DDD2C0] bg-[#FAF8F5] cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-[#9A8029] w-4 h-4 rounded"
                  />
                  <div>
                    <span className="block font-semibold text-[#2B1A16]">Featured Flagship</span>
                    <span className="text-[10px] text-[#2B1A16]/60">Highlighted on top hero feeds</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Section 2: Images & Cover Preview */}
          {activeSection === 'images' && (
            <div className="space-y-6">
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#DDD2C0]">
                <h4 className="font-serif text-sm font-bold text-[#2B1A16] mb-1">
                  Product Image Links & Instant Live Preview
                </h4>
                <p className="text-[11px] text-[#2B1A16]/60">
                  Paste any public image link (Unsplash, Shopify CDN, Apple, Amazon, Imgur, etc.). The live preview updates immediately and is guaranteed to render on both the product detail page and category feeds.
                </p>
              </div>

              {/* Slot 1: Primary Cover Image */}
              <div className="border border-[#DDD2C0] rounded-xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2B1A16] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9A8029]" />
                    <span>Primary Cover Image URL * (Main Stage & Catalog Card)</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold text-[#9A8029] bg-[#9A8029]/15 px-2 py-0.5 rounded">
                    Required
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="url"
                      required
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/... or any direct image URL"
                      className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs font-mono"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setCoverImage(CATEGORY_PRESETS[category].sampleImages[0])}
                        className="text-[10px] text-[#9A8029] hover:underline font-semibold"
                      >
                        Use Preset Sample Cover
                      </button>
                    </div>
                  </div>

                  {/* Live Preview Box */}
                  <div className="relative w-28 h-28 rounded-xl bg-[#FAF8F5] border-2 border-dashed border-[#DDD2C0] overflow-hidden shrink-0 flex items-center justify-center">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt="Cover Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-[#2B1A16]/40 text-center px-2">No Image</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Slot 2 & Slot 3 Gallery Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Image 2 */}
                <div className="border border-[#DDD2C0] rounded-xl p-4 bg-white space-y-2">
                  <span className="font-semibold text-[#2B1A16] block">Gallery Image 2 (Angle View)</span>
                  <div className="flex gap-3 items-center">
                    <input
                      type="url"
                      value={image2}
                      onChange={(e) => setImage2(e.target.value)}
                      placeholder="Paste secondary image link..."
                      className="flex-1 bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-lg px-3 py-2 text-xs font-mono"
                    />
                    <div className="relative w-16 h-16 rounded-lg bg-[#FAF8F5] border border-[#DDD2C0] overflow-hidden shrink-0 flex items-center justify-center">
                      {image2 ? (
                        <Image src={image2} alt="Preview 2" fill unoptimized className="object-cover" />
                      ) : (
                        <span className="text-[9px] text-[#2B1A16]/40">Empty</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image 3 */}
                <div className="border border-[#DDD2C0] rounded-xl p-4 bg-white space-y-2">
                  <span className="font-semibold text-[#2B1A16] block">Gallery Image 3 (Lifestyle / In Box)</span>
                  <div className="flex gap-3 items-center">
                    <input
                      type="url"
                      value={image3}
                      onChange={(e) => setImage3(e.target.value)}
                      placeholder="Paste tertiary image link..."
                      className="flex-1 bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] rounded-lg px-3 py-2 text-xs font-mono"
                    />
                    <div className="relative w-16 h-16 rounded-lg bg-[#FAF8F5] border border-[#DDD2C0] overflow-hidden shrink-0 flex items-center justify-center">
                      {image3 ? (
                        <Image src={image3} alt="Preview 3" fill unoptimized className="object-cover" />
                      ) : (
                        <span className="text-[9px] text-[#2B1A16]/40">Empty</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Colors & Storage Variants */}
          {activeSection === 'variants' && (
            <div className="space-y-6">
              {/* Colors Manager */}
              <div className="border border-[#DDD2C0] rounded-xl p-5 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#2B1A16]">
                      Color Finishes & Swatches ({colors.length})
                    </h4>
                    <p className="text-[11px] text-[#2B1A16]/60">
                      Configure color names, hex color dots, and specific shade images.
                    </p>
                  </div>
                </div>

                {/* Existing Colors List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {colors.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#DDD2C0] bg-[#FAF8F5]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div>
                          <p className="font-semibold text-[#2B1A16]">{c.name}</p>
                          <p className="text-[10px] text-[#2B1A16]/60 font-mono">{c.hex}</p>
                        </div>
                      </div>

                      {colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(i)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Color Form */}
                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DDD2C0] flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Color Name (e.g. Natural Titanium, Obsidian Black)"
                    className="flex-1 bg-white border border-[#DDD2C0] rounded-lg px-3 py-2 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded border border-[#DDD2C0] cursor-pointer"
                    />
                    <span className="font-mono text-xs">{newColorHex}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Color
                  </button>
                </div>
              </div>

              {/* Sizes / Storage Editions Manager */}
              <div className="border border-[#DDD2C0] rounded-xl p-5 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#2B1A16]">
                      Sizes, Storage & Hardware Editions ({sizes.length})
                    </h4>
                    <p className="text-[11px] text-[#2B1A16]/60">
                      e.g. 256GB / 12GB RAM, 512GB, 45mm Titanium Case, Standard Edition.
                    </p>
                  </div>
                </div>

                {/* Existing Sizes List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sizes.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#DDD2C0] bg-[#FAF8F5]"
                    >
                      <div>
                        <p className="font-semibold text-[#2B1A16]">{s.size}</p>
                        <p className="text-[10px] text-emerald-700 font-mono font-medium">
                          In Stock • {s.stockCount || 20} units available
                        </p>
                      </div>

                      {sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(i)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Size Form */}
                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DDD2C0] flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    placeholder="Edition / Spec Name (e.g. 512GB / 16GB RAM)"
                    className="flex-1 bg-white border border-[#DDD2C0] rounded-lg px-3 py-2 text-xs"
                  />
                  <input
                    type="number"
                    min="1"
                    value={newSizeStock}
                    onChange={(e) => setNewSizeStock(Number(e.target.value))}
                    placeholder="Stock Qty"
                    className="w-24 bg-white border border-[#DDD2C0] rounded-lg px-3 py-2 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="bg-[#2B1A16] hover:bg-[#9A8029] text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Edition
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Specifications & Details */}
          {activeSection === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1.5">
                    Materials & Architecture
                  </label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. Aero-grade Aluminum & Memory Foam Lambskin"
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1.5">
                    Fit, Weight & Ergonomics
                  </label>
                  <input
                    type="text"
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                    placeholder="e.g. Over-Ear Ergonomic Acoustic Seal • 280g"
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1.5">
                  Editorial Brand Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive description of engineering, acoustics, and user experience..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1.5">
                    Key Features Highlights (One bullet per line)
                  </label>
                  <textarea
                    rows={4}
                    value={detailsText}
                    onChange={(e) => setDetailsText(e.target.value)}
                    placeholder="40mm Custom Beryllium Acoustic Drivers&#10;Hybrid ANC cancelling up to 42dB&#10;45 hours battery life"
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1A16] mb-1.5">
                    What&apos;s in the Box & Warranty (One bullet per line)
                  </label>
                  <textarea
                    rows={4}
                    value={careText}
                    onChange={(e) => setCareText(e.target.value)}
                    placeholder="2-Year Official Brand Hardware Warranty&#10;Protective magnetic hard carrying case&#10;Braided fast-charge USB-C cable"
                    className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2B1A16] mb-1.5">
                  Doorstep Evaluation & Return Policy
                </label>
                <input
                  type="text"
                  value={returns}
                  onChange={(e) => setReturns(e.target.value)}
                  placeholder="15-day risk-free home trial with complimentary doorstep replacement"
                  className="w-full bg-[#FAF8F5] border border-[#DDD2C0] focus:border-[#9A8029] focus:bg-white rounded-xl px-3.5 py-2.5 text-[#2B1A16] outline-none text-xs"
                />
              </div>
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between sticky bottom-0 bg-white py-3">
            <div className="flex items-center gap-2">
              {activeSection !== 'info' && (
                <button
                  type="button"
                  onClick={() => {
                    const sections: ('info' | 'images' | 'variants' | 'specs')[] = [
                      'info',
                      'images',
                      'variants',
                      'specs',
                    ];
                    const idx = sections.indexOf(activeSection);
                    if (idx > 0) setActiveSection(sections[idx - 1]);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#DDD2C0] text-[#2B1A16] font-semibold hover:bg-[#FAF8F5]"
                >
                  Back
                </button>
              )}
              {activeSection !== 'specs' && (
                <button
                  type="button"
                  onClick={() => {
                    const sections: ('info' | 'images' | 'variants' | 'specs')[] = [
                      'info',
                      'images',
                      'variants',
                      'specs',
                    ];
                    const idx = sections.indexOf(activeSection);
                    if (idx < sections.length - 1) setActiveSection(sections[idx + 1]);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD2C0] text-[#2B1A16] font-semibold hover:bg-[#EFE8DD]"
                >
                  Next Tab
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#DDD2C0] text-[#2B1A16] font-semibold hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#2B1A16] hover:bg-[#9A8029] text-white font-semibold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                <Check className="w-4 h-4" />
                {isEditing ? 'Save Spec Updates' : 'Add Product to Catalog'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
