"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Landmark,
  Sprout,
  HeartPulse,
  Clapperboard,
  Brain,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const industries = [
  {
    icon: Landmark,
    title: "Fintech",
    subtitle: "Batch KYC / OCR",
    description: "Process thousands of ID verifications overnight.",
    metric: "10,000 docs processed",
  },
  {
    icon: Sprout,
    title: "AgTech",
    subtitle: "Satellite + Drone Analysis",
    description: "Crop health inference at a fraction of cloud cost.",
    metric: "50,000 images/day",
  },
  {
    icon: HeartPulse,
    title: "HealthTech",
    subtitle: "Medical Imaging",
    description: "Preprocessing that stays local.",
    metric: "5,000 scans/day",
  },
  {
    icon: Clapperboard,
    title: "Animation",
    subtitle: "Distributed Rendering",
    description: "Frame rendering across provider nodes.",
    metric: "900 frames in 3 hours",
  },
  {
    icon: Brain,
    title: "AI / Data",
    subtitle: "Data Labeling Prep",
    description: "Augment and QA datasets before human review.",
    metric: "400,000 images/night",
  },
];

export default function UseCasesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      cardRefs.current.forEach((card, i) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              delay: i * 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="use-cases" className="lp-section-spacing lp-bg-section-alt">
      <div className="lp-container">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Built for <span className="lp-text-gradient-orange">African teams</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Fintech, AgTech, HealthTech, Animation, AI/Data
          </p>
        </div>

        {/* Industry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, index) => (
            <div
              key={index}
              ref={(el) => { cardRefs.current[index] = el; }}
              className="lp-card lp-shadow-subtle hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center mb-4">
                <industry.icon className="w-5 h-5 text-gray-700" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {industry.title}
              </h3>
              <p className="text-sm font-medium text-gray-500 mb-3">
                {industry.subtitle}
              </p>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">{industry.description}</p>

              {/* Metric */}
              <div className="pt-4 border-t border-gray-100">
                <span className="lp-label-mono text-gray-400">{industry.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
