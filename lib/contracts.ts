import { ethers } from 'ethers';

import { CONTRACTS, DEFAULT_JURY_ADDRESSES } from './constants';

// MoneyMuleFactory ABI
export const MONEY_MULE_FACTORY_ABI = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'targetAmount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'fundingDeadline',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'string',
                        name: 'description',
                        type: 'string',
                    },
                    {
                        internalType: 'uint256',
                        name: 'fundingAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'deadline',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address[3]',
                        name: 'juryWallets',
                        type: 'address[3]',
                    },
                ],
                internalType: 'struct MoneyMuleFactory.MilestoneData[]',
                name: 'milestones',
                type: 'tuple[]',
            },
        ],
        name: 'createFundingRound',
        outputs: [
            {
                internalType: 'uint256',
                name: 'roundId',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'roundContract',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'founder',
                type: 'address',
            },
        ],
        name: 'getFounderRounds',
        outputs: [
            {
                internalType: 'uint256[]',
                name: '',
                type: 'uint256[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getNextRoundId',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'roundId',
                type: 'uint256',
            },
        ],
        name: 'getRoundContract',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'juror',
                type: 'address',
            },
        ],
        name: 'isAuthorizedJuror',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'juror',
                type: 'address',
            },
        ],
        name: 'authorizeJuror',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getTotalRounds',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'roundId',
                type: 'uint256',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'roundContract',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'founder',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'token',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'targetAmount',
                type: 'uint256',
            },
        ],
        name: 'RoundCreated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'juror',
                type: 'address',
            },
        ],
        name: 'JurorAuthorized',
        type: 'event',
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

export interface MilestoneData {
    description: string;
    fundingAmount: bigint;
    deadline: number;
    juryWallets: [string, string, string];
}

export interface CreateFundingRoundParams {
    tokenAddress: string;
    targetAmount: bigint;
    fundingDeadline: number;
    milestones: MilestoneData[];
}

export interface CreateFundingRoundResult {
    roundId: bigint;
    roundContract: string;
    transactionHash: string;
}

/**
 * Get the factory contract instance
 */
export function getFactoryContract(signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, MONEY_MULE_FACTORY_ABI, signerOrProvider);
}

/**
 * Create a new funding round
 */
export async function createFundingRound(
    signer: ethers.Signer,
    params: CreateFundingRoundParams
): Promise<CreateFundingRoundResult> {
    const factory = getFactoryContract(signer);

    // Convert milestone data to contract format
    const milestoneData = params.milestones.map(milestone => ({
        description: milestone.description,
        fundingAmount: milestone.fundingAmount,
        deadline: milestone.deadline,
        juryWallets: milestone.juryWallets,
    }));

    // Call the contract function
    const tx = (await factory.createFundingRound(
        params.tokenAddress,
        params.targetAmount,
        params.fundingDeadline,
        milestoneData
    )) as ethers.ContractTransactionResponse;

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    if (!receipt) {
        throw new Error('Transaction failed to be mined');
    }

    // Find the RoundCreated event
    const roundCreatedEvent = receipt.logs.find((log: ethers.Log) => {
        try {
            const parsed = factory.interface.parseLog(log);
            return parsed?.name === 'RoundCreated';
        } catch {
            return false;
        }
    });

    if (!roundCreatedEvent) {
        throw new Error('RoundCreated event not found in transaction receipt');
    }

    const parsedEvent = factory.interface.parseLog(roundCreatedEvent);
    const roundId = parsedEvent?.args?.roundId as bigint;
    const roundContract = parsedEvent?.args?.roundContract as string;

    return {
        roundId,
        roundContract,
        transactionHash: receipt.hash,
    };
}

/**
 * Get the next round ID
 */
export async function getNextRoundId(provider: ethers.Provider): Promise<bigint> {
    const factory = getFactoryContract(provider);
    return (await factory.getNextRoundId()) as bigint;
}

/**
 * Get rounds created by a founder
 */
export async function getFounderRounds(
    provider: ethers.Provider,
    founderAddress: string
): Promise<bigint[]> {
    const factory = getFactoryContract(provider);
    return (await factory.getFounderRounds(founderAddress)) as bigint[];
}

/**
 * Get the round contract address for a specific round ID
 */
export async function getRoundContract(
    provider: ethers.Provider,
    roundId: bigint
): Promise<string> {
    const factory = getFactoryContract(provider);
    return (await factory.getRoundContract(roundId)) as string;
}

