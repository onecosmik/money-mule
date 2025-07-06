'use client';

import { useConnectWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { FileText, Heart, LogOut, TrendingUp, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';

// Helper function to format wallet address
const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}***${address.slice(-4)}`;
};

function WalletButton() {
    const { wallets } = useWallets();
    const { connectWallet } = useConnectWallet({
        onSuccess: ({ wallet }) => {
            console.log('Wallet connected:', wallet);
        },
        onError: error => {
            console.log('Connection error:', error);
        },
    });

    const handleConnectWallet = useCallback(() => {
        if (connectWallet && typeof connectWallet === 'function') {
            connectWallet({
                walletChainType: 'ethereum-only',
            });
        }
    }, [connectWallet]);

    // Get the first connected wallet
    const connectedWallet = wallets.find(wallet => wallet.connectorType !== 'embedded');

    if (connectedWallet) {
        return (
            <Button variant='outline' size='sm' className='flex items-center gap-2'>
                <Wallet className='h-4 w-4' />
                {formatAddress(connectedWallet.address)}
            </Button>
        );
    }

    return (
        <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-2'
            onClick={handleConnectWallet}
        >
            <Wallet className='h-4 w-4' />
            Connect Wallet
        </Button>
    );
}

export function DashboardNav() {
    const pathname = usePathname();
    const { ready } = usePrivy();

    // Don't render the component until Privy is ready
    if (!ready) {
        return (
            <nav className='bg-white border-b border-gray-200 px-4 py-3'>
                <div className='container mx-auto flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <Image
                            src='https://files.invicta.capital/u/mule_1260.svg'
                            alt='Money Mule Logo'
                            width={24}
                            height={24}
                        />
                        <span className='font-semibold text-gray-900'>Money Mule</span>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='animate-pulse bg-gray-200 h-8 w-32 rounded' />
                    </div>
                </div>
            </nav>
        );
    }

    // Only render the main component when Privy is ready
    return <DashboardNavContent pathname={pathname} />;
}

function DashboardNavContent({ pathname }: { pathname: string }) {
    return (
        <nav className='bg-white border-b border-gray-200 px-4 py-3'>
            <div className='container mx-auto flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <Image
                        src='https://files.invicta.capital/u/mule_1260.svg'
                        alt='Money Mule Logo'
                        width={24}
                        height={24}
                    />
                    <span className='font-semibold text-gray-900'>Money Mule</span>
                </div>

                <div className='flex items-center gap-4'>
                    <Link href='/dashboard'>
                        <Button
                            variant={pathname === '/dashboard' ? 'default' : 'outline'}
                            size='sm'
                            className='flex items-center gap-2'
                        >
                            <TrendingUp className='h-4 w-4' />
                            Decks / WhitePapers
                        </Button>
                    </Link>

                    <Link href='/dashboard/documents'>
                        <Button
                            variant={pathname === '/dashboard/documents' ? 'default' : 'outline'}
                            size='sm'
                            className='flex items-center gap-2'
                        >
                            <FileText className='h-4 w-4' />
                            Documents
                        </Button>
                    </Link>

                    <Link href='/dashboard/projects'>
                        <Button
                            variant={pathname === '/dashboard/projects' ? 'default' : 'outline'}
                            size='sm'
                            className='flex items-center gap-2'
                        >
                            <Heart className='h-4 w-4' />
                            Fund projects
                        </Button>
                    </Link>

                    <WalletButton />

                    <Link href='/'>
                        <Button variant='ghost' size='sm' className='flex items-center gap-2'>
                            <LogOut className='h-4 w-4' />
                            Logout
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
