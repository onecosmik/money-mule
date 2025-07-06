export interface Milestone {
    title: string;
    deadline: string;
    completed: boolean;
    description: string;
    completedDate?: string;
    progress?: number;
}

export interface ProjectUpdate {
    date: string;
    title: string;
    content: string;
    type: 'milestone' | 'update';
}

export interface ProjectDetails {
    id: number;
    name: string;
    description: string;
    longDescription: string;
    website: string;
    fundingGoal: number;
    currentFunding: number;
    fundingDeadline: string;
    founderAddress: string;
    founderName: string;
    location: string;
    category: string;
    backers: number;
    milestones: Milestone[];
    coverImage: string;
    galleryImages: string[];
    status: 'active' | 'funding_complete' | 'completed';
    viabilityScore: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    teamSize: number;
    updates: ProjectUpdate[];
}

export const mockProjectDetails: Record<string, ProjectDetails> = {
    '0x1234567890123456789012345678901234567890': {
        id: 1,
        name: 'Local Food Delivery Network',
        description:
            'Connecting local farmers with consumers through a sustainable delivery platform',
        longDescription: `Our Local Food Delivery Network aims to revolutionize how communities access fresh, locally-sourced food. By connecting farmers directly with consumers, we eliminate intermediaries and ensure fair pricing for both parties.

The platform features real-time inventory management, route optimization for delivery drivers, and a community rating system that helps build trust between farmers and consumers. We're committed to supporting local economies while promoting sustainable agriculture practices.`,
        website: 'https://localfoodnetwork.com',
        fundingGoal: 25000,
        currentFunding: 12500,
        fundingDeadline: '2024-06-15',
        founderAddress: '0x1234567890123456789012345678901234567890',
        founderName: 'Sarah Johnson',
        location: 'Portland, Oregon',
        category: 'Food & Agriculture',
        backers: 147,
        milestones: [
            {
                title: 'Platform Development',
                deadline: '2024-03-15',
                completed: true,
                description: 'Build core platform infrastructure and user interfaces',
                completedDate: '2024-03-12',
            },
            {
                title: 'Farmer Onboarding',
                deadline: '2024-04-30',
                completed: false,
                description: 'Recruit and onboard 50 local farmers to the platform',
                progress: 65,
            },
            {
                title: 'Market Launch',
                deadline: '2024-06-01',
                completed: false,
                description: 'Launch public beta and begin operations',
                progress: 20,
            },
        ],
        coverImage:
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
        galleryImages: [
            'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop',
        ],
        status: 'active',
        viabilityScore: 85,
        riskLevel: 'Medium',
        teamSize: 4,
        updates: [
            {
                date: '2024-03-12',
                title: 'Platform Development Complete!',
                content:
                    "We've successfully completed our platform development milestone ahead of schedule. The core infrastructure is now live and ready for farmer onboarding.",
                type: 'milestone',
            },
            {
                date: '2024-03-01',
                title: 'Partnership with Local Farms',
                content:
                    'Excited to announce partnerships with 3 major local farms who will be our launch partners.',
                type: 'update',
            },
        ],
    },
    '0x2345678901234567890123456789012345678901': {
        id: 2,
        name: 'Community Learning Platform',
        description: 'Online platform for skill-sharing and community education initiatives',
        longDescription: `The Community Learning Platform democratizes education by enabling anyone to teach and learn from their community. Our platform focuses on practical skills, local knowledge, and peer-to-peer learning.

We believe that everyone has something valuable to teach, and everyone can benefit from learning new skills. Our platform makes it easy to find local experts, schedule learning sessions, and track progress in a supportive community environment.`,
        website: 'https://communitylearn.com',
        fundingGoal: 15000,
        currentFunding: 8000,
        fundingDeadline: '2024-08-20',
        founderAddress: '0x2345678901234567890123456789012345678901',
        founderName: 'Michael Chen',
        location: 'Austin, Texas',
        category: 'Education & Learning',
        backers: 89,
        milestones: [
            {
                title: 'Content Creation',
                deadline: '2024-04-01',
                completed: true,
                description: 'Develop initial course content and learning materials',
                completedDate: '2024-03-28',
            },
            {
                title: 'User Interface',
                deadline: '2024-05-15',
                completed: false,
                description: 'Build intuitive user interface and experience',
                progress: 45,
            },
            {
                title: 'Beta Testing',
                deadline: '2024-07-01',
                completed: false,
                description: 'Conduct comprehensive beta testing with 100 users',
                progress: 10,
            },
        ],
        coverImage:
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
        galleryImages: [
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
        ],
        status: 'active',
        viabilityScore: 92,
        riskLevel: 'Low',
        teamSize: 3,
        updates: [
            {
                date: '2024-03-28',
                title: 'Content Creation Milestone Reached',
                content:
                    "We've successfully created our initial course library with 25 different skill categories.",
                type: 'milestone',
            },
        ],
    },
    '0x3456789012345678901234567890123456789012': {
        id: 3,
        name: 'Eco-Friendly Packaging Solutions',
        description: 'Sustainable packaging alternatives for small businesses and local markets',
        longDescription: `Our mission is to provide affordable, sustainable packaging solutions that help small businesses reduce their environmental impact without breaking the bank.

We've developed innovative packaging materials made from agricultural waste and renewable resources. Our solutions are 100% biodegradable, cost-effective, and designed to meet the needs of small businesses and local markets.`,
        website: 'https://ecopackaging.com',
        fundingGoal: 35000,
        currentFunding: 28000,
        fundingDeadline: '2024-05-30',
        founderAddress: '0x3456789012345678901234567890123456789012',
        founderName: 'Elena Rodriguez',
        location: 'San Francisco, California',
        category: 'Sustainability',
        backers: 203,
        milestones: [
            {
                title: 'Material Research',
                deadline: '2024-02-15',
                completed: true,
                description: 'Complete R&D for biodegradable materials',
                completedDate: '2024-02-10',
            },
            {
                title: 'Supplier Partnerships',
                deadline: '2024-04-01',
                completed: true,
                description: 'Establish partnerships with material suppliers',
                completedDate: '2024-03-25',
            },
            {
                title: 'Production Launch',
                deadline: '2024-05-20',
                completed: false,
                description: 'Begin commercial production and distribution',
                progress: 80,
            },
        ],
        coverImage:
            'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=400&fit=crop',
        galleryImages: [
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
        ],
        status: 'funding_complete',
        viabilityScore: 78,
        riskLevel: 'Medium',
        teamSize: 6,
        updates: [
            {
                date: '2024-03-25',
                title: 'Supplier Partnerships Secured',
                content:
                    "We've successfully established partnerships with 5 key suppliers, ensuring stable material supply for production.",
                type: 'milestone',
            },
        ],
    },
};
