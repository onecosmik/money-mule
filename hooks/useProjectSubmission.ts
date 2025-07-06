import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { CONTRACTS } from '@/lib/constants';
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

import { type ProjectFormData } from '../types/create_round';

interface ConnectedWallet {
    address: string;
    getEthereumProvider: () => Promise<ethers.Eip1193Provider>;
}

export const useProjectSubmission = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);

    const validateSubmission = (data: ProjectFormData) => {
        // Validate milestone funding amounts equal funding goal
        const totalMilestoneFunding = data.milestones.reduce(
            (sum, milestone) => sum + Number(milestone.fundingAmount),
            0
        );
        const fundingGoal = Number(data.fundingGoal);

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
    };

    const validateContracts = async (ethersProvider: ethers.BrowserProvider) => {
        // Enhanced USDC contract validation
        if (!CONTRACTS.USDC_ADDRESS) {
            throw new Error(
                'USDC contract not configured. Please set NEXT_PUBLIC_USDC_CONTRACT environment variable.'
            );
        }

        // Validate USDC address format
        if (!CONTRACTS.USDC_ADDRESS.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new Error('Invalid USDC contract address format');
        }

        // Verify contract setup before proceeding
        const isFactoryContract = await isContract(ethersProvider, CONTRACTS.FACTORY_ADDRESS);
        const isUSDCContract = await isContract(ethersProvider, CONTRACTS.USDC_ADDRESS);

        if (!isFactoryContract) {
            throw new Error(
                `Factory contract not found at address ${CONTRACTS.FACTORY_ADDRESS}. Make sure you're on the correct network.`
            );
        }

        if (!isUSDCContract) {
            // Note: This might be a test token, so we just warn
        }

        // Verify factory contract functionality
        const factoryWorking = await verifyFactoryContract(ethersProvider);
        if (!factoryWorking) {
            throw new Error(
                'Factory contract verification failed. The contract may not be functioning properly.'
            );
        }
    };

    const validateJury = async (ethersProvider: ethers.BrowserProvider) => {
        // Get the authorized jury addresses (simplified for hackathon)
        const juryAddresses = getAuthorizedJuryAddresses();

        // Verify the jury address is actually authorized
        const isJuryAuthorized = await isAuthorizedJuror(ethersProvider, juryAddresses[0]);

        if (!isJuryAuthorized) {
            throw new Error(
                `Jury address ${juryAddresses[0]} is not authorized on the contract. Please contact the contract owner to authorize this address.`
            );
        }

        return juryAddresses;
    };

    const createContractMilestones = (data: ProjectFormData, juryAddresses: string[]) =>
        data.milestones.map(milestone =>
            createMilestoneData(
                milestone.description,
                parseUSDCAmount(milestone.fundingAmount),
                dateToUnixTimestamp(new Date(milestone.deadline)),
                [juryAddresses[0], juryAddresses[0], juryAddresses[0]] as [string, string, string]
            )
        );

    const handleSubmit = async (data: ProjectFormData, connectedWallet: ConnectedWallet) => {
        setIsSubmitting(true);
        setTransactionHash(null);

        try {
            validateSubmission(data);

            // Get signer from connected wallet
            const provider = await connectedWallet.getEthereumProvider();
            const ethersProvider = new ethers.BrowserProvider(provider);
            const signer = await ethersProvider.getSigner();

            await validateContracts(ethersProvider);
            const juryAddresses = await validateJury(ethersProvider);

            // Prepare milestone data for smart contract
            const contractMilestones = createContractMilestones(data, juryAddresses);

            // Prepare contract parameters
            const contractParams: CreateFundingRoundParams = {
                tokenAddress: CONTRACTS.USDC_ADDRESS,
                targetAmount: parseUSDCAmount(data.fundingGoal),
                fundingDeadline: dateToUnixTimestamp(new Date(data.fundingDeadline)),
                milestones: contractMilestones,
            };

            // Test the contract call first to get better error information
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
            // Enhanced error reporting
            if (error instanceof Error) {
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

    return {
        isSubmitting,
        transactionHash,
        handleSubmit,
    };
};
