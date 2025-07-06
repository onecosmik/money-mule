import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for faucet validation
export const faucetHelpers = {
    /**
     * Check if a wallet can make a faucet request
     * @param address - Wallet address
     * @returns Promise<boolean> - Whether the wallet can make a request
     */
    async canMakeFaucetRequest(address: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('wallets')
            .select('last_faucet_request')
            .eq('address', address)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking faucet request:', error);
            return false;
        }

        if (!data?.last_faucet_request) {
            return true;
        }

        const lastRequest = new Date(data.last_faucet_request as string);
        const now = new Date();
        const hoursSinceLastRequest = (now.getTime() - lastRequest.getTime()) / (1000 * 60 * 60);

        // Allow faucet request if more than 24 hours have passed
        return hoursSinceLastRequest >= 24;
    },

    /**
     * Record a faucet request
     * @param address - Wallet address
     * @returns Promise<void>
     */
    async recordFaucetRequest(address: string): Promise<void> {
        const { error } = await supabase.from('wallets').upsert(
            {
                address,
                last_faucet_request: new Date().toISOString(),
                total_faucet_requests: 1,
            },
            {
                onConflict: 'address',
            }
        );

        if (error) {
            console.error('Error recording faucet request:', error);
            throw error;
        }
    },

    /**
     * Get wallet faucet stats
     * @param address - Wallet address
     * @returns Promise<{total_requests: number, last_request: string | null}>
     */
    async getWalletStats(address: string) {
        const { data, error } = await supabase
            .from('wallets')
            .select('total_faucet_requests, last_faucet_request')
            .eq('address', address)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error getting wallet stats:', error);
            return { total_requests: 0, last_request: null };
        }

        return {
            total_requests: (data?.total_faucet_requests as number) || 0,
            last_request: (data?.last_faucet_request as string) || null,
        };
    },
};
