import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // This bypasses RLS
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export interface CreateRoundRequest {
    roundId: number;
    contractAddress: string;
    founderAddress: string;
    tokenAddress: string;
    targetAmount: string;
    fundingDeadline: string; // ISO string
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
        deadline: string; // ISO string
    }>;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as CreateRoundRequest;

        // Validate required fields
        if (!body.roundId || !body.contractAddress || !body.founderAddress) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Insert round data
        const { data: roundData, error: roundError } = await supabaseAdmin
            .from('rounds')
            .insert({
                round_id: body.roundId,
                contract_address: body.contractAddress.toLowerCase(),
                founder_address: body.founderAddress.toLowerCase(),
                token_address: body.tokenAddress.toLowerCase(),
                target_amount: body.targetAmount,
                funding_deadline: body.fundingDeadline,
                phase: 'Funding',
                title: body.title,
                description: body.description,
                image_url: body.imageUrl,
                website_url: body.websiteUrl,
                category: body.category,
                total_milestones: body.totalMilestones,
                milestones_completed: 0,
            })
            .select('id')
            .single();

        if (roundError || !roundData) {
            console.error('Round creation error:', roundError);
            return NextResponse.json(
                { success: false, message: `Failed to create round: ${roundError?.message}` },
                { status: 500 }
            );
        }

        const roundDbId = roundData.id as string;

        // Insert milestones
        if (body.milestones && body.milestones.length > 0) {
            const milestoneInserts = body.milestones.map(milestone => ({
                round_id: roundDbId,
                milestone_id: milestone.milestoneId,
                contract_address: body.contractAddress.toLowerCase(),
                title: milestone.title,
                description: milestone.description,
                funding_amount: milestone.fundingAmount,
                deadline: milestone.deadline,
                status: 'Pending' as const,
                votes_for: 0,
                votes_against: 0,
                funds_released: false,
            }));

            const { error: milestonesError } = await supabaseAdmin
                .from('milestones')
                .insert(milestoneInserts);

            if (milestonesError) {
                console.error('Milestones creation error:', milestonesError);
                return NextResponse.json(
                    {
                        success: false,
                        message: `Failed to create milestones: ${milestonesError.message}`,
                    },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            data: { roundId: roundDbId },
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
