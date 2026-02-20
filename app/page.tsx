"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "./landing/sections/Navigation";
import HeroSection from "./landing/sections/HeroSection";
import ComputeCardSection from "./landing/sections/ComputeCardSection";
import HowItWorksSection from "./landing/sections/HowItWorksSection";
import UseCasesSection from "./landing/sections/UseCasesSection";
import ProviderSpotlightSection from "./landing/sections/ProviderSpotlightSection";
import EnterpriseSpotlightSection from "./landing/sections/EnterpriseSpotlightSection";
import StatsSection from "./landing/sections/StatsSection";
import CompetitiveEdgeSection from "./landing/sections/CompetitiveEdgeSection";
import ContactSection from "./landing/sections/ContactSection";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="relative bg-white min-h-screen lp-body">
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
