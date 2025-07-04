import { NextRequest, NextResponse } from 'next/server';

interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'pending' | 'failed';
    progress: number;
    lastScan: string;
    riskScore: number;
    teamSize: number;
    funding: string;
    industry: string;
    createdAt: string;
    updatedAt: string;
}

interface CreateProjectRequest {
    name?: string;
    description?: string;
    teamSize?: number;
    funding?: string;
    industry?: string;
}

// Mock projects data
const mockProjects: Project[] = [
    {
        id: '1',
        name: 'TechFlow Solutions',
        description: 'AI-powered workflow automation platform',
        status: 'active',
        progress: 85,
        lastScan: '2 hours ago',
        riskScore: 23,
        teamSize: 12,
        funding: '$2.5M',
        industry: 'SaaS',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
    },
    {
        id: '2',
        name: 'GreenEnergy Co',
        description: 'Renewable energy management system',
        status: 'completed',
        progress: 100,
        lastScan: '1 day ago',
        riskScore: 15,
        teamSize: 8,
        funding: '$1.8M',
        industry: 'CleanTech',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-19T16:45:00Z',
    },
    {
        id: '3',
        name: 'HealthTech Pro',
        description: 'Digital health monitoring platform',
        status: 'pending',
        progress: 45,
        lastScan: '3 days ago',
        riskScore: 67,
        teamSize: 15,
        funding: '$3.2M',
        industry: 'HealthTech',
        createdAt: '2024-01-12T11:30:00Z',
        updatedAt: '2024-01-17T13:20:00Z',
    },
    {
        id: '4',
        name: 'FinTech Startup',
        description: 'Blockchain-based payment solution',
        status: 'failed',
        progress: 30,
        lastScan: '1 week ago',
        riskScore: 89,
        teamSize: 6,
        funding: '$500K',
        industry: 'FinTech',
        createdAt: '2024-01-08T08:15:00Z',
        updatedAt: '2024-01-13T10:30:00Z',
    },
    {
        id: '5',
        name: 'EduTech Innovations',
        description: 'Personalized learning platform with AI',
        status: 'active',
        progress: 72,
        lastScan: '5 hours ago',
        riskScore: 34,
        teamSize: 10,
        funding: '$1.2M',
        industry: 'EdTech',
        createdAt: '2024-01-14T12:00:00Z',
        updatedAt: '2024-01-20T09:15:00Z',
    },
    {
        id: '6',
        name: 'LogiChain Solutions',
        description: 'Supply chain optimization platform',
        status: 'active',
        progress: 60,
        lastScan: '1 day ago',
        riskScore: 28,
        teamSize: 14,
        funding: '$2.1M',
        industry: 'Logistics',
        createdAt: '2024-01-11T14:20:00Z',
        updatedAt: '2024-01-19T11:30:00Z',
    },
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const industry = searchParams.get('industry');
        const limit = searchParams.get('limit');

        let filteredProjects = await Promise.resolve([...mockProjects]);

        // Filter by status
        if (status) {
            filteredProjects = filteredProjects.filter(project => project.status === status);
        }

        // Filter by industry
        if (industry) {
            filteredProjects = filteredProjects.filter(
                project => project.industry.toLowerCase() === industry.toLowerCase()
            );
        }

        // Apply limit
        if (limit) {
            const limitNum = parseInt(limit, 10);
            if (!Number.isNaN(limitNum)) {
                filteredProjects = filteredProjects.slice(0, limitNum);
            }
        }

        return NextResponse.json({
            success: true,
            projects: filteredProjects,
            total: filteredProjects.length,
            totalAll: mockProjects.length,
        });
    } catch (error) {
        console.error('Projects API error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateProjectRequest = await request.json();

        // Simulate creating a new project
        const newProject: Project = {
            id: `project-${Date.now()}`,
            name: body.name || 'New Project',
            description: body.description || 'Project description',
            status: 'pending',
            progress: 0,
            lastScan: 'Never',
            riskScore: 0,
            teamSize: body.teamSize || 0,
            funding: body.funding || '$0',
            industry: body.industry || 'Unknown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // In a real app, you would save this to a database
        mockProjects.push(newProject);

        return NextResponse.json(
            {
                success: true,
                project: newProject,
                message: 'Project created successfully',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create project API error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
