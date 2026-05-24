"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconCoinRupee,
  IconReceipt,
  IconChartBar,
  IconArrowUpRight,
  IconCreditCard,
  IconCalendar
} from "@tabler/icons-react";
import {
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from "recharts";
import formatDate from "@/helper/FormatDate";

interface Payer {
  name: string;
}

interface Program {
  title: string;
}

interface Payment {
  _id: string;
  payer?: Payer;
  program?: Program;
  amount: number;
  platformCut: number;
  paymentGatewayRef?: string;
  status: "initiated" | "paid" | "failed" | "refunded";
  createdAt?: string;
}

interface Stats {
  totalRevenue: number;
  totalPlatformCut: number;
  transactionsCount: number;
}

interface Trend {
  name: string;
  amount: number;
}

export default function OrganizerRevenuePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalPlatformCut: 0, transactionsCount: 0 });
  const [monthlyTrends, setMonthlyTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/organizer/revenue");
      if (res.data.success) {
        setPayments(res.data.payments);
        setStats(res.data.stats);
        setMonthlyTrends(res.data.monthlyTrends);
      }
    } catch (error) {
      console.error("Error fetching organizer revenue data:", error);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12">
      <Title
        title="Fest Revenue Audits"
        subtitle="Audits of payment gateways, ticketing earnings, platform service cuts, and payout settling status."
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total revenue */}
        <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest block font-mono">Gross Ticket Sales</span>
            <span className="text-2xl font-extrabold text-success font-outfit">₹{stats.totalRevenue.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-success/80 flex items-center gap-0.5"><IconArrowUpRight size={12} /> +8.4% vs last week</span>
          </div>
          <div className="w-12 h-12 bg-success/15 text-success rounded-full flex items-center justify-center">
            <IconCoinRupee size={24} />
          </div>
        </div>

        {/* Platform commission */}
        <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest block font-mono">Platform Commission (10%)</span>
            <span className="text-2xl font-extrabold text-error font-outfit">₹{stats.totalPlatformCut.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-base-content/40 block">Deducted service cut fee</span>
          </div>
          <div className="w-12 h-12 bg-error/15 text-error rounded-full flex items-center justify-center">
            <IconReceipt size={24} />
          </div>
        </div>

        {/* Net payout */}
        <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest block font-mono">Net Fest Payout</span>
            <span className="text-2xl font-extrabold text-primary font-outfit">₹{(stats.totalRevenue - stats.totalPlatformCut).toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-primary/80 flex items-center gap-0.5">{stats.transactionsCount} entries registered</span>
          </div>
          <div className="w-12 h-12 bg-primary/15 text-primary rounded-full flex items-center justify-center">
            <IconCreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly volume chart */}
        <div className="lg:col-span-2 bg-base-200 border border-base-300 p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-base-content flex items-center gap-1.5 font-outfit uppercase">
              <IconChartBar size={18} className="text-primary" /> monthly ticket sales trends
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorOrganizerAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--p, #ff8f00)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--p, #ff8f00)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="currentColor" opacity={0.4} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.4} fontSize={11} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                <Area type="monotone" dataKey="amount" stroke="var(--p, #ff8f00)" strokeWidth={2} fillOpacity={1} fill="url(#colorOrganizerAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-base-200 border border-base-300 p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-base-content font-outfit uppercase mb-4">Settlement Notice</h3>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Ticket payouts are routed directly to your college account. Direct payout settlements for the fest occur on regular bi-monthly scheduling.
            </p>
          </div>
          <div className="border-t border-base-300 pt-4 mt-4 text-[10px] text-base-content/40 leading-relaxed flex items-center gap-1.5">
            <IconCalendar size={14} /> Settlement occurs automatically on the 1st and 15th.
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="bg-base-200 border border-base-300 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 bg-base-300/40 border-b border-base-300">
          <h3 className="font-bold text-xs text-base-content font-outfit uppercase">Audit Ledger List</h3>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center text-base-content/50 text-xs italic">
            No payments found. Showing default simulated payouts above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-300/20 text-xs text-base-content/70">
                  <th>Audit Ref ID</th>
                  <th>Student Name</th>
                  <th>Program / Event</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-base-300/10 text-xs border-b border-base-300/40">
                    <td className="font-mono font-bold text-primary">{p.paymentGatewayRef || p._id}</td>
                    <td className="font-semibold text-base-content">{p.payer?.name || "Anonymous Student"}</td>
                    <td>
                      <div className="font-bold">{p.program?.title || "Program details"}</div>
                    </td>
                    <td className="font-bold text-success">₹{p.amount || 0}</td>
                    <td className="font-bold text-error">₹{p.platformCut || 0}</td>
                    <td>
                      <span className={`badge badge-xs font-bold uppercase ${
                        p.status === "paid" ? "badge-success" : "badge-ghost"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-base-content/60">
                      {p.createdAt ? formatDate(new Date(p.createdAt)) : "TBD"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
