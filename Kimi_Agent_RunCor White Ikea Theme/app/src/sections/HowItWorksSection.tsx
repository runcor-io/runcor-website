import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, Cpu, Wallet } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: Download,
    title: 'Install the agent',
    description: 'Detects hardware and lists your idle capacity.',
  },
  {
    icon: Cpu,
    title: 'Jobs run automatically',
    description: 'Your PC claims small tasks when idle.',
  },
  {
    icon: Wallet,
    title: 'Get paid',
    description: 'Mobile money payout for every completed job.',
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: leftRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      stepsRef.current.forEach((step, i) => {
        if (step) {
          gsap.fromTo(
            step,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              delay: i * 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: step,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="section-spacing bg-white">
      <div className="container-ikea">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Title Block */}
          <div ref={leftRef}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How it <span className="text-gradient-orange">works</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Providers install a lightweight agent. Contractors upload jobs. 
              RunCor matches, runs, and pays.
            </p>
          </div>

          {/* Right Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => { stepsRef.current[index] = el; }}
                className="flex items-start gap-5 p-5 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-white border border-gray-200 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
                <span className="flex-shrink-0 text-2xl font-bold text-gray-200">
                  0{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Flow */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="label-mono mb-4">Execution Flow</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded">
              Job Posted
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded">
              Split into chunks
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded">
              Nodes claim
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded">
              Docker execution
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 bg-gradient-orange text-white rounded">
              Results merged
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
