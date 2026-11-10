import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import CartDrawer from '@/components/cart/CartDrawer';
import QuickViewModal from '@/components/product/QuickViewModal';
import SizeGuideModal from '@/components/product/SizeGuideModal';
import LoginModal from '@/components/auth/LoginModal';
import ToastContainer from '@/components/common/ToastContainer';
import FloatingWhatsApp from '@/components/common/FloatingWhatsApp';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AZAD | Next-Gen Electronics, Headphones & Flagship Devices',
  description:
    'Discover planar audio headphones, titanium 5G smartphones, sapphire smartwatches & GaN power ecosystems by AZAD.',
  keywords: [
    'AZAD',
    'AZAD electronics',
    'wireless headphones',
    'noise cancelling',
    'flagship smartphone',
    'smartwatch',
    'titanium watch',
    'GaN charger',
    'premium audio India',
  ],
  openGraph: {
    title: 'AZAD | Next-Gen Electronics & Premium Audio',
    description:
      'Engineered with planar magnetic drivers, titanium silicon, and uncompromising hardware craft.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#EFE8DD] text-[#2B1A16] font-sans selection:bg-[#9A8029] selection:text-white pb-14 md:pb-0"
      >
        <AnnouncementBar />
        <Header />
        
        <main className="flex-1">
          {children}
        </main>

        <Footer />
        <MobileBottomNav />

        {/* Global Overlays & Modals */}
        <CartDrawer />
        <QuickViewModal />
        <SizeGuideModal />
        <LoginModal />
        <ToastContainer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
