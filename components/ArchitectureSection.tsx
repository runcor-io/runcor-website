import { Shield, Zap, Link as LinkIcon, Lock } from "lucide-react";

export default function ArchitectureSection() {
  return (
    <section className="py-24 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold">Pristine Architecture</h2>
            <p className="text-gray-400 mt-2">Zero trust. Invisible security. Military-grade defense.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 border border-gray-800 rounded-full px-4 py-2">
              <Lock className="w-3 h-3" />
              TLS 1.3 • MTLS • TPM ATTESTATION
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Sandboxed Execution</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every job runs in isolated Docker containers with read-only filesystems. Your host OS remains
              untouched and invisible to the workload.
            </p>
          </div>

          <div className="card p-8">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Hardware Isolation</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Physical E-stop circuits, motion bounds, and safety interlocks ensure machines operate strictly
              within safe physical parameters.
            </p>
          </div>

          <div className="card p-8">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Smart Escrow</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Funds are locked in smart contracts before work begins. Payment is conditionally released only
              upon cryptographic verification.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

