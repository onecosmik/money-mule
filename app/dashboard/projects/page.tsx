'use client';

import { motion } from 'framer-motion';
import { CalendarDays, DollarSign, Globe, Plus, TrendingUp, User, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { DashboardNav } from '@/components/organisms/navigation/DashboardNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for projects
const mockProjects = [
    {
        id: 1,
        name: 'Local Food Delivery Network',
        description:
            'Connecting local farmers with consumers through a sustainable delivery platform',
        website: 'https://localfoodnetwork.com',
        fundingGoal: 25000,
        currentFunding: 12500,
        fundingDeadline: '2024-06-15',
        founderAddress: '0x1234567890123456789012345678901234567890',
        milestones: [
            { title: 'Platform Development', deadline: '2024-03-15', completed: true },
            { title: 'Farmer Onboarding', deadline: '2024-04-30', completed: false },
            { title: 'Market Launch', deadline: '2024-06-01', completed: false },
        ],
        coverImage:
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
        status: 'active',
        viabilityScore: 85,
    },
    {
        id: 2,
        name: 'Community Learning Platform',
        description: 'Online platform for skill-sharing and community education initiatives',
        website: 'https://communitylearn.com',
        fundingGoal: 15000,
        currentFunding: 8000,
        fundingDeadline: '2024-08-20',
        founderAddress: '0x2345678901234567890123456789012345678901',
        milestones: [
            { title: 'Content Creation', deadline: '2024-04-01', completed: true },
            { title: 'User Interface', deadline: '2024-05-15', completed: false },
            { title: 'Beta Testing', deadline: '2024-07-01', completed: false },
        ],
        coverImage:
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
        status: 'active',
        viabilityScore: 92,
    },
    {
        id: 3,
        name: 'Eco-Friendly Packaging Solutions',
        description: 'Sustainable packaging alternatives for small businesses and local markets',
        website: 'https://ecopackaging.com',
        fundingGoal: 35000,
        currentFunding: 28000,
        fundingDeadline: '2024-05-30',
        founderAddress: '0x3456789012345678901234567890123456789012',
        milestones: [
            { title: 'Material Research', deadline: '2024-02-15', completed: true },
            { title: 'Supplier Partnerships', deadline: '2024-04-01', completed: true },
            { title: 'Production Launch', deadline: '2024-05-20', completed: false },
        ],
        coverImage:
            'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=200&fit=crop',
        status: 'funding_complete',
        viabilityScore: 78,
    },
];

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState(mockProjects);

    useEffect(() => {
        // Randomize viability scores and sort by them on each load
        const randomizedProjects = mockProjects
            .map(project => ({
                ...project,
                viabilityScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
            }))
            .sort((a, b) => b.viabilityScore - a.viabilityScore);

        setProjects(randomizedProjects);
    }, []);

    const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);

    const calculateProgress = (current: number, goal: number) =>
        Math.min((current / goal) * 100, 100);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'funding_complete':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Active Funding';
            case 'funding_complete':
                return 'Funding Complete';
            case 'completed':
                return 'Completed';
            default:
                return 'Unknown';
        }
    };

    const getViabilityColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className='min-h-screen bg-green-50'>
            <DashboardNav />

            <div className='max-w-7xl mx-auto py-10 md:py-16 px-2 sm:px-4'>
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                >
                    <div className='text-center mb-8'>
                        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight'>
                            Community Projects
                        </h1>
                        <p className='text-base sm:text-lg md:text-xl mb-4 max-w-2xl mx-auto'>
                            Support local initiatives and community-driven projects
                        </p>
                        <p className='font-semibold text-slate-900 opacity-50 mb-6 text-base sm:text-lg flex items-center justify-center'>
                            Built on
                            <Image
                                src='https://files.invicta.capital/u/saga_7754.svg'
                                alt='Saga Logo'
                                width={3412}
                                height={512}
                                className='ml-2 h-[1rem] w-auto'
                            />
                        </p>
                    </div>

                    <div className='flex justify-center mb-8'>
                        <Link href='/dashboard/fund_by_milestones'>
                            <Button
                                size='lg'
                                className='bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg font-semibold flex items-center gap-2'
                            >
                                <Plus className='h-5 w-5' />
                                Start Your Project
                            </Button>
                        </Link>
                    </div>

                    <motion.div
                        variants={fadeInUp}
                        initial='hidden'
                        whileInView='visible'
                        viewport={{ once: true, amount: 0.3 }}
                        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    >
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                variants={fadeInUp}
                                initial='hidden'
                                whileInView='visible'
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: index * 0.1 }}
                                className='h-full'
                            >
                                <Link href={`/dashboard/projects/${project.founderAddress}`}>
                                    <Card className='h-full border-green-200 hover:border-green-400 transition-colors duration-200 cursor-pointer hover:shadow-lg'>
                                        <div className='relative'>
                                            <img
                                                src={project.coverImage}
                                                alt={project.name}
                                                className='w-full h-48 object-cover rounded-t-lg'
                                            />
                                            <div className='absolute top-4 right-4'>
                                                <Badge
                                                    className={`${getStatusColor(project.status)} border-0`}
                                                >
                                                    {getStatusText(project.status)}
                                                </Badge>
                                            </div>
                                        </div>

                                        <CardHeader className='pb-3'>
                                            <div className='flex items-start justify-between'>
                                                <CardTitle className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                                                    <TrendingUp className='h-5 w-5 text-green-600' />
                                                    {project.name}
                                                </CardTitle>
                                            </div>
                                            <CardDescription className='text-sm text-gray-600 line-clamp-2'>
                                                {project.description}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className='pt-0'>
                                            <div className='space-y-4'>
                                                {/* Funding Progress */}
                                                <div>
                                                    <div className='flex justify-between items-center mb-2'>
                                                        <span className='text-sm font-medium text-gray-700'>
                                                            Funding Progress
                                                        </span>
                                                        <span className='text-sm text-gray-600'>
                                                            {Math.round(
                                                                calculateProgress(
                                                                    project.currentFunding,
                                                                    project.fundingGoal
                                                                )
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className='w-full bg-gray-200 rounded-full h-2'>
                                                        <div
                                                            className='bg-gradient-to-r from-green-600 to-green-700 h-2 rounded-full transition-all duration-300'
                                                            style={{
                                                                width: `${calculateProgress(project.currentFunding, project.fundingGoal)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className='flex justify-between text-xs text-gray-600 mt-1'>
                                                        <span>
                                                            {formatCurrency(project.currentFunding)}
                                                        </span>
                                                        <span>
                                                            {formatCurrency(project.fundingGoal)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Project Details */}
                                                <div className='space-y-2'>
                                                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                                                        <Globe className='h-4 w-4 text-green-600' />
                                                        <span className='hover:text-green-600 transition-colors'>
                                                            {project.website.replace(
                                                                'https://',
                                                                ''
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                                                        <CalendarDays className='h-4 w-4 text-green-600' />
                                                        <span>
                                                            Deadline:{' '}
                                                            {new Date(
                                                                project.fundingDeadline
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                                                        <Wallet className='h-4 w-4 text-green-600' />
                                                        <span className='font-mono'>
                                                            {formatAddress(project.founderAddress)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Milestones */}
                                                <div>
                                                    <div className='flex items-center gap-2 mb-2'>
                                                        <User className='h-4 w-4 text-green-600' />
                                                        <span className='text-sm font-medium text-gray-700'>
                                                            Milestones
                                                        </span>
                                                    </div>
                                                    <div className='space-y-1'>
                                                        {project.milestones
                                                            .slice(0, 2)
                                                            .map(milestone => (
                                                                <div
                                                                    key={milestone.title}
                                                                    className='flex items-center justify-between text-xs'
                                                                >
                                                                    <span
                                                                        className={`${milestone.completed ? 'text-green-600' : 'text-gray-600'}`}
                                                                    >
                                                                        {milestone.title}
                                                                    </span>
                                                                    <span
                                                                        className={`${milestone.completed ? 'text-green-600' : 'text-gray-600'}`}
                                                                    >
                                                                        {milestone.completed
                                                                            ? '✓'
                                                                            : '○'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        {project.milestones.length > 2 && (
                                                            <div className='text-xs text-gray-500'>
                                                                +{project.milestones.length - 2}{' '}
                                                                more milestones
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <div className='pt-2'>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        className='w-full border-green-200 hover:bg-green-50 hover:border-green-400'
                                                        onClick={e => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            // TODO: Implement funding logic
                                                        }}
                                                    >
                                                        <DollarSign className='h-4 w-4 mr-2' />
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Empty State */}
                    {projects.length === 0 && (
                        <motion.div
                            variants={fadeInUp}
                            initial='hidden'
                            whileInView='visible'
                            viewport={{ once: true, amount: 0.3 }}
                            className='text-center py-12'
                        >
                            <TrendingUp className='h-16 w-16 text-green-600 mx-auto mb-4' />
                            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                                No projects yet
                            </h3>
                            <p className='text-gray-600 mb-6'>
                                Be the first to create a project and start funding!
                            </p>
                            <Link href='/dashboard/fund_by_milestones'>
                                <Button
                                    size='lg'
                                    className='bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg font-semibold flex items-center gap-2'
                                >
                                    <Plus className='h-5 w-5' />
                                    Create First Project
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
