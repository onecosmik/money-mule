'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    CheckCircle,
    DollarSign,
    Globe,
    Image,
    Plus,
    Trash2,
    User,
    Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { DashboardNav } from '@/components/organisms/navigation/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { CONTRACTS, VALIDATION } from '@/lib/constants';
import {
    type CreateFundingRoundParams,
    createFundingRound,
    createMilestoneData,
    dateToUnixTimestamp,
    getAuthorizedJuryAddresses,
    isAuthorizedJuror,
    isContract,
    parseUSDCAmount,
    testCreateFundingRound,
    verifyFactoryContract,
} from '@/lib/contracts';
import { type CreateRoundParams, createRound } from '@/lib/database';

// Enhanced validation schema
const milestoneSchema = z.object({
    title: z.string().min(1, 'Milestone title is required'),
    description: z.string().min(10, 'Milestone description must be at least 10 characters'),
    deadline: z.string().min(1, 'Deadline is required'),
    fundingAmount: z
        .string()
        .min(1, 'Funding amount is required')
        .refine(
            val => !Number.isNaN(Number(val)) && Number(val) > 0,
            'Funding amount must be a positive number'
        ),
});

const projectSchema = z
    .object({
        coverUrl: z.string().url('Please enter a valid URL for the cover image'),
        projectName: z
            .string()
            .min(1, 'Project name is required')
            .max(100, 'Project name must be less than 100 characters'),
        description: z
            .string()
            .min(50, 'Project description must be at least 50 characters')
            .max(2000, 'Project description must be less than 2000 characters'),
        website: z.string().url('Please enter a valid website URL'),
        category: z.string().min(1, 'Project category is required'),
        fundingGoal: z
            .string()
            .min(1, 'Funding goal is required')
            .refine(val => {
                const num = Number(val);
                return (
                    !Number.isNaN(num) &&
                    num >= VALIDATION.MIN_FUNDING_GOAL &&
                    num <= VALIDATION.MAX_FUNDING_GOAL
                );
            }, `Funding goal must be between ${VALIDATION.MIN_FUNDING_GOAL} and ${VALIDATION.MAX_FUNDING_GOAL} USDC`),
        fundingDeadline: z.string().min(1, 'Funding deadline is required'),
        milestones: z
            .array(milestoneSchema)
            .min(
                VALIDATION.MIN_MILESTONES,
                `At least ${VALIDATION.MIN_MILESTONES} milestone is required`
            )
            .max(
                VALIDATION.MAX_MILESTONES,
                `Maximum ${VALIDATION.MAX_MILESTONES} milestones allowed`
            )
            .refine(milestones => {
                const totalFunding = milestones.reduce(
                    (sum, m) => sum + Number(m.fundingAmount),
                    0
                );
                return totalFunding > 0;
            }, 'Total milestone funding must be greater than 0'),
    })
    .refine(
        data => {
            // Check if all milestone deadlines are after funding deadline
            const fundingDeadline = new Date(data.fundingDeadline);
            return data.milestones.every(
                milestone => new Date(milestone.deadline) > fundingDeadline
            );
        },
        {
            message: 'All milestone deadlines must be after the funding deadline',
            path: ['milestones'],
        }
    );

type ProjectFormData = z.infer<typeof projectSchema>;

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const categories = [
    'Technology',
    'Healthcare',
    'Education',
    'Environment',
    'Finance',
    'Entertainment',
    'Social Impact',
    'Other',
];