/**
 * Helper function to parse USDC amount (6 decimals)
 */
export function parseUSDCAmount(amount: string): bigint {
    return ethers.parseUnits(amount, 6);
}

/**
 * Helper function to format USDC amount (6 decimals)
 */
export function formatUSDCAmount(amount: bigint): string {
    return ethers.formatUnits(amount, 6);
}

/**
 * Helper function to convert date to Unix timestamp
 */
export function dateToUnixTimestamp(date: Date): number {
    return Math.floor(date.getTime() / 1000);
}

/**
 * Helper function to create milestone data with default jury
 */
export function createMilestoneData(
    description: string,
    fundingAmount: bigint,
    deadline: number,
    juryWallets: [string, string, string] = [...DEFAULT_JURY_ADDRESSES] as [string, string, string]
): MilestoneData {
    return {
        description,
        fundingAmount,
        deadline,
        juryWallets,
    };
}

/**
 * Verify that the factory contract is properly deployed and accessible
 */
export async function verifyFactoryContract(provider: ethers.Provider): Promise<boolean> {
    try {
        const factory = getFactoryContract(provider);

        // Try to call a simple view function to verify the contract exists
        const nextRoundId = (await factory.getNextRoundId()) as bigint;
        console.log('Contract verification successful. Next round ID:', nextRoundId.toString());
        return true;
    } catch (error) {
        console.error('Contract verification failed:', error);
        return false;
    }
}

/**
 * Check if an address has any bytecode (i.e., is a contract)
 */
export async function isContract(provider: ethers.Provider, address: string): Promise<boolean> {
    try {
        const code = await provider.getCode(address);
        return code !== '0x';
    } catch (error) {
        console.error('Error checking if address is contract:', error);
        return false;
    }
}

/**
 * Check if an address is an authorized juror
 */
export async function isAuthorizedJuror(
    provider: ethers.Provider,
    jurorAddress: string
): Promise<boolean> {
    try {
        const factory = getFactoryContract(provider);
        const isAuthorized = (await factory.isAuthorizedJuror(jurorAddress)) as boolean;
        console.log(`Juror ${jurorAddress} is authorized:`, isAuthorized);
        return isAuthorized;
    } catch (error) {
        console.error('Error checking juror authorization:', error);
        return false;
    }
}

/**
 * Get jury addresses using the authorized address from constants
 */
export function getAuthorizedJuryAddresses(): [string, string, string] {
    // Use the first authorized address from the constants
    const authorizedAddress = '0xa6e4e006EeD9fEA0C378A42d32a033F4B4f4A15b';
    console.log(`Using authorized jury address: ${authorizedAddress}`);
    return [authorizedAddress, authorizedAddress, authorizedAddress];
}

/**
 * Test contract call to get more detailed error information
 */
