import { UseFormWatch } from 'react-hook-form';

import { type ProjectFormData } from '../../../types/create_round';

interface MilestoneSummaryProps {
    watch: UseFormWatch<ProjectFormData>;
    fieldCount: number;
}

export const MilestoneSummary = ({ watch, fieldCount }: MilestoneSummaryProps) => {
    const totalMilestoneFunding = Array.from({ length: fieldCount }, (_, index) => {
        const amount = watch(`milestones.${index}.fundingAmount`);
        return Number(amount) || 0;
    }).reduce((sum, amount) => sum + amount, 0);

    const fundingGoal = Number(watch('fundingGoal') || 0);

    return (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6'>
            <h4 className='font-medium text-blue-900 mb-2'>Milestone Summary</h4>
            <div className='text-sm text-blue-800'>
                <div className='flex justify-between'>
                    <span>Total Milestones:</span>
                    <span>{fieldCount}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Total Milestone Funding:</span>
                    <span>{totalMilestoneFunding.toLocaleString()} USDC</span>
                </div>
                <div className='flex justify-between'>
                    <span>Funding Goal:</span>
                    <span>{fundingGoal.toLocaleString()} USDC</span>
                </div>
            </div>
        </div>
    );
};
