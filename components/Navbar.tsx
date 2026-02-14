import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/runcor-logo-512px.png"
            alt="RC Logo"
            width={32}
            height={32}
            className="object-cover rounded-md"
          />
          <span className="font-bold text-xl tracking-tight">RUNCOR</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        </div>

        <div className="flex items-center gap-4">
          <Link href="/coming-soon" className="text-sm font-medium hover:text-white transition-colors text-gray-400">
            Log In
          </Link>
          <Link href="/coming-soon" className="btn-pill">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

