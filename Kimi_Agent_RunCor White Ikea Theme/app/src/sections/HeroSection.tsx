import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Briefcase } from 'lucide-react';

export default function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple fade-in on load
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white pt-20">
      <div ref={contentRef} className="container-ikea text-center py-16">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/runcor-logo-512px.png" 
            alt="RunCor" 
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Africa&apos;s Distributed<br />
          <span className="text-gradient-orange">Compute Network</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Connect idle student and gamer PCs to local enterprises. 
          Fast, affordable, and built for African teams.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => scrollToSection('providers')}
            className="btn-primary flex items-center gap-2 text-base"
          >
            Start Computing
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="btn-secondary flex items-center gap-2 text-base"
          >
            <Briefcase size={18} />
            Post a Job
          </button>
        </div>
      </div>
    </section>
  );
}
