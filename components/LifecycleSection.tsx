export default function LifecycleSection() {
  const stages = [
    { num: "01", title: "Install", desc: "Single binary or module setup." },
    { num: "02", title: "Report", desc: "Specs auto-detected." },
    { num: "03", title: "Match", desc: "Job pairing in ms." },
    { num: "04", title: "Escrow", desc: "Funds locked on-chain." },
    { num: "05", title: "Execute", desc: "Sandboxed task running." },
    { num: "06", title: "Verify", desc: "Proof of work validation." },
    { num: "07", title: "Payment", desc: "Instant wallet release." },
  ];

  const delays = ["", "delay-75", "delay-100", "delay-150", "delay-200", "delay-300", "delay-500"];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12">Seven-Stage Lifecycle</h2>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {stages.map((stage, index) => (
            <div key={index} className="group relative">
              <div className={`h-1 w-full bg-gray-800 mb-4 group-hover:bg-white transition-colors duration-500 ${delays[index]}`}></div>
              <div className="text-xs font-mono text-gray-500 mb-2">{stage.num}</div>
              <div className={`font-semibold text-sm ${index === 6 ? "text-white" : ""}`}>{stage.title}</div>
              <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {stage.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

