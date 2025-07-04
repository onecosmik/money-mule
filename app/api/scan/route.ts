import { NextRequest, NextResponse } from 'next/server';

interface ScanRequest {
    action: 'start' | 'status' | 'stop';
    projectId?: string;
}

interface ScanResult {
    id: string;
    status: 'scanning' | 'completed' | 'failed';
    progress: number;
    riskScore: number;
    recommendations: string[];
    timestamp: string;
}

// Mock scan results
const mockScanResults: ScanResult[] = [
    {
        id: 'scan-001',
        status: 'completed',
        progress: 100,
        riskScore: 23,
        recommendations: [
            'Strong founding team with relevant experience',
            'Clear market opportunity in growing sector',
            'Solid financial projections with realistic assumptions',
            'Good product-market fit indicators',
        ],
        timestamp: new Date().toISOString(),
    },
    {
        id: 'scan-002',
        status: 'completed',
        progress: 100,
        riskScore: 67,
        recommendations: [
            'High competition in target market',
            'Team lacks industry-specific experience',
            'Financial projections appear optimistic',
            'Consider additional due diligence on market size',
        ],
        timestamp: new Date().toISOString(),
    },
];

export async function POST(request: NextRequest) {
    try {
        const body: ScanRequest = await request.json();

        if (body.action === 'start') {
            // Simulate scan start
            const scanId = `scan-${Date.now()}`;

            // Simulate processing delay
            await new Promise<void>((resolve: () => void) => {
                setTimeout(() => resolve(), 1000);
            });

            return NextResponse.json({
                success: true,
                scanId,
                message: 'Scan started successfully',
                estimatedDuration: '2-3 minutes',
            });
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Invalid action',
            },
            { status: 400 }
        );
    } catch (error) {
        console.error('Scan API error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const scanId = searchParams.get('scanId');

        if (scanId) {
            // Return specific scan result
            const result = await Promise.resolve(mockScanResults.find(r => r.id === scanId));

            if (result) {
                return NextResponse.json({
                    success: true,
                    result,
                });
            }
            return NextResponse.json(
                {
                    success: false,
                    message: 'Scan not found',
                },
                { status: 404 }
            );
        }

        // Return all scan results
        return NextResponse.json({
            success: true,
            results: mockScanResults,
        });
    } catch (error) {
        console.error('Scan status API error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
