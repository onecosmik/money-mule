import { z } from 'zod';

import { VALIDATION_LIMITS } from '../constants/create_round';

// Enhanced validation schema
export const milestoneSchema = z.object({
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

export const projectSchema = z
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
                    num >= VALIDATION_LIMITS.MIN_FUNDING_GOAL &&
                    num <= VALIDATION_LIMITS.MAX_FUNDING_GOAL
                );
            }, `Funding goal must be between ${VALIDATION_LIMITS.MIN_FUNDING_GOAL} and ${VALIDATION_LIMITS.MAX_FUNDING_GOAL} USDC`),
        fundingDeadline: z.string().min(1, 'Funding deadline is required'),
        milestones: z
            .array(milestoneSchema)
            .min(
                VALIDATION_LIMITS.MIN_MILESTONES,
                `At least ${VALIDATION_LIMITS.MIN_MILESTONES} milestone is required`
            )
            .max(
                VALIDATION_LIMITS.MAX_MILESTONES,
                `Maximum ${VALIDATION_LIMITS.MAX_MILESTONES} milestones allowed`
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

export type ProjectFormData = z.infer<typeof projectSchema>;
export type MilestoneFormData = z.infer<typeof milestoneSchema>;
