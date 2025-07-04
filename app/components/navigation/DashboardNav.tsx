'use client';

import { BarChart3, Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function DashboardNav() {
    return (
        <nav className='bg-white border-b border-gray-200 px-4 py-3'>
            <div className='container mx-auto flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <BarChart3 className='h-6 w-6 text-green-600' />
                    <span className='font-semibold text-gray-900'>Investment Dashboard</span>
                </div>

                <div className='flex items-center gap-4'>
                    <Link href='/'>
                        <Button variant='outline' size='sm' className='flex items-center gap-2'>
                            <Home className='h-4 w-4' />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
