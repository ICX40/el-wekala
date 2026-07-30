import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import CartProvider from "@/components/CartProvider";
import { Toaster } from "react-hot-toast";
import NextTopLoader from 'nextjs-toploader';

const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "El-Wekala | الوكالة",
  description: "منصتك الأولى للتسوق الإلكتروني - أصلية 100%",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} flex flex-col min-h-screen bg-(--background) text-(--foreground)`}>
        
        {/* Top Progress Bar optimized for a more realistic network speed feel */}
        <NextTopLoader
          color="#2563EB"
          initialPosition={0.05}
          crawlSpeed={400}
          height={4}
          crawl={true}
          showSpinner={false}
          easing="ease-out"
          speed={300}
          shadow="0 0 10px #2563EB,0 0 5px #2563EB"
        />

        <AuthProvider>
          <CartProvider>
            
            {/* Toast Notifications Provider */}
            <Toaster 
              position="top-center" 
              reverseOrder={false} 
              toastOptions={{
                duration: 4000,
                style: {
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  padding: '16px',
                  color: '#1e293b',
                },
                success: {
                  style: {
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#047857',
                  },
                },
                error: {
                  style: {
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#be123c',
                  },
                },
              }}
            />
            
            {/* Main Navigation Bar */}
            <Navbar />
            
            {/* Dynamic Page Content */}
            <main className="grow w-full">
              {children}
            </main>
            
            {/* Footer applied globally */}
            <Footer />
            
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}