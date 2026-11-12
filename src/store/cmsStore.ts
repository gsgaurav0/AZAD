import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  StorefrontCMS,
  HeroSectionConfig,
  BentoSectionConfig,
  NewArrivalsSectionConfig,
  TrendingSectionConfig,
  OccasionsSectionConfig,
  ShopTheLookSectionConfig,
  BrandStorySectionConfig,
  AnnouncementConfig,
  TestimonialsSectionConfig,
} from '@/types/cms';

export const DEFAULT_CMS_DATA: StorefrontCMS = {
  announcement: {
    enabled: true,
    badge: 'EXCLUSIVE ALLOCATION',
    message: 'Flagship Planar Headphones & 3nm Silicon Devices in stock with 2-Year Official Brand Warranty.',
    linkText: 'Explore Now',
    linkUrl: '/shop',
  },
  hero: {
    enabled: true,
    subBadge: 'Next-Gen Audio & Flagship Silicon 2026',
    headline: 'Architectural Sound. Pure Silicon Mastery.',
    highlightText: 'Pure Silicon',
    description:
      'Engineered with custom beryllium drivers, aerospace Grade 5 titanium, and ultra-low latency wireless architecture. Crafted for those who demand precision.',
    primaryButtonLabel: 'Explore All Gear',
    primaryButtonUrl: '/shop',
    secondaryButtonLabel: 'Audio & Headphones',
    secondaryButtonUrl: '/shop/headphones',
    backgroundImage:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2000&q=85',
    valueProps: [
      { icon: 'headphones', tag: 'ACOUSTICS', title: 'Beryllium & Planar Drivers' },
      { icon: 'cpu', tag: 'PROCESSING', title: 'Snapdragon 8 Gen 3' },
      { icon: 'zap', tag: 'CHARGING', title: '140W GaN Fast Charge' },
      { icon: 'shield', tag: 'MATERIALS', title: 'Aerospace Grade 5 Titanium' },
    ],
  },
  bento: {
    enabled: true,
    eyebrow: 'HARDWARE ARCHITECTURE',
    title: 'Curated Tech Ecosystem',
    description:
      'Explore our defining hardware lines — from audiophile planar acoustic drivers to aerospace titanium flagships and connected horology.',
    tiles: [
      {
        id: 'headphones',
        title: 'Headphones & Audio',
        categorySlug: '/shop/headphones',
        badge: 'ACOUSTIC PURITY',
        tagline: 'SPATIAL ANC & PLANAR',
        description: 'Beryllium drivers, studio planar open-backs, true wireless ANC earbuds & spatial gaming headsets.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        colSpan: 7,
      },
      {
        id: 'phones',
        title: 'Smartphones',
        categorySlug: '/shop/phones',
        badge: 'FLAGSHIP SILICON',
        tagline: 'TITANIUM 5G',
        description: 'Snapdragon 8 Gen 3 flagships, dual-screen foldables, minimalist transparent phones & periscope cameras.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
        colSpan: 5,
      },
      {
        id: 'smartwatches',
        title: 'Smartwatches',
        categorySlug: '/shop/smartwatches',
        badge: 'HOROLOGY',
        tagline: 'TITANIUM & SAPPHIRE',
        description: 'Rugged 49mm titanium dive watches, sapphire AMOLED dials & solar multisport GPS.',
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1000&q=80',
        colSpan: 5,
      },
      {
        id: 'accessories',
        title: 'Tech Accessories',
        categorySlug: '/shop/accessories',
        badge: 'POWER & ECOSYSTEM',
        tagline: 'CHARGING & PROTECTION',
        description: 'MagSafe 3-in-1 desktop docks, 140W GaN chargers, aramid carbon fiber cases & slim magnetic power banks.',
        image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=1200&q=80',
        colSpan: 7,
      },
    ],
  },
  newArrivals: {
    enabled: true,
    eyebrow: 'FRESH OFF THE HARDWARE LAB',
    title: 'Latest Releases',
    buttonLabel: 'View All',
    buttonUrl: '/shop?filter=new',
    displayCount: 10,
    selectionMode: 'auto',
    manualProductIds: [],
  },
  trending: {
    enabled: true,
    badge: 'MOST POPULAR HARDWARE',
    title: 'Trending Tech',
    linkText: 'Explore Catalog',
    linkUrl: '/shop',
    displayCount: 8,
    selectionMode: 'auto',
    manualProductIds: [],
  },
  shopByOccasion: {
    enabled: true,
    eyebrow: 'ENGINEERED FOR YOUR WORKFLOW',
    title: 'Shop by Lifestyle & Setup',
    tabs: [
      {
        id: 'work',
        label: 'Work & Studio',
        tagline: 'Planar studio headphones, dual-screen foldables, GaN desktop power hubs & connected smartwatches',
        occasionKey: 'Work',
      },
      {
        id: 'fitness',
        label: 'Sports & Adventure',
        tagline: 'Titanium rugged GPS smartwatches, sweatproof ANC earbuds & slim magnetic kickstand power banks',
        occasionKey: 'Fitness',
      },
      {
        id: 'gaming',
        label: 'Gaming & Esports',
        tagline: 'Ultra-low latency wireless spatial headsets, cooling gel ear cushions & broadcast-grade mics',
        occasionKey: 'Gaming',
      },
      {
        id: 'everyday',
        label: 'Daily Flagships',
        tagline: 'Aerospace Grade 5 titanium 200MP smartphones, forged carbon fiber cases & minimal compact form factors',
        occasionKey: 'Everyday',
      },
    ],
  },
  shopTheLook: {
    enabled: true,
    eyebrow: 'ACOUSTIC & DESK STAGE',
    title: 'The Executive Audio & Silicon Workspace',
    description: 'Explore precision spatial acoustic audio, planar drivers, and titanium hardware integrated into a monolithic executive workstation.',
    lookTitle: 'Executive Minimalist Audio & Silicon Suite',
    lookImage: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1600&q=80',
    pins: [
      {
        id: 'pin-1',
        x: 42,
        y: 44,
        productId: 'mewak-apex-pro',
        productName: 'Apex Studio Planar ANC',
        price: 34999,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'pin-2',
        x: 65,
        y: 56,
        productId: 'mewak-titan-ultra',
        productName: 'Titanium One 5G Smartphone',
        price: 84999,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'pin-3',
        x: 25,
        y: 68,
        productId: 'mewak-aeromag-3in1',
        productName: 'MagDock 3-in-1 GaN Power Station',
        price: 9999,
        image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  brandStory: {
    enabled: true,
    eyebrow: 'ENGINEERING PHILOSOPHY',
    title: 'The Convergence of Silicon & Acoustic Mastery',
    quote: 'True technological luxury does not distract; it elevates your human potential through uncompromising acoustic and tactile perfection.',
    paragraph1: 'Born to challenge the disposable nature of modern consumer electronics, Mewak engineers devices crafted from enduring materials — aerospace Grade 5 titanium, hand-matched walnut wood, sapphire crystal glass, and bulletproof 1500D aramid fibers.',
    paragraph2: 'By pairing custom beryllium diaphragms and planar transducers with flagship Snapdragon silicon and intelligent GaN thermal architectures, we deliver hardware calibrated for years of peak performance.',
    image1: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    image2: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    sealText: 'MEWAK',
  },
  testimonials: {
    enabled: true,
    eyebrow: 'VERIFIED PATRON REVIEWS',
    title: 'Voices of Sonic & Silicon Precision',
    description: 'Real feedback from sound engineers, tech executives, and audiophiles who trust Mewak daily.',
    items: [
      {
        id: 'rev-1',
        quote: 'The low-end acoustic response of the planar headphones is unmatched. Coupled with the zero-latency dock, it completely anchored my recording studio workflow.',
        author: 'Arjun Vardhan',
        role: 'Mastering Audio Engineer',
        company: 'SonicLab Studios',
        rating: 5,
        productName: 'Apex Pro Studio ANC',
      },
      {
        id: 'rev-2',
        quote: 'Grade 5 titanium chassis feels indestructible yet featherlight. Cleanest Android experience on the market with thermal stability that never throttles.',
        author: 'Devika Sengupta',
        role: 'Hardware Architect',
        company: 'Vanguard Systems',
        rating: 5,
        productName: 'Titanium One 5G',
      },
      {
        id: 'rev-3',
        quote: 'The sapphire display on the Chrono Ultra has survived rugged Himalayan trails without a scratch. Battery life is genuinely 14 days.',
        author: 'Marcus Vance',
        role: 'High-Altitude Climber',
        company: 'Alpine Expeditions',
        rating: 5,
        productName: 'Chrono Ultra Watch',
      },
    ],
  },
  socials: {
    instagram: 'https://instagram.com/mewak_electronics',
    youtube: 'https://youtube.com/@mewak_audio',
    twitter: 'https://x.com/mewak_tech',
    facebook: 'https://facebook.com/mewakelectronics',
    linkedin: 'https://linkedin.com/company/mewak',
    discord: 'https://discord.gg/mewak',
    supportEmail: 'concierge@mewak.com',
    supportPhone: '+91 80 4920 1800',
  },
};

const STORAGE_KEY = 'mewak_storefront_cms';
const SYNC_EVENT = 'mewak_cms_sync';

function notifyCMSChange() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mewak_cms_channel');
      channel.postMessage({ type: 'CMS_UPDATED', timestamp: Date.now() });
      channel.close();
    }
  } catch (err) {
    console.warn('Cross-tab CMS broadcast error:', err);
  }
}

