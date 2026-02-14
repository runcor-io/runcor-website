import Link from "next/link";
import { ArrowLeft, Clock, Rocket } from "lucide-react";

export const metadata = {
  title: "Coming Soon | RunCor",
  description: "This feature is under development. Stay tuned for updates.",
};

export default function ComingSoon() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 machine-visual">
        <div className="machine-grid" />
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-mono text-gray-300">IN DEVELOPMENT</span>
        </div>

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center relative">
            <Rocket className="w-10 h-10 text-white" />
            <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Coming <span className="text-gray-500">Soon</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-400 mb-4 leading-relaxed">
          We&apos;re building something extraordinary.
        </p>
        <p className="text-gray-500 mb-12 max-w-md mx-auto">
          This feature is currently under active development. 
          Join our early access list to be the first to know when it launches.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn-pill">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/coming-soon" className="btn-pill-secondary">
            Get Notified
          </Link>
        </div>

        {/* Status Indicator */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Systems Operational
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-600" />
            <span>RunCor © 2026</span>
          </div>
        </div>
      </div>
    </main>
  );
}
