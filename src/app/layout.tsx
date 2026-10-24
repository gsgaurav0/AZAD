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
  title: 'MewaK | Modern Luxury Fashion & Sartorial Craftsmanship',
  description:
    'Discover timeless couture, Mulberry silks, Neapolitan tailoring, and slow sustainable luxury by MewaK. Handcrafted in India.',
  keywords: [
    'MewaK',
    'luxury fashion',
    'editorial clothing',
    'Mulberry silk dress',
    'Chanderi saree',
    'Italian wool blazer',
    'slow fashion India',
  ],
  openGraph: {
    title: 'MewaK | Modern Luxury Fashion',
    description:
      'Discover timeless silhouettes, noble materials, and artisanal Indian craftsmanship.',
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
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#EFE8DD] text-[#2B1A16] font-sans selection:bg-[#9A8029] selection:text-white pb-14 md:pb-0">
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
