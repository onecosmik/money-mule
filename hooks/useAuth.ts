import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth';
import { toast } from 'sonner';

export const useAuth = () => {
    const { ready, user, authenticated } = usePrivy();
    const { wallets } = useWallets();
    const { login } = useLogin();

    // Get the connected wallet - prefer external wallets but accept embedded wallets
    const connectedWallet =
        wallets.find(wallet => wallet.connectorType !== 'embedded') || wallets[0];

    const handleAuthenticate = () => {
        try {
            login();
        } catch (error) {
            toast.error('Authentication failed. Please try again.');
        }
    };

    return {
        ready,
        authenticated,
        connectedWallet,
        handleAuthenticate,
        user,
        wallets,
    };
};
