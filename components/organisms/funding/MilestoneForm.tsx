import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { VALIDATION_LIMITS } from '../../../constants/create_round';
import { type ProjectFormData } from '../../../types/create_round';

interface MilestoneFormProps {
    control: Control<ProjectFormData>;
    fields: Array<{ id: string }>;
    onRemove: (index: number) => void;
    today: string;
}

export const MilestoneForm = ({ control, fields, onRemove, today }: MilestoneFormProps) => (
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
                    <h4 className='font-medium text-gray-900'>Milestone {index + 1}</h4>
                    {fields.length > VALIDATION_LIMITS.MIN_MILESTONES && (
                        <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => onRemove(index)}
                            className='text-red-600 hover:text-red-700 hover:bg-red-50'
                        >
                            <Trash2 className='h-4 w-4' />
                        </Button>
                    )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    <FormField
                        control={control}
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
                        control={control}
                        name={`milestones.${index}.fundingAmount`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Funding Amount (USDC)</FormLabel>
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
                        control={control}
                        name={`milestones.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
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
                        control={control}
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
);