export async function testCreateFundingRound(
    signer: ethers.Signer,
    params: CreateFundingRoundParams
): Promise<void> {
    const factory = getFactoryContract(signer);
    const { provider } = signer;

    if (!provider) {
        throw new Error('Provider not available');
    }

    // Convert milestone data to contract format
    const milestoneData = params.milestones.map(milestone => ({
        description: milestone.description,
        fundingAmount: milestone.fundingAmount,
        deadline: milestone.deadline,
        juryWallets: milestone.juryWallets,
    }));

    console.log('Testing contract call with parameters:', {
        tokenAddress: params.tokenAddress,
        targetAmount: params.targetAmount.toString(),
        fundingDeadline: params.fundingDeadline,
        milestonesCount: milestoneData.length,
        milestones: milestoneData.map((m, i) => ({
            index: i,
            description: m.description,
            fundingAmount: m.fundingAmount.toString(),
            deadline: m.deadline,
            juryWallets: m.juryWallets,
        })),
    });

    // Additional debugging: Check current block timestamp
    const currentBlock = await provider.getBlock('latest');
    console.log('Current block timestamp:', currentBlock?.timestamp);
    console.log('Funding deadline vs current time:', {
        fundingDeadline: params.fundingDeadline,
        currentTime: currentBlock?.timestamp || 0,
        isInFuture: params.fundingDeadline > (currentBlock?.timestamp || 0),
    });

    // Check total milestone funding
    const totalMilestoneFunding = milestoneData.reduce(
        (sum, m) => sum + m.fundingAmount,
        BigInt(0)
    );
    console.log('Milestone funding validation:', {
        totalMilestoneFunding: totalMilestoneFunding.toString(),
        targetAmount: params.targetAmount.toString(),
        areEqual: totalMilestoneFunding === params.targetAmount,
    });

    // Check each milestone deadline
    console.log('Milestone deadline validation:');
    milestoneData.forEach((milestone, i) => {
        const isValid = milestone.deadline > params.fundingDeadline;
        console.log(
            `Milestone ${i + 1}: deadline ${milestone.deadline} > funding ${params.fundingDeadline} = ${isValid}`
        );
    });

    // Check jury authorizations (parallel to avoid await in loops)
    console.log('Jury authorization validation:');
    const juryChecks = milestoneData.flatMap((milestone, i) =>
        milestone.juryWallets.map(async (juryWallet, j) => {
            try {
                const isAuthorized = (await factory.isAuthorizedJuror(juryWallet)) as boolean;
                console.log(
                    `Milestone ${i + 1}, Jury ${j + 1}: ${juryWallet} is authorized: ${isAuthorized}`
                );
                if (!isAuthorized) {
                    console.error(`❌ Jury wallet ${juryWallet} is not authorized!`);
                }
                return { milestone: i + 1, jury: j + 1, address: juryWallet, isAuthorized };
            } catch (error) {
                console.error(`Error checking jury authorization for ${juryWallet}:`, error);
                return { milestone: i + 1, jury: j + 1, address: juryWallet, isAuthorized: false };
            }
        })
    );

    // Wait for all jury checks to complete
    await Promise.all(juryChecks);

    // Check if the token address is valid
    console.log('Token validation:');
    try {
        const tokenCode = await provider.getCode(params.tokenAddress);
        console.log(`Token ${params.tokenAddress} is contract: ${tokenCode !== '0x'}`);
    } catch (error) {
        console.error('Error checking token contract:', error);
    }

    // Try to get the next round ID to make sure the factory is working
    try {
        const nextRoundId = (await factory.getNextRoundId()) as bigint;
        console.log('Factory working, next round ID:', nextRoundId.toString());
    } catch (error) {
        console.error('Error getting next round ID:', error);
    }

    // Check if the contract is paused
    try {
        const isPaused = (await factory.paused()) as boolean;
        console.log('🚨 Contract paused status:', isPaused);
        if (isPaused) {
            console.error(
                '❌ CONTRACT IS PAUSED! This is likely the root cause of the transaction failure.'
            );
            throw new Error(
                'The factory contract is currently paused. Contact the contract owner to unpause it.'
            );
        } else {
            console.log('✅ Contract is not paused, proceeding with gas estimation...');
        }
    } catch (error) {
        console.error('Error checking pause status:', error);
    }

    try {
        // Try to estimate gas first to get more detailed error
        console.log('Attempting gas estimation...');
        const gasEstimate = await factory.createFundingRound.estimateGas(
            params.tokenAddress,
            params.targetAmount,
            params.fundingDeadline,
            milestoneData
        );

        console.log('✅ Gas estimate successful:', gasEstimate.toString());
    } catch (error) {
        console.error('❌ Gas estimation failed - this is the root cause:', error);

        // Try to get more details about the error
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);

            // Check if this is a revert with reason
            if (error.message.includes('revert')) {
                console.error('Transaction would revert - checking individual validations...');
            }

            // Try with a very high gas limit to see if it's a gas issue
            console.log('Trying gas estimation with higher gas limit...');
            try {
                const gasEstimateHighLimit = await factory.createFundingRound.estimateGas(
                    params.tokenAddress,
                    params.targetAmount,
                    params.fundingDeadline,
                    milestoneData,
                    { gasLimit: 10000000 } // 10M gas limit
                );
                console.log(
                    '✅ Gas estimate with high limit successful:',
                    gasEstimateHighLimit.toString()
                );
            } catch (highGasError) {
                console.error('❌ Gas estimation failed even with high gas limit:', highGasError);

                // The issue is likely with contract deployment or MoneyMuleRound constructor
                console.error('🚨 LIKELY ISSUE: MoneyMuleRound contract deployment is failing!');
                console.error('Possible causes:');
                console.error('1. MoneyMuleRound contract not deployed on this network');
                console.error('2. MoneyMuleRound constructor has validation issues');
                console.error('3. Contract creation gas limits exceeded');
                console.error('4. Missing dependencies for MoneyMuleRound contract');
            }
        }

        throw error;
    }
}
