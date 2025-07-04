'use client';

import { MainLayout } from '@/components/templates/main-layout';

import { FeaturesSection } from './components/landing/FeaturesSection';
import { FinalCTASection } from './components/landing/FinalCTASection';
import { HeroSection } from './components/landing/HeroSection';
import { LogoNavbar } from './components/landing/LogoNavbar';
import { PricingSection } from './components/landing/PricingSection';
import { ProblemSection } from './components/landing/ProblemSection';

export default function Home() {
    return (
        <MainLayout>
            <LogoNavbar />
            <main className='flex flex-col items-center w-full min-h-screen bg-green-50'>
                <HeroSection />
                <ProblemSection />
                <FeaturesSection />
                <PricingSection />
                <FinalCTASection />
            </main>
        </MainLayout>
    );
}
