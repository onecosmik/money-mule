'use client';

import { motion } from 'framer-motion';
import { Clock, DollarSign, Play, Search, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardNav } from '@/app/components/navigation/DashboardNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

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
}

interface ProjectsResponse {
    success: boolean;
    projects: Project[];
    total: number;
    totalAll: number;
}

const getStatusColor = (status: Project['status']) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'completed':
            return 'bg-blue-100 text-blue-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getRiskColor = (score: number) => {
    if (score <= 25) return 'text-green-600';
    if (score <= 50) return 'text-yellow-600';
    return 'text-red-600';
};

export default function DashboardPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects().catch(console.error);
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            if (response.ok) {
                const data = (await response.json()) as ProjectsResponse;
                setProjects(data.projects || []);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartScan = async () => {
        setIsScanning(true);
        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'start' }),
            });

            if (response.ok) {
                // Simulate scan completion
                setTimeout(() => {
                    setIsScanning(false);
                    // Refresh projects after scan
                    fetchProjects().catch(console.error);
                }, 3000);
            }
        } catch (error) {
            console.error('Scan failed:', error);
            setIsScanning(false);
        }
    };

    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50'>
                <DashboardNav />
                <div className='flex items-center justify-center h-[calc(100vh-80px)]'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600' />
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <DashboardNav />
            <div className='container mx-auto px-4 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>Dashboard</h1>
                    <p className='text-gray-600'>Monitor your investments and start new scans</p>
                </div>

                {/* Main Action Card */}
                <Card className='mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Search className='h-5 w-5 text-green-600' />
                            Start New Investment Scan
                        </CardTitle>
                        <CardDescription>
                            Qualify founders in seconds using our AI-powered analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
                            <Button
                                onClick={() => {
                                    handleStartScan().catch(console.error);
                                }}
                                disabled={isScanning}
                                className='bg-green-600 hover:bg-green-700 text-white px-8 py-3'
                                size='lg'
                            >
                                {isScanning ? (
                                    <>
                                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Play className='h-4 w-4 mr-2' />
                                        Start Scan
                                    </>
                                )}
                            </Button>
                            <div className='text-sm text-gray-600'>
                                {isScanning
                                    ? 'Analyzing project data...'
                                    : 'Get instant risk assessment and founder qualification'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Active Projects
                                    </p>
                                    <p className='text-2xl font-bold text-gray-900'>
                                        {projects.filter(p => p.status === 'active').length}
                                    </p>
                                </div>
                                <TrendingUp className='h-8 w-8 text-green-600' />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Total Projects
                                    </p>
                                    <p className='text-2xl font-bold text-gray-900'>
                                        {projects.length}
                                    </p>
                                </div>
                                <Search className='h-8 w-8 text-blue-600' />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Avg Risk Score
                                    </p>
                                    <p className='text-2xl font-bold text-gray-900'>
                                        {projects.length > 0
                                            ? Math.round(
                                                projects.reduce(
                                                    (sum, p) => sum + p.riskScore,
                                                    0
                                                ) / projects.length
                                            )
                                            : 0}
                                        %
                                    </p>
                                </div>
                                <Users className='h-8 w-8 text-yellow-600' />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Total Team Size
                                    </p>
                                    <p className='text-2xl font-bold text-gray-900'>
                                        {projects.reduce((sum, p) => sum + p.teamSize, 0)}
                                    </p>
                                </div>
                                <DollarSign className='h-8 w-8 text-green-600' />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Projects List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                        <CardDescription>
                            Your investment portfolio and scan results
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {projects.length === 0 ? (
                            <div className='text-center py-8'>
                                <p className='text-gray-500'>
                                    No projects found. Start your first scan to get started!
                                </p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {projects.map(project => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className='flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'>
                                            <div className='flex-1'>
                                                <div className='flex items-start justify-between mb-2'>
                                                    <div>
                                                        <h3 className='font-semibold text-gray-900'>
                                                            {project.name}
                                                        </h3>
                                                        <p className='text-sm text-gray-600'>
                                                            {project.description}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        className={getStatusColor(project.status)}
                                                    >
                                                        {project.status}
                                                    </Badge>
                                                </div>

                                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                                                    <div className='flex items-center gap-1'>
                                                        <Clock className='h-4 w-4 text-gray-400' />
                                                        <span className='text-gray-600'>
                                                            Last scan: {project.lastScan}
                                                        </span>
                                                    </div>
                                                    <div className='flex items-center gap-1'>
                                                        <Users className='h-4 w-4 text-gray-400' />
                                                        <span className='text-gray-600'>
                                                            {project.teamSize} team members
                                                        </span>
                                                    </div>
                                                    <div className='flex items-center gap-1'>
                                                        <DollarSign className='h-4 w-4 text-gray-400' />
                                                        <span className='text-gray-600'>
                                                            {project.funding}
                                                        </span>
                                                    </div>
                                                    <div className='flex items-center gap-1'>
                                                        <span
                                                            className={`font-medium ${getRiskColor(project.riskScore)}`}
                                                        >
                                                            Risk: {project.riskScore}%
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className='mt-3'>
                                                    <div className='flex items-center justify-between text-sm mb-1'>
                                                        <span className='text-gray-600'>
                                                            Scan Progress
                                                        </span>
                                                        <span className='text-gray-900'>
                                                            {project.progress}%
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={project.progress}
                                                        className='h-2'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Separator className='mt-4' />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
