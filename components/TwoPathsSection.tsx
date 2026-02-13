import { Server, Box, Check } from "lucide-react";

export default function TwoPathsSection() {
  return (
    <section className="py-24 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Two Paths. One Backend.</h2>
          <p className="text-gray-400 max-w-2xl">Whether you operate a digital data center or a physical
            fabrication shop, RunCor integrates seamlessly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-8 md:p-12 flex flex-col justify-between h-[500px] relative group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Server className="w-32 h-32 stroke-1" />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border border-white/20 text-xs font-mono mb-6">PATH 01</div>
              <h3 className="text-3xl font-bold mb-4">Software Agent</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Ultra-lightweight binary deployment. Invisible background operation for GPU servers, CPU
                clusters, and cloud instances.
              </p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4" /> Single binary installation
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4" /> Container-based sandboxing
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4" /> Auto-discovery of specs
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <button className="btn-pill-secondary text-xs">Download Agent</button>
            </div>
          </div>

          <div className="card p-8 md:p-12 flex flex-col justify-between h-[500px] relative group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Box className="w-32 h-32 stroke-1" />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full border border-white/20 text-xs font-mono mb-6">PATH 02</div>
              <h3 className="text-3xl font-bold mb-4">Hardware Module</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Physical add-on bridge for industrial machines. Translates platform commands to G-code, ROS,
                or MQTT.
              </p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4" /> Connects via USB/Serial/GPIO
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4" /> Built-in safety interlocks
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4" /> $25-50 BOM cost
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <button className="btn-pill-secondary text-xs">View Schematics</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

