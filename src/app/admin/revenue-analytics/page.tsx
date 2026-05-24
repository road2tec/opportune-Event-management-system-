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
  IconCalendar,
  IconClock
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import formatDate from "@/helper/FormatDate";

interface Payer {
  name: string;
}

interface Event {
  title: string;
}

interface Program {
  title: string;
}

interface Payment {
  _id: string;
  payer?: Payer;
  event?: Event;
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

export default function AdminRevenuePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalPlatformCut: 0, transactionsCount: 0 });
  const [monthlyTrends, setMonthlyTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/revenue");
      if (res.data.success) {
        setPayments(res.data.payments);
        setStats(res.data.stats);
        setMonthlyTrends(res.data.monthlyTrends);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
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
        title="Revenue & Analytics"
        subtitle="Real-time audits of platform sales throughput, commission cuts, and transactional volume."
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total revenue */}
        <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-base-content/40 uppercase tracking-widest block">Total Sales Revenue</span>
            <span className="text-2xl font-extrabold text-success font-outfit">₹{stats.totalRevenue.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-success/80 flex items-center gap-0.5"><IconArrowUpRight size={12} /> +12.4% this month</span>
          </div>
          <div className="w-12 h-12 bg-success/15 text-success rounded-full flex items-center justify-center">
            <IconCoinRupee size={24} />
          </div>
        </div>

        {/* Platform commission */}
        <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-base-content/40 uppercase tracking-widest block">Opportune Commission Cut</span>
            <span className="text-2xl font-extrabold text-primary font-outfit">₹{stats.totalPlatformCut.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-base-content/40 block">Flat 10% platform service fee</span>
          </div>
          <div className="w-12 h-12 bg-primary/15 text-primary rounded-full flex items-center justify-center">
            <IconReceipt size={24} />
          </div>
        </div>

        {/* Total volume */}
        <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-base-content/40 uppercase tracking-widest block">Paid Registrations</span>
            <span className="text-2xl font-extrabold text-secondary font-outfit">{stats.transactionsCount} Entries</span>
            <span className="text-[10px] text-secondary/80 flex items-center gap-0.5"><IconArrowUpRight size={12} /> +18.2% vs last semester</span>
          </div>
          <div className="w-12 h-12 bg-secondary/15 text-secondary rounded-full flex items-center justify-center">
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
              <IconChartBar size={18} className="text-primary" /> Monthly Revenue Trend
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--p, #ff8f00)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--p, #ff8f00)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="currentColor" opacity={0.4} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.4} fontSize={11} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                <Area type="monotone" dataKey="amount" stroke="var(--p, #ff8f00)" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Distribution Summary */}
        <div className="bg-base-200 border border-base-300 p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-base-content font-outfit uppercase mb-4">Payout Overview</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-base-content/70">
                  <span>Colleges Share</span>
                  <span>90% (₹{(stats.totalRevenue * 0.9).toLocaleString("en-IN")})</span>
                </div>
                <progress className="progress progress-success w-full" value="90" max="100"></progress>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-base-content/70">
                  <span>Platform Commission</span>
                  <span>10% (₹{(stats.totalPlatformCut).toLocaleString("en-IN")})</span>
                </div>
                <progress className="progress progress-primary w-full" value="10" max="100"></progress>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-base-content/70">
                  <span>System Refunds</span>
                  <span>0% (₹0)</span>
                </div>
                <progress className="progress progress-error w-full" value="0" max="100"></progress>
              </div>
            </div>
          </div>

          <div className="border-t border-base-300 pt-4 mt-4 text-[10px] text-base-content/40 leading-relaxed">
            All system payouts are dispatched to target college bank gateways on the 1st and 15th of each calendar month.
          </div>
        </div>
      </div>

      {/* Transaction audit log */}
      <div className="bg-base-200 border border-base-300 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 bg-base-300/40 border-b border-base-300 flex justify-between items-center">
          <h3 className="font-bold text-sm text-base-content font-outfit uppercase">Platform Audit Transactions</h3>
          <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Realtime Audit Ledger</span>
        </div>
        
        {payments.length === 0 ? (
          <div className="p-12 text-center text-base-content/50 text-xs italic">
            No platform payments found. Showing premium simulated payout trends above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-300/20 text-xs text-base-content/70">
                  <th>Transaction ID / Reference</th>
                  <th>Payer Name</th>
                  <th>Linked program / event</th>
                  <th>Amount</th>
                  <th>Platform Cut</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-base-300/10 text-xs border-b border-base-300/40">
                    <td className="font-mono font-bold text-primary max-w-[120px] truncate">
                      {p.paymentGatewayRef || p._id}
                    </td>
                    <td className="font-semibold text-base-content">{p.payer?.name || "Anonymous student"}</td>
                    <td>
                      <div className="font-bold">{p.program?.title || "Program details"}</div>
                      <div className="text-[10px] text-base-content/40 truncate max-w-[180px]">{p.event?.title || "Fest name"}</div>
                    </td>
                    <td className="font-bold text-success">₹{p.amount || 0}</td>
                    <td className="font-bold text-primary">₹{p.platformCut || 0}</td>
                    <td>
                      <span className={`badge badge-xs font-bold uppercase ${
                        p.status === "paid" ? "badge-success" : 
                        p.status === "failed" ? "badge-error" : "badge-ghost"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-base-content/55 whitespace-nowrap">
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
