import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StatItemProps {
  value: string;
  label: string;
  isAnimated?: boolean;
}

function StatItem({ value, label, isAnimated = false }: StatItemProps) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    if (!isAnimated) return;
    
    const interval = setInterval(() => {
      const numValue = parseInt(value.replace(/[^0-9]/g, ''));
      const variation = Math.floor(Math.random() * 5) - 2;
      const newValue = Math.max(0, numValue + variation);
      
      if (value.includes('₦')) {
        setDisplayValue(`₦${newValue}M+`);
      } else if (value.includes(',')) {
        setDisplayValue(`${newValue.toLocaleString()}+`);
      } else {
        setDisplayValue(newValue.toLocaleString());
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [value, isAnimated]);

  return (
    <div className="text-center">
      <p className="stat-number text-4xl md:text-5xl font-bold text-gray-900 mb-2">
        {displayValue}
      </p>
      <p className="label-mono">
        {label}
      </p>
    </div>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            onEnter: () => setIsInView(true),
            onLeave: () => setIsInView(false),
            onEnterBack: () => setIsInView(true),
            onLeaveBack: () => setIsInView(false),
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const stats = [
    { value: '1,247', label: 'Providers online', animated: true },
    { value: '892,000', label: 'Jobs completed', animated: false },
    { value: '₦42M', label: 'Money earned', animated: true },
  ];

  return (
    <section ref={sectionRef} className="section-spacing bg-white">
      <div className="container-ikea">
        <div
          ref={cardRef}
          className="max-w-3xl mx-auto bg-gray-50 rounded-lg p-8 md:p-12"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <StatItem
                key={index}
                value={stat.value}
                label={stat.label}
                isAnimated={isInView && stat.animated}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-gray-200" />

          {/* Bottom Info */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm text-center md:text-left">
              Join the growing network of African compute providers
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="label-mono">
                Updated in real time
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
