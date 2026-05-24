"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  IconSearch,
  IconTrophy,
  IconUsers,
  IconCalendar,
  IconLayersSubtract,
} from "@tabler/icons-react";
import formatDate from "@/helper/FormatDate";

interface Event {
  title: string;
}

interface Program {
  _id: string;
  title: string;
  description?: string;
  programType: string;
  type: "individual" | "team";
  event?: Event;
  roundsCount: number;
  pricePerTeam: number;
  status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
  coverImage?: string;
  totalRegistrations: number;
  totalParticipants: number;
  prizes?: { title?: string; amount?: number }[];
  registrationEnd?: string;
}

export default function CollegeManageProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/college/programs");
      if (res.data.success) {
        setPrograms(res.data.programs);
      }
    } catch (error) {
      console.error("Error fetching college programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const filteredPrograms = programs.filter((prog) => {
    const matchesSearch = prog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (prog.event?.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "published": return "badge-success";
      case "ongoing": return "badge-info";
      case "completed": return "badge-neutral";
      case "cancelled": return "badge-error";
      default: return "badge-ghost";
    }
  };

  const getPrizePool = (prizes?: { amount?: number }[]) => {
    if (!prizes || prizes.length === 0) return 0;
    return prizes.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  if (loading) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12">
      <Title
        title="Manage College Programs"
        subtitle="Overview of all sub-competitions and program registrations under your college fests."
      />

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-base-200 p-4 rounded-2xl border border-base-300">
        <fieldset className="fieldset col-span-2">
          <legend className="fieldset-legend">Search programs</legend>
          <div className="join w-full">
            <span className="join-item bg-base-300 flex items-center px-4"><IconSearch size={18} /></span>
            <input
              type="text"
              placeholder="Search by program title or event name..."
              className="input input-bordered join-item w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Filter by Status</legend>
          <select
            className="select select-bordered w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </fieldset>
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="card bg-base-200 border border-base-300 p-12 text-center rounded-3xl max-w-md mx-auto">
          <h4 className="text-xl font-bold font-outfit text-base-content/60">No Programs Found</h4>
          <p className="text-xs text-base-content/50 mt-1">Select another filter or publish a program.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => (
            <div
              key={prog._id}
              className="card bg-base-100 border border-base-300 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl flex flex-col justify-between"
            >
              <div>
                {/* Program Cover Image Banner */}
                <div className="relative h-40 w-full bg-base-300/40">
                  <Image
                    src={prog.coverImage || "/placeholder.jpg"}
                    alt={prog.title}
                    fill
                    className="object-cover"
                  />
                  <span className={`absolute top-3 right-3 badge ${getStatusBadgeClass(prog.status)} font-bold text-[10px] uppercase py-2 shadow-md`}>
                    {prog.status}
                  </span>
                  <span className="absolute top-3 left-3 badge badge-secondary font-bold text-[9px] uppercase shadow-md">
                    {prog.programType}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block truncate">
                      {prog.event?.title || "Independent Fest"}
                    </span>
                    <h3 className="text-lg font-bold text-base-content leading-snug line-clamp-1 font-outfit mt-0.5">
                      {prog.title}
                    </h3>
                  </div>

                  <p className="text-xs text-base-content/60 line-clamp-2 leading-relaxed">
                    {prog.description || "No description available."}
                  </p>

                  <hr className="border-base-200" />

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-base-200/50 p-2 rounded-xl border border-base-300/60">
                      <div className="text-[10px] font-bold text-base-content/40 uppercase">Prize Pool</div>
                      <div className="text-xs font-extrabold text-success flex items-center justify-center gap-0.5 mt-0.5">
                        <IconTrophy size={12} />
                        ₹{getPrizePool(prog.prizes)}
                      </div>
                    </div>

                    <div className="bg-base-200/50 p-2 rounded-xl border border-base-300/60">
                      <div className="text-[10px] font-bold text-base-content/40 uppercase">Regs</div>
                      <div className="text-xs font-extrabold text-primary flex items-center justify-center gap-0.5 mt-0.5">
                        <IconUsers size={12} />
                        {prog.totalRegistrations || 0}
                      </div>
                    </div>

                    <div className="bg-base-200/50 p-2 rounded-xl border border-base-300/60">
                      <div className="text-[10px] font-bold text-base-content/40 uppercase">Rounds</div>
                      <div className="text-xs font-extrabold text-secondary flex items-center justify-center gap-0.5 mt-0.5">
                        <IconLayersSubtract size={12} />
                        {prog.roundsCount || 1}
                      </div>
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="text-[10px] font-medium text-base-content/40 flex justify-between">
                    <span className="capitalize">Type: {prog.type}</span>
                    {prog.registrationEnd && (
                      <span>Reg. Ends: {formatDate(new Date(prog.registrationEnd))}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
