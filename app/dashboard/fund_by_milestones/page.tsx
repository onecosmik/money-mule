'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    CalendarDays,
    DollarSign,
    Globe,
    Image,
    Plus,
    Trash2,
    User,
    Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useFieldArray, useForm } from 'react-hook-form';
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

// Validation schema
const milestoneSchema = z.object({
    title: z.string().min(1, 'Milestone title is required'),
    deadline: z.string().min(1, 'Deadline is required'),
});

const projectSchema = z.object({
    coverUrl: z.string().url('Please enter a valid URL for the cover image'),
    projectName: z
        .string()
        .min(1, 'Project name is required')
        .max(100, 'Project name must be less than 100 characters'),
    website: z.string().url('Please enter a valid website URL'),
    fundingGoal: z
        .string()
        .min(1, 'Funding goal is required')
        .refine(
            val => !Number.isNaN(Number(val)) && Number(val) > 0,
            'Funding goal must be a positive number'
        ),
    fundingDeadline: z.string().min(1, 'Funding deadline is required'),
    founderWalletAddress: z
        .string()
        .min(1, 'Founder wallet address is required')
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid Ethereum wallet address'),
    milestones: z.array(milestoneSchema).min(1, 'At least one milestone is required'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function FundProjectPage() {
    const form = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            coverUrl: '',
            projectName: '',
            website: '',
            fundingGoal: '',
            fundingDeadline: '',
            founderWalletAddress: '',
            milestones: [{ title: '', deadline: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'milestones',
    });

    const handleSubmit = (data: ProjectFormData): void => {
        console.log('Project data:', data);
        // TODO: Implement project creation logic
    };

    const addMilestone = () => {
        append({ title: '', deadline: '' });
    };

    const removeMilestone = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split('T')[0];

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

                                    {/* Website */}
                                    <motion.div
                                        variants={fadeInUp}
                                        initial='hidden'
                                        whileInView='visible'
                                        viewport={{ once: true, amount: 0.3 }}
                                    >
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
                                                            className='h-12 text-lg border-green-200 focus:border-green-400 focus:ring-green-400'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Amount in USDC you want to raise
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

                                    {/* Founder Wallet Address */}
                                    <motion.div
                                        variants={fadeInUp}
                                        initial='hidden'
                                        whileInView='visible'
                                        viewport={{ once: true, amount: 0.3 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name='founderWalletAddress'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='flex items-center gap-2 text-lg font-semibold'>
                                                        <Wallet className='h-5 w-5 text-green-600' />
                                                        Founder Wallet Address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder='0x1234567890123456789012345678901234567890'
                                                            className='h-12 text-lg font-mono border-green-200 focus:border-green-400 focus:ring-green-400'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Ethereum wallet address to receive funds
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
                                                Project Milestones
                                            </h3>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                onClick={addMilestone}
                                                className='flex items-center gap-2 border-green-200 hover:bg-green-50 hover:border-green-400'
                                            >
                                                <Plus className='h-4 w-4' />
                                                Add Milestone
                                            </Button>
                                        </div>

                                        <div className='space-y-4'>
                                            {fields.map((milestoneField, index) => (
                                                <motion.div
                                                    key={milestoneField.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: index * 0.1,
                                                    }}
                                                    className='border border-green-200 rounded-lg p-4 bg-green-50'
                                                >
                                                    <div className='flex items-center justify-between mb-4'>
                                                        <h4 className='font-medium text-gray-900'>
                                                            Milestone {index + 1}
                                                        </h4>
                                                        {fields.length > 1 && (
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

                                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                                            className='bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg font-semibold w-full sm:w-auto'
                                        >
                                            Create Project
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
