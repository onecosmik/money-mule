'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: Readonly<MainLayoutProps>) {
    return (
        <div className='min-h-screen overflow-x-hidden overflow-y-hidden'>
            <AnimatePresence mode='wait'>
                <motion.main
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.main>
            </AnimatePresence>
        </div>
    );
}
