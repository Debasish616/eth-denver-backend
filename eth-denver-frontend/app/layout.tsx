import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/navbar';
import { WalletProvider } from '@/context/WalletContext';
import { HedgingProvider } from '@/context/HedgingContext';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NexusArb | AI-Powered Arbitrage & Staking Platform',
  description: 'Automated AI Arbitrage & Yield on Autopilot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>NexusArb | AI-Powered Arbitrage &amp; Staking Platform</title>
        <meta name="description" content="Automated AI Arbitrage &amp; Yield on Autopilot" />
      </head>
      <body className={cn("dark")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <WalletProvider>
            <HedgingProvider>
              <div className="min-h-screen bg-gradient-to-br from-background/90 via-background to-background/80 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                <Navbar />
                <main>{children}</main>
              </div>
            </HedgingProvider>
          </WalletProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}