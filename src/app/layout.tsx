import type { Metadata } from 'next';
import './globals.css';
import AutoLogoutListener from '@/components/AutoLogoutListener';

export const metadata: Metadata = {
  title: 'GLITCH - 1.0 | 24hrs National Level Hackathon',
  description:
    'GLITCH - 1.0 is a premier 24hrs National Level Hackathon bringing together top engineering talent, developers, and visionaries to compete for nationwide recognition and grand prizes.',
  keywords: [
    'Hackathon',
    'GLITCH 1.0',
    'National Level Hackathon',
    'Coding Competition',
    'Student Hackathon',
    'Tech Competition',
  ],
  authors: [{ name: 'GLITCH Organizing Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased text-slate-900 font-sans selection:bg-[#E43D12] selection:text-white bg-cyber-grid min-h-screen" suppressHydrationWarning>
        <AutoLogoutListener />
        {children}
      </body>
    </html>
  );
}
