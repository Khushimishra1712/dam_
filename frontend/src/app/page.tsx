
"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Play, AlertTriangle, ShieldCheck, Download, Layers } from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-slate-900 flex items-center justify-center text-slate-400 rounded-xl border border-slate-700">
      Loading GIS Map Engine...
    </div>
  ),
});

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hazardUrl, setHazardUrl] = useState<string | null>(null);
  const [damName, setDamName] = useState("Rishi Ganga");
  const [damCoords] = useState<[number, number]>([79.52, 30.48]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTrigger = () => {
    setLoading(true);
    setTimeout(() => {
      setHazardUrl("/hazard.geojson");
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <aside className="w-96 h-full bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shadow-2xl z-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-sky-400 tracking-tight flex items-center gap-2">
              <AlertTriangle className="text-amber-400 h-5 w-5" />
              HydroSim 2D
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Dam-Break Flood Inundation & Hazard Mapping
            </p>
          </div>

          {mounted && (
            <>
              <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/50 space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Dam</label>
                <input
                  type="text"
                  value={damName}
                  onChange={(e) => setDamName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Lon: {damCoords[0]}</span>
                  <span>Lat: {damCoords[1]}</span>
                </div>
              </div>

              <button
                onClick={handleTrigger}
                disabled={loading}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition duration-150 shadow-md cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                {loading ? "Running 2D Solver..." : "Trigger Simulation"}
              </button>
            </>
          )}

          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 text-xs space-y-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-sky-400" /> Hazard Classification
            </span>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> High (Depth &gt; 2.0m)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Medium (Depth 0.5 - 2.0m)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Low (Depth &lt; 0.5m)</div>
          </div>

          {hazardUrl && (
            <a
              href="/hazard.geojson"
              download="hazard_output.geojson"
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-200 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Download className="h-3.5 w-3.5" /> Export Hazard GeoJSON
            </a>
          )}
        </div>

        <div className="border-t border-slate-800 pt-4 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Engine Ready</span>
          <span>FastAPI + MapLibre</span>
        </div>
      </aside>

      <section className="flex-1 h-full p-4 relative">
        <Map damCoordinates={damCoords} geojsonUrl={hazardUrl} />
      </section>
    </main>
  );
}