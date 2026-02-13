export default function TargetDevicesSection() {
  return (
    <section className="py-24 px-6 border-t border-[#111]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Target Device Categories</h2>

        <div className="overflow-hidden rounded-2xl border border-[#222]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0A0A0A] text-gray-400 font-medium">
              <tr>
                <th className="p-6 border-b border-[#222]">Compute</th>
                <th className="p-6 border-b border-[#222]">Manufacturing</th>
                <th className="p-6 border-b border-[#222]">Robotics</th>
                <th className="p-6 border-b border-[#222]">Edge / IoT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222] bg-black">
              <tr>
                <td className="p-6 text-gray-300">GPU Servers</td>
                <td className="p-6 text-gray-300">3D Printers</td>
                <td className="p-6 text-gray-300">Drones</td>
                <td className="p-6 text-gray-300">Sensor Networks</td>
              </tr>
              <tr>
                <td className="p-6 text-gray-300">CPU Clusters</td>
                <td className="p-6 text-gray-300">CNC Machines</td>
                <td className="p-6 text-gray-300">Robotic Arms</td>
                <td className="p-6 text-gray-300">Smart Devices</td>
              </tr>
              <tr>
                <td className="p-6 text-gray-300">Cloud Instances</td>
                <td className="p-6 text-gray-300">Laser Cutters</td>
                <td className="p-6 text-gray-300">Autonomous Vehicles</td>
                <td className="p-6 text-gray-300">Industrial Monitors</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-24 text-center">
          <h3 className="text-4xl font-bold mb-6">The backbone for the <br />autonomous machine
            economy.</h3>
          <div className="flex justify-center gap-4">
            <button className="btn-pill h-12">
              Get Early Access
            </button>
          </div>
          <p className="text-gray-500 mt-6 text-sm">Runcor © 2026. All systems nominal.</p>
        </div>
      </div>
    </section>
  );
}