interface CMSState {
  cms: StorefrontCMS;

  // Granular update actions
  updateAnnouncement: (updates: Partial<AnnouncementConfig>) => void;
  updateHero: (updates: Partial<HeroSectionConfig>) => void;
  updateBento: (updates: Partial<BentoSectionConfig>) => void;
  updateBentoTile: (tileId: string, updates: Partial<BentoSectionConfig['tiles'][0]>) => void;
  updateNewArrivals: (updates: Partial<NewArrivalsSectionConfig>) => void;
  updateTrending: (updates: Partial<TrendingSectionConfig>) => void;
  updateShopByOccasion: (updates: Partial<OccasionsSectionConfig>) => void;
  updateOccasionTab: (tabId: string, updates: Partial<OccasionsSectionConfig['tabs'][0]>) => void;
  updateShopTheLook: (updates: Partial<ShopTheLookSectionConfig>) => void;
  updateLookPin: (pinId: string, updates: Partial<ShopTheLookSectionConfig['pins'][0]>) => void;
  updateBrandStory: (updates: Partial<BrandStorySectionConfig>) => void;
  updateTestimonials: (updates: Partial<TestimonialsSectionConfig>) => void;
  updateSocials: (updates: Partial<import('@/types/cms').SocialLinksConfig>) => void;