export default function FundProjectPage() {
    const router = useRouter();
    const { ready, user, authenticated } = usePrivy();
    const { wallets } = useWallets();
    const { login } = useLogin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);

    // Get the connected wallet - prefer external wallets but accept embedded wallets
    const connectedWallet =
        wallets.find(wallet => wallet.connectorType !== 'embedded') || wallets[0];

    // Debug wallet connection state
    console.log('Debug - Wallet connection state:', {
        ready,
        authenticated,
        user: !!user,
        walletsCount: wallets.length,
        connectedWallet: !!connectedWallet,
        walletTypes: wallets.map(w => w.connectorType),
        connectedWalletAddress: connectedWallet?.address,
    });

    const handleAuthenticate = () => {
        try {
            console.log('Attempting to authenticate with Privy...');
            login();
        } catch (error) {
            console.error('Authentication failed:', error);
            toast.error('Authentication failed. Please try again.');
        }
    };

    const form = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            coverUrl: '',
            projectName: '',
            description: '',
            website: '',
            category: '',
            fundingGoal: '',
            fundingDeadline: '',
            milestones: [
                {
                    title: '',
                    description: '',
                    deadline: '',
                    fundingAmount: '',
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'milestones',
    });

    const handleSubmit = async (data: ProjectFormData): Promise<void> => {
        if (!ready) {
            toast.error('Privy is not ready yet, please wait');
            return;
        }

        if (!authenticated) {
            toast.error('Please authenticate with Privy first');
            return;
        }

        if (!connectedWallet) {
            toast.error('No wallet connected. Please connect a wallet first');
            return;
        }

        // Enhanced USDC contract validation
        console.log('USDC Contract Address:', CONTRACTS.USDC_ADDRESS);
        if (!CONTRACTS.USDC_ADDRESS) {
            toast.error(
                'USDC contract not configured. Please set NEXT_PUBLIC_USDC_CONTRACT environment variable.'
            );
            console.error(
                'Missing USDC contract address. Please set NEXT_PUBLIC_USDC_CONTRACT environment variable.'
            );
            return;
        }

        // Validate USDC address format
        if (!CONTRACTS.USDC_ADDRESS.match(/^0x[a-fA-F0-9]{40}$/)) {
            toast.error('Invalid USDC contract address format');
            console.error('Invalid USDC contract address:', CONTRACTS.USDC_ADDRESS);
            return;
        }

        setIsSubmitting(true);
        setTransactionHash(null);

        try {
            // Validate milestone funding amounts equal funding goal
            const totalMilestoneFunding = data.milestones.reduce(
                (sum, milestone) => sum + Number(milestone.fundingAmount),
                0
            );
            const fundingGoal = Number(data.fundingGoal);

            console.log('Funding validation:', {
                totalMilestoneFunding,
                fundingGoal,
                difference: Math.abs(totalMilestoneFunding - fundingGoal),
            });

            if (Math.abs(totalMilestoneFunding - fundingGoal) > 0.01) {
                throw new Error('Total milestone funding must equal the funding goal');
            }

            // Validate milestone deadlines are after funding deadline
            const fundingDeadline = new Date(data.fundingDeadline);
            const invalidMilestones = data.milestones.filter(
                milestone => new Date(milestone.deadline) <= fundingDeadline
            );

            if (invalidMilestones.length > 0) {
                const milestoneNumbers = invalidMilestones.map((_, index) => {
                    const originalIndex = data.milestones.findIndex(
                        m => m === invalidMilestones[index]
                    );
                    return originalIndex + 1;
                });
                throw new Error(
                    `Milestone deadline(s) must be AFTER the funding deadline (${data.fundingDeadline}). ` +
                    `Please update milestone(s) #${milestoneNumbers.join(', ')} to have deadlines after the funding deadline.`
                );
            }

            console.log('Milestone deadline validation:', {
                fundingDeadline: data.fundingDeadline,
                milestoneDeadlines: data.milestones.map(m => m.deadline),
                allAfterFunding: data.milestones.every(m => new Date(m.deadline) > fundingDeadline),
            });

            // Get signer from connected wallet
            console.log('Getting wallet provider...');
            const provider = await connectedWallet.getEthereumProvider();
            const ethersProvider = new ethers.BrowserProvider(provider);
            const signer = await ethersProvider.getSigner();

            console.log('Wallet connected:', {
                address: connectedWallet.address,
                signerAddress: await signer.getAddress(),
            });

            // Verify contract setup before proceeding
            console.log('Verifying contract setup...');
            const isFactoryContract = await isContract(ethersProvider, CONTRACTS.FACTORY_ADDRESS);
            const isUSDCContract = await isContract(ethersProvider, CONTRACTS.USDC_ADDRESS);

            console.log('Contract verification:', {
                factoryAddress: CONTRACTS.FACTORY_ADDRESS,
                factoryIsContract: isFactoryContract,
                usdcAddress: CONTRACTS.USDC_ADDRESS,
                usdcIsContract: isUSDCContract,
            });

            if (!isFactoryContract) {
                throw new Error(
                    `Factory contract not found at address ${CONTRACTS.FACTORY_ADDRESS}. Make sure you're on the correct network.`
                );
            }

            if (!isUSDCContract) {
                console.warn(
                    `USDC contract not found at address ${CONTRACTS.USDC_ADDRESS}. This might be a test token.`
                );
            }

            // Verify factory contract functionality
            const factoryWorking = await verifyFactoryContract(ethersProvider);
            if (!factoryWorking) {
                throw new Error(
                    'Factory contract verification failed. The contract may not be functioning properly.'
                );
            }

            // Get the authorized jury addresses (simplified for hackathon)
            const juryAddresses = getAuthorizedJuryAddresses();

            // Verify the jury address is actually authorized
            const isJuryAuthorized = await isAuthorizedJuror(ethersProvider, juryAddresses[0]);

            console.log('Jury setup (simplified):', {
                juryAddresses,
                isJuryAuthorized,
                note: 'Using authorized address directly for hackathon simplicity',
            });

            if (!isJuryAuthorized) {
                throw new Error(
                    `Jury address ${juryAddresses[0]} is not authorized on the contract. Please contact the contract owner to authorize this address.`
                );
            }

            // Prepare milestone data for smart contract
            const contractMilestones = data.milestones.map((milestone, index) => {
                const milestoneData = createMilestoneData(
                    milestone.description,
                    parseUSDCAmount(milestone.fundingAmount),
                    dateToUnixTimestamp(new Date(milestone.deadline)),
                    juryAddresses
                );
                console.log(`Milestone ${index + 1}:`, {
                    description: milestone.description,
                    fundingAmount: milestone.fundingAmount,
                    parsedAmount: milestoneData.fundingAmount.toString(),
                    deadline: milestone.deadline,
                    unixTimestamp: milestoneData.deadline,
                    juryWallets: milestoneData.juryWallets,
                });
                return milestoneData;
            });

            // Prepare contract parameters
            const contractParams: CreateFundingRoundParams = {
                tokenAddress: CONTRACTS.USDC_ADDRESS,
                targetAmount: parseUSDCAmount(data.fundingGoal),
                fundingDeadline: dateToUnixTimestamp(new Date(data.fundingDeadline)),
                milestones: contractMilestones,
            };

            console.log('Contract parameters:', {
                tokenAddress: contractParams.tokenAddress,
                targetAmount: contractParams.targetAmount.toString(),
                fundingDeadline: contractParams.fundingDeadline,
                milestonesCount: contractParams.milestones.length,
                factoryAddress: CONTRACTS.FACTORY_ADDRESS,
            });

            // Test the contract call first to get better error information
            console.log('Testing contract call first...');
            await testCreateFundingRound(signer, contractParams);

            toast.info('Creating funding round on blockchain...');

            // Create funding round on smart contract
            const result = await createFundingRound(signer, contractParams);

            setTransactionHash(result.transactionHash);
            toast.success('Smart contract created successfully!');

            // Prepare database parameters
            const dbParams: CreateRoundParams = {
                roundId: Number(result.roundId),
                contractAddress: result.roundContract,
                founderAddress: connectedWallet.address,
                tokenAddress: CONTRACTS.USDC_ADDRESS,
                targetAmount: data.fundingGoal,
                fundingDeadline: new Date(data.fundingDeadline),
                title: data.projectName,
                description: data.description,
                imageUrl: data.coverUrl,
                websiteUrl: data.website,
                category: data.category,
                totalMilestones: data.milestones.length,
                milestones: data.milestones.map((milestone, index) => ({
                    milestoneId: index,
                    title: milestone.title,
                    description: milestone.description,
                    fundingAmount: milestone.fundingAmount,
                    deadline: new Date(milestone.deadline),
                })),
            };

            toast.info('Saving project metadata...');

            // Save to database
            await createRound(dbParams);

            toast.success('Project created successfully!');

            // Redirect to project view or dashboard
            setTimeout(() => {
                router.push('/dashboard/projects');
            }, 2000);
        } catch (error) {
            console.error('Error creating project:', error);

            // Enhanced error reporting
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                });

                // Check for specific ethers errors
                if (error.message.includes('missing revert data')) {
                    toast.error(
                        'Transaction failed during gas estimation. This might be due to invalid contract parameters or contract validation failing.'
                    );
                } else if (error.message.includes('user rejected')) {
                    toast.error('Transaction was rejected by user');
                } else if (error.message.includes('insufficient funds')) {
                    toast.error('Insufficient funds for transaction');
                } else {
                    toast.error(`Failed to create project: ${error.message}`);
                }
            } else {
                toast.error('Unknown error occurred while creating project');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const addMilestone = () => {
        if (fields.length >= VALIDATION.MAX_MILESTONES) {
            toast.error(`Maximum ${VALIDATION.MAX_MILESTONES} milestones allowed`);
            return;
        }
        append({
            title: '',
            description: '',
            deadline: '',
            fundingAmount: '',
        });
    };

    const removeMilestone = (index: number) => {
        if (fields.length > VALIDATION.MIN_MILESTONES) {
            remove(index);
        } else {
            toast.error(`At least ${VALIDATION.MIN_MILESTONES} milestone is required`);
        }
    };

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split('T')[0];

    // Show wallet connection prompt if not connected
    if (!ready) {
        return (
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
    }

    if (!authenticated) {
        return (
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
                                        <br />
                                        Debug:{' '}
                                        {authenticated ? 'Authenticated' : 'Not authenticated'} |
                                        Wallets: {wallets.length}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleAuthenticate}
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
    }

    if (!connectedWallet) {
        return (
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
                                    <h3 className='text-xl font-semibold mb-2'>
                                        No Wallet Detected
                                    </h3>
                                    <p className='text-gray-600 mb-6'>
                                        You&apos;re authenticated but no wallet is connected.
                                        <br />
                                        Debug info: {wallets.length} wallets found | Auth:{' '}
                                        {authenticated ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleAuthenticate}
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
    }

    return (
        <div className='min-h-screen bg-green-50'>
            <DashboardNav />

            <div className='max-w-5xl mx-auto py-10 md:py-16 px-2 sm:px-4'>
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                >
                    <div className='text-center mb-8'>
                        <div className='flex justify-center mb-4'>
                            <Link href='/dashboard/projects'>
                                <Button
                                    variant='ghost'
                                    size='lg'
                                    className='border-gray-200 hover:bg-gray-50 hover:border-gray-400 text-gray-700 px-6 py-2 text-base font-semibold flex items-center gap-2'
                                >
                                    <ArrowLeft className='h-5 w-5' />
                                    Back to Projects
                                </Button>
                            </Link>
                        </div>
                        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight'>
                            Fund Your Project
                        </h1>
                        <p className='text-base sm:text-lg md:text-xl mb-4 max-w-2xl mx-auto'>
                            Create a funding campaign for your project with milestone-based funding
                        </p>
                        <p className='font-semibold text-green-700 mb-6 text-base sm:text-lg'>
                            Smart funding. Milestone-driven success.
                        </p>

                        {/* Wallet Info */}
                        <div className='bg-white rounded-lg p-4 max-w-md mx-auto mb-6 border border-green-200'>
                            <div className='flex items-center justify-center gap-3 text-sm'>
                                <CheckCircle className='h-5 w-5 text-green-600' />
                                <span className='text-gray-600'>Connected:</span>
                                <span className='font-mono text-gray-800'>
                                    {`${connectedWallet.address.slice(0, 6)}...${connectedWallet.address.slice(-4)}`}
                                </span>
                            </div>
                        </div>

                        {/* Transaction Status */}
                        {transactionHash && (
                            <div className='bg-green-100 border border-green-300 rounded-lg p-4 max-w-2xl mx-auto mb-6'>
                                <div className='flex items-center gap-3 text-sm'>
                                    <CheckCircle className='h-5 w-5 text-green-600' />
                                    <span className='text-green-800'>
                                        Transaction submitted:
                                        <a
                                            href={`https://moneymule-2751721147387000-1.sagaexplorer.io:443/tx/${transactionHash}`}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='ml-2 underline hover:no-underline'
                                        >
                                            View on Explorer
                                        </a>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <Card className='bg-white shadow-lg border-green-200'>
                        <CardHeader className='bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg'>
                            <CardTitle className='text-2xl font-bold flex items-center gap-2'>
                                <DollarSign className='h-6 w-6' />
                                Project Details
                            </CardTitle>
                            <CardDescription className='text-green-100'>
                                Fill in your project information to start your funding campaign
                            </CardDescription>
                        </CardHeader>

                        <CardContent className='p-6 sm:p-8'>
                            <Form {...form}>
                                <form
                                    onSubmit={e => {
                                        e.preventDefault();
                                        form.handleSubmit(handleSubmit)().catch(console.error);
                                    }}
                                    className='space-y-8'
                                >
                                    {/* Cover Image */}
                                    <motion.div
                                        variants={fadeInUp}
                                        initial='hidden'
                                        whileInView='visible'
                                        viewport={{ once: true, amount: 0.3 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name='coverUrl'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-lg font-semibold'>
                                                        <Image className='h-5 w-5 text-green-600' />
                                                        Cover Image URL
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder='https://example.com/cover-image.jpg'
                                                            className='h-12 text-lg border-green-200 focus:border-green-400 focus:ring-green-400'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Upload your project cover image to a service
                                                        like Imgur, then paste the URL here
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>

                                    {/* Project Name */}
                                    <motion.div
                                        variants={fadeInUp}
                                        initial='hidden'
                                        whileInView='visible'
                                        viewport={{ once: true, amount: 0.3 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name='projectName'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-lg font-semibold'>
                                                        <User className='h-5 w-5 text-green-600' />
                                                        Project Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder='My Amazing Project'
                                                            className='h-12 text-lg border-green-200 focus:border-green-400 focus:ring-green-400'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Enter a compelling name for your project
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>

                                    {/* Project Description */}
                                    <motion.div
                                        variants={fadeInUp}
                                        initial='hidden'
                                        whileInView='visible'
                                        viewport={{ once: true, amount: 0.3 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name='description'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-lg font-semibold'>
                                                        <User className='h-5 w-5 text-green-600' />
                                                        Project Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder='Describe your project, its goals, and why people should fund it...'
                                                            className='min-h-32 border-green-200 focus:border-green-400 focus:ring-green-400'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Provide a detailed description of your
                                                        project (50-2000 characters)
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>

                                    <motion.div
                                        variants={fadeInUp}
                                        initial='hidden'
                                        whileInView='visible'
                                        viewport={{ once: true, amount: 0.3 }}
                                        className='grid grid-cols-1 md:grid-cols-2 gap-6'
                                    >
                                        {/* Website */}
                                        <FormField
                                            control={form.control}
                                            name='website'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-lg font-semibold'>
                                                        <Globe className='h-5 w-5 text-green-600' />
                                                        Website
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder='https://myproject.com'
                                                            className='h-12 text-lg border-green-200 focus:border-green-400 focus:ring-green-400'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Your project&apos;s website or landing page
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Category */}
                                        <FormField
                                            control={form.control}
                                            name='category'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-lg font-semibold'>
                                                        <User className='h-5 w-5 text-green-600' />
                                                        Category
                                                    </FormLabel>
                                                    <FormControl>
                                                        <select
                                                            className='h-12 w-full text-lg border border-green-200 rounded-md px-3 focus:border-green-400 focus:ring-green-400 focus:outline-none'
                                                            {...field}
                                                        >
                                                            <option value=''>
                                                                Select a category
                                                            </option>
                                                            {categories.map(category => (
                                                                <option
                                                                    key={category}
                                                                    value={category}
                                                                >
                                                                    {category}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                    <FormDescription>
                                                        Choose the category that best fits your
                                                        project
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>

                                    <motion.div
                                        variants={fadeInUp}
                                        initial='hidden'
                                        whileInView='visible'
                                        viewport={{ once: true, amount: 0.3 }}
                                        className='grid grid-cols-1 md:grid-cols-2 gap-6'
                                    >
                                        {/* Funding Goal */}
                                        <FormField
                                            control={form.control}
                                            name='fundingGoal'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-lg font-semibold'>
                                                        <DollarSign className='h-5 w-5 text-green-600' />
                                                        Funding Goal (USDC)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type='number'
                                                            placeholder='100000'
                                                            min={VALIDATION.MIN_FUNDING_GOAL}
                                                            max={VALIDATION.MAX_FUNDING_GOAL}
                                                            className='h-12 text-lg border-green-200 focus:border-green-400 focus:ring-green-400'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Amount in USDC you want to raise (
                                                        {VALIDATION.MIN_FUNDING_GOAL}-
                                                        {VALIDATION.MAX_FUNDING_GOAL} USDC)
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Funding Deadline */}
                                        <FormField
                                            control={form.control}
                                            name='fundingDeadline'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-lg font-semibold'>
                                                        <CalendarDays className='h-5 w-5 text-green-600' />
                                                        Funding Deadline
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type='date'
                                                            min={today}
                                                            className='h-12 text-lg border-green-200 focus:border-green-400 focus:ring-green-400'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        When the funding period ends
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>

                                    <Separator className='my-8 bg-green-200' />

                                    {/* Milestones Section */}
                                    <motion.div
                                        variants={fadeInUp}
                                        initial='hidden'
                                        whileInView='visible'
                                        viewport={{ once: true, amount: 0.3 }}
                                    >
                                        <div className='flex items-center justify-between mb-6'>
                                            <h3 className='text-xl font-semibold text-gray-900'>
                                                Project Milestones ({fields.length}/
                                                {VALIDATION.MAX_MILESTONES})
                                            </h3>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                onClick={addMilestone}
                                                disabled={
                                                    fields.length >= VALIDATION.MAX_MILESTONES
                                                }
                                                className='flex items-center gap-2 border-green-200 hover:bg-green-50 hover:border-green-400'
                                            >
                                                <Plus className='h-4 w-4' />
                                                Add Milestone
                                            </Button>
                                        </div>

                                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                                            <div className='flex items-start gap-3'>
                                                <AlertCircle className='h-5 w-5 text-blue-600 mt-0.5' />
                                                <div className='text-sm text-blue-800'>
                                                    <p className='font-medium mb-1'>Important:</p>
                                                    <p>
                                                        All milestone deadlines must be{' '}
                                                        <strong>after</strong> the funding deadline.
                                                        This ensures milestones are achieved after
                                                        the funding period ends.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='space-y-6'>
                                            {fields.map((milestoneField, index) => (
                                                <motion.div
                                                    key={milestoneField.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: index * 0.1,
                                                    }}
                                                    className='border border-green-200 rounded-lg p-6 bg-green-50'
                                                >
                                                    <div className='flex items-center justify-between mb-4'>
                                                        <h4 className='font-medium text-gray-900'>
                                                            Milestone {index + 1}
                                                        </h4>
                                                        {fields.length >
                                                            VALIDATION.MIN_MILESTONES && (
                                                                <Button
                                                                    type='button'
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={() =>
                                                                        removeMilestone(index)
                                                                    }
                                                                    className='text-red-600 hover:text-red-700 hover:bg-red-50'
                                                                >
                                                                    <Trash2 className='h-4 w-4' />
                                                                </Button>
                                                            )}
                                                    </div>

                                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                                        <FormField
                                                            control={form.control}
                                                            name={`milestones.${index}.title`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Title</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder='e.g., MVP Development'
                                                                            className='border-green-200 focus:border-green-400 focus:ring-green-400'
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`milestones.${index}.fundingAmount`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Funding Amount (USDC)
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type='number'
                                                                            min='0'
                                                                            step='0.01'
                                                                            placeholder='10000'
                                                                            className='border-green-200 focus:border-green-400 focus:ring-green-400'
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                        <FormField
                                                            control={form.control}
                                                            name={`milestones.${index}.description`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Description
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            placeholder='Describe what will be accomplished in this milestone...'
                                                                            className='border-green-200 focus:border-green-400 focus:ring-green-400'
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`milestones.${index}.deadline`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Deadline</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type='date'
                                                                            min={today}
                                                                            className='border-green-200 focus:border-green-400 focus:ring-green-400'
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Milestone Summary */}
                                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6'>
                                            <h4 className='font-medium text-blue-900 mb-2'>
                                                Milestone Summary
                                            </h4>
                                            <div className='text-sm text-blue-800'>
                                                <div className='flex justify-between'>
                                                    <span>Total Milestones:</span>
                                                    <span>{fields.length}</span>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <span>Total Milestone Funding:</span>
                                                    <span>
                                                        {fields
                                                            .reduce((sum, _, index) => {
                                                                const amount = form.watch(
                                                                    `milestones.${index}.fundingAmount`
                                                                );
                                                                return sum + (Number(amount) || 0);
                                                            }, 0)
                                                            .toLocaleString()}{' '}
                                                        USDC
                                                    </span>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <span>Funding Goal:</span>
                                                    <span>
                                                        {Number(
                                                            form.watch('fundingGoal') || 0
                                                        ).toLocaleString()}{' '}
                                                        USDC
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <Separator className='my-8 bg-green-200' />

                                    {/* Submit Button */}
                                    <motion.div
                                        variants={fadeInUp}
                                        initial='hidden'
                                        whileInView='visible'
                                        viewport={{ once: true, amount: 0.3 }}
                                        className='flex justify-center'
                                    >
                                        <Button
                                            type='submit'
                                            size='lg'
                                            disabled={isSubmitting}
                                            className='bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg font-semibold w-full sm:w-auto min-w-48'
                                        >
                                            {isSubmitting ? (
                                                <div className='flex items-center gap-2'>
                                                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white' />
                                                    Creating Project...
                                                </div>
                                            ) : (
                                                'Create Project'
                                            )}
                                        </Button>
                                    </motion.div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
