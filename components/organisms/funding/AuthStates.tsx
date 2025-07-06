import { AlertCircle, Wallet } from 'lucide-react';

import { DashboardNav } from '@/components/organisms/navigation/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthStateProps {
    onAuthenticate: () => void;
}

export const LoadingState = () => (
    <div className='min-h-screen bg-green-50'>
        <DashboardNav />
        <div className='max-w-5xl mx-auto py-16 px-4 text-center'>
            <div className='animate-pulse'>
                <div className='h-8 bg-gray-200 rounded w-64 mx-auto mb-4' />
                <div className='h-4 bg-gray-200 rounded w-48 mx-auto' />
            </div>
        </div>
    </div>
);

export const NotAuthenticatedState = ({ onAuthenticate }: AuthStateProps) => (
    <div className='min-h-screen bg-green-50'>
        <DashboardNav />
        <div className='max-w-5xl mx-auto py-16 px-4 text-center'>
            <Card className='bg-white shadow-lg border-yellow-200'>
                <CardHeader className='bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-lg'>
                    <CardTitle className='text-2xl font-bold flex items-center gap-2 justify-center'>
                        <Wallet className='h-6 w-6' />
                        Authentication Required
                    </CardTitle>
                </CardHeader>
                <CardContent className='p-8'>
                    <div className='flex flex-col items-center gap-6'>
                        <AlertCircle className='h-16 w-16 text-yellow-500' />
                        <div className='text-center'>
                            <h3 className='text-xl font-semibold mb-2'>
                                Please Authenticate with Privy
                            </h3>
                            <p className='text-gray-600 mb-6'>
                                You need to authenticate with Privy to access this feature.
                            </p>
                        </div>
                        <Button
                            onClick={onAuthenticate}
                            size='lg'
                            className='bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg font-semibold'
                        >
                            Authenticate / Connect Wallet
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);

export const NoWalletState = ({ onAuthenticate }: AuthStateProps) => (
    <div className='min-h-screen bg-green-50'>
        <DashboardNav />
        <div className='max-w-5xl mx-auto py-16 px-4 text-center'>
            <Card className='bg-white shadow-lg border-yellow-200'>
                <CardHeader className='bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-lg'>
                    <CardTitle className='text-2xl font-bold flex items-center gap-2 justify-center'>
                        <Wallet className='h-6 w-6' />
                        Wallet Connection Required
                    </CardTitle>
                </CardHeader>
                <CardContent className='p-8'>
                    <div className='flex flex-col items-center gap-6'>
                        <AlertCircle className='h-16 w-16 text-yellow-500' />
                        <div className='text-center'>
                            <h3 className='text-xl font-semibold mb-2'>No Wallet Detected</h3>
                            <p className='text-gray-600 mb-6'>
                                You&apos;re authenticated but no wallet is connected.
                            </p>
                        </div>
                        <Button
                            onClick={onAuthenticate}
                            size='lg'
                            className='bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg font-semibold'
                        >
                            Authenticate / Connect Wallet
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);
