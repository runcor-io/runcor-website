import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TwoPathsSection from "@/components/TwoPathsSection";
import LifecycleSection from "@/components/LifecycleSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import TargetDevicesSection from "@/components/TargetDevicesSection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <TwoPathsSection />
      <LifecycleSection />
      <ArchitectureSection />
      <TargetDevicesSection />
    </main>
  );
}

