"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ComputeCardSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="lp-section-spacing lp-bg-section-alt">
      <div className="lp-container">
        <div ref={cardRef} className="max-w-3xl mx-auto">
          {/* Main Card */}
          <div className="lp-card lp-shadow-subtle text-center">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                RunCor Compute
              </h2>
              <span className="lp-label-mono">Version 2.4</span>
            </div>

            {/* Simple Illustration */}
            <div className="py-8 flex justify-center">
              <svg viewBox="0 0 200 120" className="w-48 h-28">
                {/* Central node */}
                <circle cx="100" cy="60" r="20" fill="#F5F5F5" stroke="#EA580C" strokeWidth="2" />
                <circle cx="100" cy="60" r="8" fill="#EA580C" />

                {/* Connected nodes */}
                <circle cx="40" cy="30" r="12" fill="#F5F5F5" stroke="#E5E5E5" strokeWidth="1.5" />
                <circle cx="160" cy="30" r="12" fill="#F5F5F5" stroke="#E5E5E5" strokeWidth="1.5" />
                <circle cx="40" cy="90" r="12" fill="#F5F5F5" stroke="#E5E5E5" strokeWidth="1.5" />
                <circle cx="160" cy="90" r="12" fill="#F5F5F5" stroke="#E5E5E5" strokeWidth="1.5" />

                {/* Connection lines */}
                <line x1="52" y1="38" x2="80" y2="52" stroke="#E5E5E5" strokeWidth="1.5" />
                <line x1="148" y1="38" x2="120" y2="52" stroke="#E5E5E5" strokeWidth="1.5" />
                <line x1="52" y1="82" x2="80" y2="68" stroke="#E5E5E5" strokeWidth="1.5" />
                <line x1="148" y1="82" x2="120" y2="68" stroke="#E5E5E5" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Caption */}
            <p className="text-gray-600 mb-6">
              Rent compute by the hour. Scale down to zero. Pay in local currency.
            </p>

            {/* CTA */}
            <button className="lp-btn-secondary text-sm">
              Read the docs
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
