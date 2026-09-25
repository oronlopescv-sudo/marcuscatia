import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { PublicFloatingWidgets } from '@/components/PublicFloatingWidgets';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: 'Catia Cooking Mindelo | Authentic Cape Verdean Cooking Classes',
  description: 'Authentic Cape Verdean cooking classes and market tours in Mindelo, São Vicente, Cape Verde. Learn traditional recipes with Chef Cátia.',
  openGraph: {
    title: 'Catia Cooking Mindelo | Authentic Cape Verdean Cooking Classes',
    description: 'Authentic Cape Verdean cooking classes and market tours in Mindelo, São Vicente, Cape Verde. Learn traditional recipes with Chef Cátia.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Catia Cooking Mindelo' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catia Cooking Mindelo | Authentic Cape Verdean Cooking Classes',
    description: 'Authentic Cape Verdean cooking classes and market tours in Mindelo, São Vicente, Cape Verde. Learn traditional recipes with Chef Cátia.',
    images: ['/og-image.png']
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
        <PublicFloatingWidgets />
      </body>
    </html>
  );
}
