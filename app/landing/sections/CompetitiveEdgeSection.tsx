"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const comparisonData = [
  {
    factor: "Pricing",
    runcor: "Local currency, no forex risk",
    cloud: "USD/EUR, volatile rates",
  },
  {
    factor: "Latency",
    runcor: "Local network, <50ms",
    cloud: "International, 200-400ms",
  },
  {
    factor: "Data Sovereignty",
    runcor: "Data never leaves Africa",
    cloud: "Data stored overseas",
  },
  {
    factor: "Cost",
    runcor: "40-60% cheaper",
    cloud: "Premium pricing",
  },
  {
    factor: "Community Impact",
    runcor: "Income for African students",
    cloud: "Profits leave continent",
  },
];

const trustLogos = [
  "TechStars",
  "Y Combinator",
  "Google",
  "Microsoft",
  "AWS",
  "Flutterwave",
];

export default function CompetitiveEdgeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        tableRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: tableRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        logosRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: logosRef.current,
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
        {/* Headline */}
        <h2
          ref={headlineRef}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-12"
        >
          Why <span className="lp-text-gradient-orange">RunCor</span> wins
        </h2>

        {/* Comparison Table */}
        <div
          ref={tableRef}
          className="bg-white rounded-lg lp-shadow-subtle overflow-hidden mb-12"
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 p-4 md:p-6 border-b border-gray-100 bg-gray-50">
            <div className="lp-label-mono">Factor</div>
            <div className="lp-label-mono text-center text-gray-900">RunCor</div>
            <div className="lp-label-mono text-center">International Cloud</div>
          </div>

          {/* Table Rows */}
          {comparisonData.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-4 p-4 md:p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900 flex items-center">
                {row.factor}
              </div>
              <div className="text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{row.runcor}</span>
              </div>
              <div className="text-center flex items-center justify-center gap-2">
                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500 text-sm">{row.cloud}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Logos */}
        <div ref={logosRef} className="text-center">
          <p className="lp-label-mono mb-6">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {trustLogos.map((logo, index) => (
              <div key={index} className="text-gray-400 text-sm font-medium">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
