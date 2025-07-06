'use client';

import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    CheckCircle,
    Clock,
    DollarSign,
    Globe,
    MapPin,
    Star,
    Target,
    User,
    Users,
    Wallet,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DashboardNav } from '@/components/organisms/navigation/DashboardNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type ProjectDetails, mockProjectDetails } from '@/lib/mock-data/projects';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function ProjectDetailPage() {
    const params = useParams();
    const walletAddress = params.address as string;
    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [fundingAmount, setFundingAmount] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const projectData = mockProjectDetails[walletAddress];
            setProject(projectData || null);
            setLoading(false);
        }, 500);
    }, [walletAddress]);

    if (loading) {
        return (
            <div className='min-h-screen bg-green-50'>
                <DashboardNav />
                <div className='max-w-6xl mx-auto py-10 md:py-16 px-2 sm:px-4'>
                    <div className='animate-pulse'>
                        <div className='h-8 bg-green-200 rounded w-1/4 mb-4' />
                        <div className='h-64 bg-green-200 rounded mb-6' />
                        <div className='h-6 bg-green-200 rounded w-3/4 mb-2' />
                        <div className='h-6 bg-green-200 rounded w-1/2' />
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className='min-h-screen bg-green-50'>
                <DashboardNav />
                <div className='max-w-6xl mx-auto py-10 md:py-16 px-2 sm:px-4'>
                    <div className='text-center'>
                        <h1 className='text-2xl font-bold text-gray-900 mb-4'>Project Not Found</h1>
                        <p className='text-gray-600 mb-6'>
                            The project you&apos;re looking for doesn&apos;t exist.
                        </p>
                        <Link href='/dashboard/projects'>
                            <Button className='bg-green-600 hover:bg-green-700'>
                                <ArrowLeft className='h-4 w-4 mr-2' />
                                Back to Projects
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'Low':
                return 'text-green-600';
            case 'Medium':
                return 'text-yellow-600';
            case 'High':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const handleFunding = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement funding logic
        // eslint-disable-next-line no-console
        console.log('Funding amount:', fundingAmount);
    };

    return (
        <div className='min-h-screen bg-green-50'>
            <DashboardNav />

            <div className='max-w-6xl mx-auto py-10 md:py-16 px-2 sm:px-4'>
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                >
                    {/* Back Button */}
                    <div className='mb-6'>
                        <Link href='/dashboard/projects'>
                            <Button
                                variant='ghost'
                                className='hover:bg-green-100 text-green-700 flex items-center gap-2'
                            >
                                <ArrowLeft className='h-4 w-4' />
                                Back to Projects
                            </Button>
                        </Link>
                    </div>

                    {/* Hero Section */}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
                        <div className='lg:col-span-2'>
                            <motion.div
                                variants={fadeInUp}
                                initial='hidden'
                                whileInView='visible'
                                viewport={{ once: true, amount: 0.3 }}
                            >
                                <Image
                                    src={project.coverImage}
                                    alt={project.name}
                                    width={800}
                                    height={400}
                                    className='w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg'
                                />
                            </motion.div>

                            <motion.div
                                variants={fadeInUp}
                                initial='hidden'
                                whileInView='visible'
                                viewport={{ once: true, amount: 0.3 }}
                                className='mt-6'
                            >
                                <div className='flex items-center gap-3 mb-4'>
                                    <Badge className={`${getStatusColor(project.status)} border-0`}>
                                        {getStatusText(project.status)}
                                    </Badge>
                                    <Badge variant='outline' className='border-green-200'>
                                        {project.category}
                                    </Badge>
                                </div>

                                <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
                                    {project.name}
                                </h1>

                                <p className='text-xl text-gray-600 mb-6'>{project.description}</p>

                                <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                                    <div className='flex items-center gap-2'>
                                        <User className='h-4 w-4 text-green-600' />
                                        <span>{project.founderName}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <MapPin className='h-4 w-4 text-green-600' />
                                        <span>{project.location}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Users className='h-4 w-4 text-green-600' />
                                        <span>{project.backers} backers</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Target className='h-4 w-4 text-green-600' />
                                        <span>Team of {project.teamSize}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Funding Card */}
                        <motion.div
                            variants={fadeInUp}
                            initial='hidden'
                            whileInView='visible'
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            <Card className='sticky top-4 border-green-200'>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <DollarSign className='h-5 w-5 text-green-600' />
                                        Funding Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-4'>
                                        <div>
                                            <div className='flex justify-between items-center mb-2'>
                                                <span className='text-2xl font-bold text-green-600'>
                                                    {formatCurrency(project.currentFunding)}
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
                                            <div className='text-sm text-gray-600 mb-2'>
                                                of {formatCurrency(project.fundingGoal)} goal
                                            </div>
                                            <Progress
                                                value={calculateProgress(
                                                    project.currentFunding,
                                                    project.fundingGoal
                                                )}
                                                className='h-3'
                                            />
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

                                        <div className='space-y-2'>
                                            <div className='flex justify-between'>
                                                <span className='text-sm font-medium'>
                                                    Viability Score
                                                </span>
                                                <span className='text-sm font-bold text-green-600'>
                                                    {project.viabilityScore}/100
                                                </span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-sm font-medium'>
                                                    Risk Level
                                                </span>
                                                <span
                                                    className={`text-sm font-bold ${getRiskColor(project.riskLevel)}`}
                                                >
                                                    {project.riskLevel}
                                                </span>
                                            </div>
                                        </div>

                                        {project.status === 'active' && (
                                            <form onSubmit={handleFunding} className='space-y-3'>
                                                <div>
                                                    <Label htmlFor='funding-amount'>
                                                        Funding Amount
                                                    </Label>
                                                    <Input
                                                        id='funding-amount'
                                                        type='number'
                                                        placeholder='Enter amount in USD'
                                                        value={fundingAmount}
                                                        onChange={e =>
                                                            setFundingAmount(e.target.value)
                                                        }
                                                        className='border-green-200 focus:border-green-400'
                                                    />
                                                </div>
                                                <Button
                                                    type='submit'
                                                    className='w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                                                >
                                                    <DollarSign className='h-4 w-4 mr-2' />
                                                    Fund This Project
                                                </Button>
                                            </form>
                                        )}

                                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                                            <Globe className='h-4 w-4 text-green-600' />
                                            <a
                                                href={project.website}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='hover:text-green-600 transition-colors'
                                            >
                                                Visit Website
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Tabs Section */}
                    <motion.div
                        variants={fadeInUp}
                        initial='hidden'
                        whileInView='visible'
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <Tabs defaultValue='overview' className='w-full'>
                            <TabsList className='grid w-full grid-cols-4 bg-green-100'>
                                <TabsTrigger value='overview'>Overview</TabsTrigger>
                                <TabsTrigger value='milestones'>Milestones</TabsTrigger>
                                <TabsTrigger value='updates'>Updates</TabsTrigger>
                                <TabsTrigger value='gallery'>Gallery</TabsTrigger>
                            </TabsList>

                            <TabsContent value='overview' className='mt-6'>
                                <Card className='border-green-200'>
                                    <CardHeader>
                                        <CardTitle>Project Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='prose max-w-none'>
                                            <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
                                                {project.longDescription}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value='milestones' className='mt-6'>
                                <div className='space-y-4'>
                                    {project.milestones.map(milestone => (
                                        <Card key={milestone.title} className='border-green-200'>
                                            <CardContent className='pt-6'>
                                                <div className='flex items-start gap-4'>
                                                    <div className='flex-shrink-0 mt-1'>
                                                        {milestone.completed ? (
                                                            <CheckCircle className='h-6 w-6 text-green-600' />
                                                        ) : (
                                                            <Clock className='h-6 w-6 text-gray-400' />
                                                        )}
                                                    </div>
                                                    <div className='flex-1'>
                                                        <div className='flex items-center justify-between mb-2'>
                                                            <h3 className='font-semibold text-gray-900'>
                                                                {milestone.title}
                                                            </h3>
                                                            <Badge
                                                                variant='outline'
                                                                className='border-green-200'
                                                            >
                                                                {new Date(
                                                                    milestone.deadline
                                                                ).toLocaleDateString()}
                                                            </Badge>
                                                        </div>
                                                        <p className='text-gray-600 mb-3'>
                                                            {milestone.description}
                                                        </p>
                                                        {milestone.completed ? (
                                                            <div className='text-sm text-green-600'>
                                                                ✓ Completed on{' '}
                                                                {milestone.completedDate &&
                                                                    new Date(
                                                                        milestone.completedDate
                                                                    ).toLocaleDateString()}
                                                            </div>
                                                        ) : (
                                                            <div className='space-y-2'>
                                                                <div className='flex justify-between text-sm'>
                                                                    <span className='text-gray-600'>
                                                                        Progress
                                                                    </span>
                                                                    <span className='font-medium'>
                                                                        {milestone.progress || 0}%
                                                                    </span>
                                                                </div>
                                                                <Progress
                                                                    value={milestone.progress || 0}
                                                                    className='h-2'
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value='updates' className='mt-6'>
                                <div className='space-y-4'>
                                    {project.updates.map(update => (
                                        <Card
                                            key={`${update.date}-${update.title}`}
                                            className='border-green-200'
                                        >
                                            <CardContent className='pt-6'>
                                                <div className='flex items-start gap-4'>
                                                    <div className='flex-shrink-0 mt-1'>
                                                        {update.type === 'milestone' ? (
                                                            <Star className='h-6 w-6 text-yellow-500' />
                                                        ) : (
                                                            <AlertCircle className='h-6 w-6 text-blue-500' />
                                                        )}
                                                    </div>
                                                    <div className='flex-1'>
                                                        <div className='flex items-center justify-between mb-2'>
                                                            <h3 className='font-semibold text-gray-900'>
                                                                {update.title}
                                                            </h3>
                                                            <span className='text-sm text-gray-500'>
                                                                {new Date(
                                                                    update.date
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className='text-gray-600'>
                                                            {update.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value='gallery' className='mt-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {project.galleryImages.map((image, index) => (
                                        <motion.div
                                            key={`gallery-${image}-${Math.random()}`}
                                            variants={fadeInUp}
                                            initial='hidden'
                                            whileInView='visible'
                                            viewport={{ once: true, amount: 0.3 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Image
                                                src={image}
                                                alt={`${project.name} gallery ${index + 1}`}
                                                width={400}
                                                height={300}
                                                className='w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow'
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
