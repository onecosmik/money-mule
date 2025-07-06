'use client';

import { MainLayout } from '@/components/templates/main-layout';

import { FeaturesSection } from '../components/organisms/landing/FeaturesSection';
import { FinalCTASection } from '../components/organisms/landing/FinalCTASection';
import { HeroSection } from '../components/organisms/landing/HeroSection';
import { LogoNavbar } from '../components/organisms/landing/LogoNavbar';
import { PricingSection } from '../components/organisms/landing/PricingSection';
import { ProblemSection } from '../components/organisms/landing/ProblemSection';

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
