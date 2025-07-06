export const VALIDATION_LIMITS = {
    MIN_FUNDING_GOAL: 1000,
    MAX_FUNDING_GOAL: 1000000,
    MIN_MILESTONES: 1,
    MAX_MILESTONES: 10,
} as const;

export const CATEGORIES = [
    'Technology',
    'Healthcare',
    'Education',
    'Environment',
    'Finance',
    'Entertainment',
    'Social Impact',
    'Other',
] as const;

export const ANIMATIONS = {
    fadeInUp: {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
    },
} as const;
