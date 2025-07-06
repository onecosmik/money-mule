import { supabase } from './supabase';

// API Response types
interface ApiResponse {
    success: boolean;
    message?: string;
    data?: {
        roundId: string;
    };
}

// Database types matching the schema
export interface RoundData {
    id?: string;
    round_id: number;
    contract_address: string;
    founder_address: string;
    token_address: string;
    target_amount: string;
    current_amount?: string;
    funding_deadline: string;
    phase?: 'Funding' | 'Execution' | 'Completed' | 'Cancelled';
    created_at?: string;
    updated_at?: string;

    // Project metadata
    title: string;
    description?: string;
    image_url?: string;
    website_url?: string;
    category?: string;

    // Contract state
    total_milestones: number;
    milestones_completed?: number;
}

export interface MilestoneData {
    id?: string;
    round_id: string;
    milestone_id: number;
    contract_address: string;
    title: string;
    description: string;
    funding_amount: string;
    deadline: string;
    status?: 'Pending' | 'Active' | 'Approved' | 'Rejected' | 'Completed';
    votes_for?: number;
    votes_against?: number;
    voting_start_time?: string;
    completed_at?: string;
    funds_released?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface InvestmentData {
    id?: string;
    round_id: string;
    investor_address: string;
    amount: string;
    transaction_hash?: string;
    created_at?: string;
}

export interface InvestmentWithRound extends InvestmentData {
    rounds: RoundData;
}

export interface CreateRoundParams {
    roundId: number;
    contractAddress: string;
    founderAddress: string;
    tokenAddress: string;
    targetAmount: string;
    fundingDeadline: Date;
    title: string;
    description?: string;
    imageUrl?: string;
    websiteUrl?: string;
    category?: string;
    totalMilestones: number;
    milestones: Array<{
        milestoneId: number;
        title: string;
        description: string;
        fundingAmount: string;
        deadline: Date;
    }>;
}

/**
 * Create a new funding round using the API endpoint (bypasses RLS)
 */
export async function createRound(params: CreateRoundParams): Promise<string> {
    try {
        const response = await fetch('/api/rounds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roundId: params.roundId,
                contractAddress: params.contractAddress,
                founderAddress: params.founderAddress,
                tokenAddress: params.tokenAddress,
                targetAmount: params.targetAmount,
                fundingDeadline: params.fundingDeadline.toISOString(),
                title: params.title,
                description: params.description,
                imageUrl: params.imageUrl,
                websiteUrl: params.websiteUrl,
                category: params.category,
                totalMilestones: params.totalMilestones,
                milestones: params.milestones.map(milestone => ({
                    milestoneId: milestone.milestoneId,
                    title: milestone.title,
                    description: milestone.description,
                    fundingAmount: milestone.fundingAmount,
                    deadline: milestone.deadline.toISOString(),
                })),
            }),
        });

        if (!response.ok) {
            const errorData = (await response.json()) as ApiResponse;
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = (await response.json()) as ApiResponse;

        if (!result.success) {
            throw new Error(result.message || 'Failed to create round');
        }

        if (!result.data?.roundId) {
            throw new Error('No round ID returned from API');
        }

        return result.data.roundId;
    } catch (error) {
        console.error('Error creating round via API:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to create round: ${error.message}`);
        }
        throw new Error('Failed to create round: Unknown error');
    }
}

/**
 * Get all rounds
 */
export async function getRounds(limit = 50, offset = 0): Promise<RoundData[]> {
    const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        throw new Error(`Failed to fetch rounds: ${error.message}`);
    }

    return (data as RoundData[]) || [];
}

/**
 * Get rounds by founder address
 */
export async function getRoundsByFounder(founderAddress: string): Promise<RoundData[]> {
    const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('founder_address', founderAddress.toLowerCase())
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch founder rounds: ${error.message}`);
    }

    return (data as RoundData[]) || [];
}

/**
 * Get a specific round by ID
 */
export async function getRoundById(roundId: string): Promise<RoundData | null> {
    const result = await supabase.from('rounds').select('*').eq('id', roundId).single();

    if (result.error) {
        if (result.error.code === 'PGRST116') {
            return null; // Not found
        }
        throw new Error(`Failed to fetch round: ${result.error.message}`);
    }

    return result.data ? (result.data as RoundData) : null;
}

/**
 * Get a specific round by contract address
 */
export async function getRoundByContract(contractAddress: string): Promise<RoundData | null> {
    const result = await supabase
        .from('rounds')
        .select('*')
        .eq('contract_address', contractAddress.toLowerCase())
        .single();

    if (result.error) {
        if (result.error.code === 'PGRST116') {
            return null; // Not found
        }
        throw new Error(`Failed to fetch round: ${result.error.message}`);
    }

    return result.data ? (result.data as RoundData) : null;
}

/**
 * Get milestones for a specific round
 */
export async function getMilestonesByRound(roundId: string): Promise<MilestoneData[]> {
    const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('round_id', roundId)
        .order('milestone_id', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch milestones: ${error.message}`);
    }

    return (data as MilestoneData[]) || [];
}

/**
 * Update round phase
 */
export async function updateRoundPhase(
    roundId: string,
    phase: 'Funding' | 'Execution' | 'Completed' | 'Cancelled'
): Promise<void> {
    const { error } = await supabase
        .from('rounds')
        .update({
            phase,
            updated_at: new Date().toISOString(),
        })
        .eq('id', roundId);

    if (error) {
        throw new Error(`Failed to update round phase: ${error.message}`);
    }
}

/**
 * Update round current amount
 */
export async function updateRoundCurrentAmount(
    roundId: string,
    currentAmount: string
): Promise<void> {
    const { error } = await supabase
        .from('rounds')
        .update({
            current_amount: currentAmount,
            updated_at: new Date().toISOString(),
        })
        .eq('id', roundId);

    if (error) {
        throw new Error(`Failed to update round amount: ${error.message}`);
    }
}

/**
 * Update milestone status
 */
export async function updateMilestoneStatus(
    milestoneId: string,
    status: 'Pending' | 'Active' | 'Approved' | 'Rejected' | 'Completed',
    additionalData?: Partial<MilestoneData>
): Promise<void> {
    const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData,
    };

    const { error } = await supabase.from('milestones').update(updateData).eq('id', milestoneId);

    if (error) {
        throw new Error(`Failed to update milestone status: ${error.message}`);
    }
}

/**
 * Record an investment
 */
export async function recordInvestment(
    roundId: string,
    investorAddress: string,
    amount: string,
    transactionHash?: string
): Promise<void> {
    const { error } = await supabase.from('investments').upsert(
        {
            round_id: roundId,
            investor_address: investorAddress.toLowerCase(),
            amount,
            transaction_hash: transactionHash,
        },
        {
            onConflict: 'round_id,investor_address',
        }
    );

    if (error) {
        throw new Error(`Failed to record investment: ${error.message}`);
    }
}

/**
 * Get investments for a specific round
 */
export async function getInvestmentsByRound(roundId: string): Promise<InvestmentData[]> {
    const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('round_id', roundId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch investments: ${error.message}`);
    }

    return (data as InvestmentData[]) || [];
}

/**
 * Get investments by investor address
 */
export async function getInvestmentsByInvestor(
    investorAddress: string
): Promise<InvestmentWithRound[]> {
    const { data, error } = await supabase
        .from('investments')
        .select('*, rounds(*)')
        .eq('investor_address', investorAddress.toLowerCase())
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch investor investments: ${error.message}`);
    }

    return (data as InvestmentWithRound[]) || [];
}
