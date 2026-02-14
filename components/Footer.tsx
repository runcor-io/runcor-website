import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-[#111]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/auth" className="hover:text-white transition-colors">
              Get Started
            </Link>
            <Link href="/contractor" className="hover:text-white transition-colors">
              Contractor Portal
            </Link>
            <Link href="/install" className="hover:text-white transition-colors">
              Download Agent
            </Link>
          </div>
          <p className="text-gray-500 text-sm">Runcor © 2026. All systems nominal.</p>
        </div>
      </div>
    </footer>
  );
}
