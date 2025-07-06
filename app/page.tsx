'use client';

import { MainLayout } from '@/components/templates/main-layout';

import { FeaturesSection } from '../components/organisms/landing/FeaturesSection';
import { FinalCTASection } from '../components/organisms/landing/FinalCTASection';
import { HeroSection } from '../components/organisms/landing/HeroSection';
import { HowItWorksSection } from '../components/organisms/landing/HowItWorksSection';
import { PricingSection } from '../components/organisms/landing/PricingSection';
import { ProblemSection } from '../components/organisms/landing/ProblemSection';

export default function Home() {
    return (
        <MainLayout>
            <main className='flex flex-col items-center w-full min-h-screen'>
                <HeroSection />
                <ProblemSection />
                <FeaturesSection />
                <HowItWorksSection />
                <PricingSection />
                <FinalCTASection />
            </main>
        </MainLayout>
    );
}
