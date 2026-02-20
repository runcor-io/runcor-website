"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "How it works", id: "how-it-works" },
    { label: "Use cases", id: "use-cases" },
    { label: "Providers", id: "providers" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-gray-200"
          : "bg-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/runcor-logo-512px.png"
            alt="RunCor"
            className="w-8 h-8 object-contain"
          />
          <span className="text-gray-900 font-bold text-xl tracking-tight">
            RunCor
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA Button - Link to Sign In */}
        <div className="hidden md:block">
          <Link
            href="/auth"
            className="lp-btn-primary text-sm"
          >
            Join Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium text-left"
              >
                {link.label}
              </button>
            ))}
            <Link
              href="/auth"
              className="lp-btn-primary w-full mt-2 text-center justify-center"
            >
              Join Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
