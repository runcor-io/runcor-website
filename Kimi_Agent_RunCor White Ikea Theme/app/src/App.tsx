import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './sections/Navigation';
import HeroSection from './sections/HeroSection';
import ComputeCardSection from './sections/ComputeCardSection';
import HowItWorksSection from './sections/HowItWorksSection';
import UseCasesSection from './sections/UseCasesSection';
import ProviderSpotlightSection from './sections/ProviderSpotlightSection';
import EnterpriseSpotlightSection from './sections/EnterpriseSpotlightSection';
import StatsSection from './sections/StatsSection';
import CompetitiveEdgeSection from './sections/CompetitiveEdgeSection';
import ContactSection from './sections/ContactSection';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();
    
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div className="relative bg-white min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* Sections */}
      <main className="relative">
        <HeroSection />
        <ComputeCardSection />
        <HowItWorksSection />
        <UseCasesSection />
        <ProviderSpotlightSection />
        <EnterpriseSpotlightSection />
        <StatsSection />
        <CompetitiveEdgeSection />
        <ContactSection />
      </main>
    </div>
  );
}

export default App;
