import type {Metadata} from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles
import { WhatsAppButton } from '@/components/WhatsAppButton';

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: 'Catia Cooking Mindelo | Authentic Cape Verdean Cooking Classes',
  description: 'Authentic Cape Verdean cooking classes and market tours in Mindelo, São Vicente, Cape Verde. Learn traditional recipes with Chef Cátia.',
  openGraph: {
    title: 'Catia Cooking Mindelo | Authentic Cape Verdean Cooking Classes',
    description: 'Authentic Cape Verdean cooking classes and market tours in Mindelo, São Vicente, Cape Verde. Learn traditional recipes with Chef Cátia.',
    type: 'website',
    images: [{ url: '/logo.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catia Cooking Mindelo | Authentic Cape Verdean Cooking Classes',
    description: 'Authentic Cape Verdean cooking classes and market tours in Mindelo, São Vicente, Cape Verde. Learn traditional recipes with Chef Cátia.',
    images: ['/logo.png']
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${playfairDisplay.variable}`}>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
