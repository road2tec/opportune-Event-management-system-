"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconUsers,
  IconReceipt,
  IconChartBar,
  IconStar,
  IconClock
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

interface Stats {
  totalTeams: number;
  totalSubmissions: number;
  averageScore: number;
}

interface Trend {
  name: string;
  participants: number;
}

export default function ProgramManagerAnalyticsPage() {
  const [stats, setStats] = useState<Stats>({ totalTeams: 0, totalSubmissions: 0, averageScore: 0 });
  const [growthTrends, setGrowthTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/program-manager/analytics");
      if (res.data.success) {
        setStats(res.data.stats);
        setGrowthTrends(res.data.simulatedGrowth);
      }
    } catch (error) {
      console.error("Error fetching program manager analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12">
      <Title
        title="Competition Analytics"
        subtitle="Detailed metrics detailing registrant size, submissions growth, and average grading evaluations."
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Teams */}
        <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest block font-mono">Teams Registrations</span>
            <span className="text-2xl font-extrabold text-primary font-outfit">{stats.totalTeams} Teams</span>
            <span className="text-[10px] text-primary/80 flex items-center gap-0.5"><IconUsers size={12} /> Active competitors</span>
          </div>
          <div className="w-12 h-12 bg-primary/15 text-primary rounded-full flex items-center justify-center">
            <IconUsers size={24} />
          </div>
        </div>

        {/* Total Submissions */}
        <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest block font-mono">Project Submissions</span>
            <span className="text-2xl font-extrabold text-secondary font-outfit">{stats.totalSubmissions} Projects</span>
            <span className="text-[10px] text-base-content/40 block">Submitted for rounds</span>
          </div>
          <div className="w-12 h-12 bg-secondary/15 text-secondary rounded-full flex items-center justify-center">
            <IconReceipt size={24} />
          </div>
        </div>

        {/* Average Score */}
        <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest block font-mono">Average Evaluation Score</span>
            <span className="text-2xl font-extrabold text-success font-outfit">{stats.averageScore} / 100</span>
            <span className="text-[10px] text-success/80 flex items-center gap-0.5"><IconStar size={12} /> Average performance</span>
          </div>
          <div className="w-12 h-12 bg-success/15 text-success rounded-full flex items-center justify-center">
            <IconStar size={24} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth chart */}
        <div className="lg:col-span-2 bg-base-200 border border-base-300 p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-base-content flex items-center gap-1.5 font-outfit uppercase">
              <IconChartBar size={18} className="text-primary" /> weekly participant growth trends
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthTrends}>
                <defs>
                  <linearGradient id="colorGrowthAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--p, #ff8f00)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--p, #ff8f00)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="currentColor" opacity={0.4} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.4} fontSize={11} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                <Area type="monotone" dataKey="participants" stroke="var(--p, #ff8f00)" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowthAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-base-200 border border-base-300 p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-base-content font-outfit uppercase mb-4">Evaluation Audit</h3>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Maintain close supervision on average score. Evaluators are expected to submit grading pro-tips for contestants.
            </p>
          </div>
          <div className="border-t border-base-300 pt-4 mt-4 text-[10px] text-base-content/40 leading-relaxed flex items-center gap-1.5">
            <IconClock size={14} /> Evaluation reviews pending.
          </div>
        </div>
      </div>
    </div>
  );
}
