import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { FloatingCart } from '@/components/layout/FloatingCart';
import { BackToTop } from '@/components/ui/BackToTop';
import { ChatSupport } from '@/components/ui/ChatSupport';

export const metadata: Metadata = {
  title: {
    default: 'Foodie — Premium Food Delivery',
    template: '%s | Foodie',
  },
  description:
    'Discover and order from the finest restaurants and home kitchens near you. Premium gourmet food delivered fresh to your door.',
  keywords: ['food delivery', 'online food order', 'gourmet food', 'restaurant delivery'],
  openGraph: {
    title: 'Foodie — Premium Food Delivery',
    description: 'Order gourmet food from the best restaurants near you.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('foodie-theme') === 'dark' || (!('foodie-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-bg-primary text-text-primary font-sans antialiased transition-colors duration-300 min-h-screen flex flex-col relative">
        <ThemeProvider>
          <Providers>
            <Header />
            <CartDrawer />
            <main className="flex-1">
              {children}
            </main>
            {/* Footer is hidden on /admin routes */}
            <ConditionalFooter />
            <FloatingCart />
            <BackToTop />
            <ChatSupport />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  borderRadius: '12px',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: { primary: '#FF6B00', secondary: '#fff' },
                },
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
