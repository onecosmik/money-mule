import type { Metadata } from 'next';

import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import Providers from '@/context/Providers';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'MoneyMule | Invest smarter',
    description: 'Save time and money with MoneyMule, your AI research assistant',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={inter.className}>
                <Providers>{children}</Providers>
                <Toaster />
            </body>
        </html>
    );
}
