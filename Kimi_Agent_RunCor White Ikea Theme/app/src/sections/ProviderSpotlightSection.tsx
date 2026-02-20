import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Download, Clock, Zap, Smartphone } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ProviderSpotlightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        photoRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: photoRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    { icon: Download, title: 'Lightweight agent', desc: 'Less than 100MB download' },
    { icon: Clock, title: 'Runs when idle', desc: 'Never interrupts your work' },
    { icon: Zap, title: 'Instant payouts', desc: 'Mobile money to your phone' },
  ];

  return (
    <section ref={sectionRef} id="providers" className="section-spacing bg-white">
      <div className="container-ikea">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Photo */}
          <div ref={photoRef} className="order-2 lg:order-1">
            <div className="relative rounded-lg overflow-hidden aspect-[4/3]">
              <img
                src="/provider_desk.jpg"
                alt="Student with gaming PC"
                className="w-full h-full object-cover"
              />
              
              {/* Floating stat card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="label-mono mb-1">Earnings this month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₦24,500
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div ref={textRef} className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Earn on your <span className="text-gradient-orange">own hardware</span>
            </h2>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Install the agent, keep your PC online, and get paid via mobile money. 
              No fees to join.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
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
            <button
              onClick={scrollToContact}
              className="btn-primary flex items-center gap-2"
            >
              Become a provider
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
