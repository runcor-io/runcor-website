"use client";

import { useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Globe, Shield, Wallet } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function EnterpriseSpotlightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        photoRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: photoRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const features = [
    { icon: Wallet, title: "Local currency payments", desc: "No forex risk or fees" },
    { icon: Globe, title: "Low latency", desc: "Under 50ms on local networks" },
    { icon: Shield, title: "Data sovereignty", desc: "Data never leaves Africa" },
  ];

  return (
    <section ref={sectionRef} className="lp-section-spacing lp-bg-section-alt">
      <div className="lp-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div ref={textRef}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Scale without the <span className="lp-text-gradient-orange">cloud bill</span>
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Upload data and scripts, track progress in real time, and pay in local currency.
              No forex. No long-term contracts.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-white border border-gray-200 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{feature.title}</p>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/auth"
              className="lp-btn-primary"
            >
              Post a job
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Photo */}
          <div ref={photoRef}>
            <div className="relative rounded-lg overflow-hidden aspect-[4/3]">
              <img
                src="/enterprise_office.jpg"
                alt="Professional in modern office"
                className="w-full h-full object-cover"
              />

              {/* Floating stat card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="lp-label-mono mb-1">Cost savings</p>
                    <p className="text-2xl font-bold lp-text-gradient-orange">60% less</p>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
