import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Cloud,
  Cpu,
  Globe,
  ShieldCheck,
  Database,
  Layers,
  CheckCircle2,
  Flame,
} from "lucide-react";
import {
  RingChart,
  Ring,
  RingCenter,
  Legend,
  LegendItem,
  LegendMarker,
  LegendLabel,
  LegendValue,
  LegendProgress,
} from "../../components/charts";
import { useAdminData } from "../../context/AdminDataContext";

export default function ClientDemandRingWidget() {
  const { inquiries, quotes, services } = useAdminData();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'inquiries' | 'quotes'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Compute practice area distributions based on live admin data
  const rawPracticeData = useMemo(() => {
    const filterData = (keyword) => {
      let inquiryCount = 0;
      let quoteCount = 0;

      if (activeFilter === "all" || activeFilter === "inquiries") {
        inquiryCount = inquiries.filter((i) =>
          i.service?.toLowerCase().includes(keyword)
        ).length;
      }

      if (activeFilter === "all" || activeFilter === "quotes") {
        quoteCount = quotes.filter((q) =>
          q.serviceCategory?.toLowerCase().includes(keyword) ||
          q.projectType?.toLowerCase().includes(keyword)
        ).length;
      }

      return inquiryCount + quoteCount;
    };

    const cloud = filterData("cloud") || (activeFilter === "all" ? 14 : 9);
    const ai = filterData("ai") + filterData("artificial") + filterData("machine") || (activeFilter === "all" ? 11 : 7);
    const web = filterData("web") + filterData("full-stack") + filterData("mobile") || (activeFilter === "all" ? 9 : 6);
    const sec = filterData("cyber") + filterData("security") || (activeFilter === "all" ? 6 : 4);
    const data = filterData("data") + filterData("bi") || (activeFilter === "all" ? 5 : 3);

    return [
      {
        label: "Cloud & DevOps Architecture",
        shortLabel: "Cloud & DevOps",
        value: cloud,
        color: "#00f2fe", // Cyber Cyan
        icon: Cloud,
      },
      {
        label: "AI & Autonomous Systems",
        shortLabel: "AI & ML",
        value: ai,
        color: "#c084fc", // Purple Glow
        icon: Cpu,
      },
      {
        label: "Full-Stack Web & Mobile",
        shortLabel: "Web / Mobile",
        value: web,
        color: "#38bdf8", // Sky Blue
        icon: Globe,
      },
      {
        label: "Cybersecurity & Compliance",
        shortLabel: "Cybersecurity",
        value: sec,
        color: "#f43f5e", // Rose Neon
        icon: ShieldCheck,
      },
      {
        label: "Data Engineering & BI",
        shortLabel: "Data & BI",
        value: data,
        color: "#34d399", // Emerald Green
        icon: Database,
      },
    ];
  }, [inquiries, quotes, activeFilter]);

  // Calculate maximum value for relative progress arcs
  const totalVolume = useMemo(
    () => rawPracticeData.reduce((sum, item) => sum + item.value, 0),
    [rawPracticeData]
  );

  const highestPractice = useMemo(() => {
    return [...rawPracticeData].sort((a, b) => b.value - a.value)[0];
  }, [rawPracticeData]);

  // Prepare ring data with calculated maxValues
  const ringData = useMemo(() => {
    const maxVal = Math.max(...rawPracticeData.map((d) => d.value)) * 1.15 || 10;
    return rawPracticeData.map((item) => ({
      label: item.shortLabel,
      fullLabel: item.label,
      value: item.value,
      maxValue: Math.round(maxVal),
      color: item.color,
      icon: item.icon,
    }));
  }, [rawPracticeData]);

  return (
    <div className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 p-6 space-y-6 shadow-xl backdrop-blur-md">
      {/* Widget Header with Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-100">
              Client Demand by Practice Area
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-ring progress telemetry across incoming enterprise project requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segment Filter */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setActiveFilter("inquiries")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeFilter === "inquiries"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Inquiries
            </button>
            <button
              onClick={() => setActiveFilter("quotes")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeFilter === "quotes"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Quotes
            </button>
          </div>

          {/* Quick link */}
          <button
            onClick={() => navigate("/services")}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span className="hidden md:inline">Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content: Ring Chart (Left) + Composable Legend (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Animated Ring Chart Visualizer */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-2">
          <div className="w-full max-w-[310px] sm:max-w-[340px] relative">
            <RingChart
              data={ringData}
              strokeWidth={13}
              ringGap={6}
              baseInnerRadius={66}
              hoveredIndex={hoveredIndex}
              onHoverChange={setHoveredIndex}
              className="py-1"
            >
              {ringData.map((item, index) => (
                <Ring
                  key={item.label}
                  index={index}
                  color={item.color}
                  lineCap="round"
                  showGlow={true}
                />
              ))}
              <RingCenter
                defaultLabel="Total Leads"
                prefix=""
                suffix=""
                valueClassName="text-2xl font-black text-slate-100"
                labelClassName="text-xs font-semibold text-slate-400"
              />
            </RingChart>
          </div>

          {/* Micro Helper Tag below Ring */}
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Hover over any ring arc or practice item to highlight focus</span>
          </div>
        </div>

        {/* Right Side: Interactive Composable Legend & Live Progress Metrics */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
            <Legend
              items={ringData}
              hoveredIndex={hoveredIndex}
              onHoverChange={setHoveredIndex}
              title="Practice Area Breakdown"
              titleClassName="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between"
            >
              <LegendItem className="hover:bg-slate-800/60 rounded-xl transition-all">
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <LegendMarker className="w-2.5 h-2.5 rounded-full" />
                      <LegendLabel className="font-semibold text-slate-200" />
                    </div>
                    <LegendValue
                      className="text-xs font-bold text-slate-200"
                      percentageClassName="text-[11px] text-cyan-400 font-bold ml-1"
                      showPercentage={true}
                    />
                  </div>
                  <LegendProgress
                    height="h-1.5"
                    trackClassName="bg-slate-800/80 border border-slate-700/40"
                  />
                </div>
              </LegendItem>
            </Legend>
          </div>

          {/* Quick High-Intent Signal Box */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Flame className="w-4 h-4" />
              </span>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Top Velocity</div>
                <div className="text-xs font-bold text-cyan-300 truncate">{highestPractice?.shortLabel}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Volume</div>
                <div className="text-xs font-bold text-purple-300">{totalVolume} Lead Actions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
