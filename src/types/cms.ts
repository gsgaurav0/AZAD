export interface HeroValueProp {
  icon: 'headphones' | 'cpu' | 'zap' | 'shield';
  tag: string;
  title: string;
}

export interface HeroSectionConfig {
  enabled: boolean;
  subBadge: string;
  headline: string;
  highlightText: string;
  description: string;
  primaryButtonLabel: string;
  primaryButtonUrl: string;
  secondaryButtonLabel: string;
  secondaryButtonUrl: string;
  backgroundImage: string;
  valueProps: HeroValueProp[];
}

export interface BentoTile {
  id: string;
  title: string;
  categorySlug: string;
  badge: string;
  tagline: string;
  description: string;
  image: string;
  colSpan: number; // 5 or 7
}

export interface BentoSectionConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  tiles: BentoTile[];
}

export interface NewArrivalsSectionConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  buttonLabel: string;
  buttonUrl: string;
  displayCount: number;
  selectionMode: 'auto' | 'manual';
  manualProductIds?: string[];
}

export interface TrendingSectionConfig {
  enabled: boolean;
  badge: string;
  title: string;
  linkText: string;
  linkUrl: string;
  displayCount: number;
  selectionMode: 'auto' | 'manual';
  manualProductIds?: string[];
}

export interface OccasionTabConfig {
  id: string;
  label: string;
  tagline: string;
  occasionKey: string; // 'Work' | 'Fitness' | 'Gaming' | 'Everyday'
}

export interface OccasionsSectionConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  tabs: OccasionTabConfig[];
}

export interface LookPinConfig {
  id: string;
  x: number;
  y: number;
  productId: string;
  productName: string;
  price: number;
  image: string;
}

export interface ShopTheLookSectionConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  lookTitle: string;
  lookImage: string;
  pins: LookPinConfig[];
}

export interface BrandStorySectionConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  quote: string;
  paragraph1: string;
  paragraph2: string;
  image1: string;
  image2: string;
  sealText: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  badge: string;
  message: string;
  linkText: string;
  linkUrl: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  productName: string;
}

export interface TestimonialsSectionConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  items: TestimonialItem[];
}

export interface SocialLinksConfig {
  instagram: string;
  youtube: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  discord: string;
  supportEmail: string;
  supportPhone: string;
}

export interface StorefrontCMS {
  announcement: AnnouncementConfig;
  hero: HeroSectionConfig;
  bento: BentoSectionConfig;
  newArrivals: NewArrivalsSectionConfig;
  trending: TrendingSectionConfig;
  shopByOccasion: OccasionsSectionConfig;
  shopTheLook: ShopTheLookSectionConfig;
  brandStory: BrandStorySectionConfig;
  testimonials: TestimonialsSectionConfig;
  socials: SocialLinksConfig;
}