  // Master toggles
  toggleSection: (sectionKey: keyof StorefrontCMS, enabled?: boolean) => void;

  // Bulk actions
  setAllCMS: (cms: StorefrontCMS) => void;
  resetToDefaults: () => void;
}

export const useCMSStore = create<CMSState>()(
  persist(
    (set) => ({
      cms: DEFAULT_CMS_DATA,

      updateAnnouncement: (updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            announcement: { ...state.cms.announcement, ...updates },
          },
        }));
        notifyCMSChange();
      },

      updateHero: (updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            hero: { ...state.cms.hero, ...updates },
          },
        }));
        notifyCMSChange();
      },

      updateBento: (updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            bento: { ...state.cms.bento, ...updates },
          },
        }));
        notifyCMSChange();
      },

      updateBentoTile: (tileId, updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            bento: {
              ...state.cms.bento,
              tiles: state.cms.bento.tiles.map((t) => (t.id === tileId ? { ...t, ...updates } : t)),
            },
          },
        }));
        notifyCMSChange();
      },

      updateNewArrivals: (updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            newArrivals: { ...state.cms.newArrivals, ...updates },
          },
        }));
        notifyCMSChange();
      },

      updateTrending: (updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            trending: { ...state.cms.trending, ...updates },
          },
        }));
        notifyCMSChange();
      },

      updateShopByOccasion: (updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            shopByOccasion: { ...state.cms.shopByOccasion, ...updates },
          },
        }));
        notifyCMSChange();
      },

      updateOccasionTab: (tabId, updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            shopByOccasion: {
              ...state.cms.shopByOccasion,
              tabs: state.cms.shopByOccasion.tabs.map((tab) =>
                tab.id === tabId ? { ...tab, ...updates } : tab
              ),
            },
          },
        }));
        notifyCMSChange();
      },

      updateShopTheLook: (updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            shopTheLook: { ...state.cms.shopTheLook, ...updates },
          },
        }));
        notifyCMSChange();
      },

      updateLookPin: (pinId, updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            shopTheLook: {
              ...state.cms.shopTheLook,
              pins: state.cms.shopTheLook.pins.map((pin) =>
                pin.id === pinId ? { ...pin, ...updates } : pin
              ),
            },
          },
        }));
        notifyCMSChange();
      },

      updateBrandStory: (updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            brandStory: { ...state.cms.brandStory, ...updates },
          },
        }));
        notifyCMSChange();
      },

      updateTestimonials: (updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            testimonials: { ...state.cms.testimonials, ...updates },
          },
        }));
        notifyCMSChange();
      },

      updateSocials: (updates) => {
        set((state) => ({
          cms: {
            ...state.cms,
            socials: { ...state.cms.socials, ...updates },
          },
        }));
        notifyCMSChange();
      },

      toggleSection: (sectionKey, enabled) => {
        set((state) => {
          const current = state.cms[sectionKey] as { enabled: boolean };
          const nextVal = enabled !== undefined ? enabled : !current.enabled;
          return {
            cms: {
              ...state.cms,
              [sectionKey]: { ...current, enabled: nextVal },
            },
          };
        });
        notifyCMSChange();
      },

      setAllCMS: (newCMS) => {
        set({ cms: newCMS });
        notifyCMSChange();
      },

      resetToDefaults: () => {
        set({ cms: DEFAULT_CMS_DATA });
        notifyCMSChange();
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      useCMSStore.persist.rehydrate();
    }
  });

  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('mewak_cms_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'CMS_UPDATED') {
          useCMSStore.persist.rehydrate();
        }
      };
    } catch {
      // Ignore
    }
  }

  window.addEventListener(SYNC_EVENT, () => {
    useCMSStore.persist.rehydrate();
  });
}

