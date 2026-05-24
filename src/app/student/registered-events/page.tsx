"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import Link from "next/link";
import Image from "next/image";
import {
  IconTrophy,
  IconUsersGroup,
  IconUser,
  IconCalendar,
  IconCopy,
  IconArrowRight,
  IconKey,
  IconShield,
  IconClock
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import formatDate from "@/helper/FormatDate";

interface Registration {
  _id: string;
  name: string;
  leader: string;
  members: string[];
  credentials?: {
    teamCode: string;
    password: string;
  };
  status: string;
  createdAt: string;
  program: {
    _id: string;
    title: string;
    coverImage: string;
    type: "individual" | "team";
    programType: string;
    roundsCount: number;
    pricePerTeam: number;
    event: {
      title: string;
      college: {
        name: string;
      };
    };
  };
}

export default function RegisteredEventsPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filterType, setFilterType] = useState<"all" | "individual" | "team">("all");

  // Fetch registered programs from backend
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/students/registered-events");
      if (res.data.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load registered events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Copy Team Code to Clipboard
  const handleCopyCode = (code: string, teamName: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code for "${teamName}" copied to clipboard!`);
  };

  // Filter registrations
  const filteredList = registrations.filter((reg) => {
    if (filterType === "all") return true;
    return reg.program?.type === filterType;
  });

  if (loading) return <Loading />;

  return (
    <div className="poppins max-w-6xl mx-auto pb-16">
      {/* Title Header */}
      <Title
        title="Registered Events"
        subtitle="Manage your team credentials, view schedules, and track your participation statuses."
      />

      {/* Filter Tabs */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-8 bg-base-200 p-2.5 rounded-2xl border border-base-300">
        <div className="flex gap-1">
          <button
            onClick={() => setFilterType("all")}
            className={`btn btn-sm rounded-xl border-none ${
              filterType === "all" ? "btn-primary text-white shadow" : "btn-ghost"
            }`}
          >
            All Registrations
          </button>
          <button
            onClick={() => setFilterType("individual")}
            className={`btn btn-sm rounded-xl border-none ${
              filterType === "individual" ? "btn-primary text-white shadow" : "btn-ghost"
            }`}
          >
            Individual
          </button>
          <button
            onClick={() => setFilterType("team")}
            className={`btn btn-sm rounded-xl border-none ${
              filterType === "team" ? "btn-primary text-white shadow" : "btn-ghost"
            }`}
          >
            Team Events
          </button>
        </div>
        <div className="text-xs font-semibold px-4 text-base-content/60">
          Showing {filteredList.length} of {registrations.length} Entries
        </div>
      </div>

      {/* Empty State */}
      {filteredList.length === 0 ? (
        <div className="card bg-base-200 border border-base-300 shadow-xl p-10 text-center rounded-3xl max-w-lg mx-auto mt-10">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <IconTrophy size={32} />
          </div>
          <h4 className="text-xl font-bold font-outfit">No Registrations Found</h4>
          <p className="text-sm text-base-content/60 mt-2 leading-relaxed">
            {filterType === "all"
              ? "You have not registered for any events or fests yet. Start exploring programs to get started!"
              : `You have no ${filterType} event registrations currently.`}
          </p>
          <div className="mt-6">
            <Link href="/student/ongoing-events" className="btn btn-primary btn-sm rounded-xl px-5 text-white">
              Browse Ongoing Events
              <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((reg) => {
            const isTeam = reg.program?.type === "team";
            return (
              <div
                key={reg._id}
                className="card bg-base-100 border border-base-300 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Card Banner Image */}
                  <figure className="relative h-44 w-full overflow-hidden bg-base-300/30">
                    <Image
                      src={reg.program?.coverImage || "/placeholder.jpg"}
                      alt={reg.program?.title || "Program"}
                      fill
                      className="object-cover"
                    />
                    {/* Event Tag */}
                    <span className="absolute top-3 left-3 badge badge-primary text-[10px] font-bold uppercase tracking-wider shadow">
                      {reg.program?.programType}
                    </span>
                    {/* Individual/Team Badge */}
                    <span className="absolute top-3 right-3 badge badge-secondary text-[10px] font-bold uppercase tracking-wider shadow">
                      {reg.program?.type}
                    </span>
                  </figure>

                  {/* Card Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-outfit">
                        {reg.program?.event?.title}
                      </span>
                      <h3 className="text-lg font-bold text-base-content leading-snug mt-1 font-outfit truncate">
                        {reg.program?.title}
                      </h3>
                      <p className="text-[11px] text-base-content/50 truncate">
                        {reg.program?.event?.college?.name}
                      </p>
                    </div>

                    <hr className="border-base-200" />

                    {/* Team Details / Credentials */}
                    {isTeam ? (
                      <div className="space-y-3 bg-base-200/60 p-4 rounded-xl border border-base-300/80">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-base-content/50">TEAM NAME:</span>
                          <span className="text-xs font-extrabold text-secondary truncate max-w-[120px]">{reg.name}</span>
                        </div>

                        {reg.credentials && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-base-content/50">TEAM CODE:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-base-content bg-base-100 px-2 py-0.5 rounded border border-base-300">
                                  {reg.credentials.teamCode}
                                </span>
                                <button
                                  onClick={() => handleCopyCode(reg.credentials!.teamCode, reg.name)}
                                  className="btn btn-ghost btn-xs p-1 text-primary hover:bg-primary/10"
                                  title="Copy Team Code"
                                >
                                  <IconCopy size={13} />
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-base-content/50">TEAM PASS:</span>
                              <span className="font-mono text-xs font-semibold text-base-content/80 flex items-center gap-1">
                                <IconKey size={12} className="text-base-content/40" />
                                {reg.credentials.password}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      /* Individual Registration info */
                      <div className="flex items-center gap-2 bg-base-200/50 p-3 rounded-xl border border-base-300 text-xs font-medium text-base-content/75">
                        <IconUser size={15} className="text-primary" />
                        <span>Registered as Individual Participant</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="px-5 pb-5 pt-2 flex justify-between items-center text-[10px] text-base-content/40 border-t border-base-200 mt-2">
                  <span className="flex items-center gap-1">
                    <IconCalendar size={13} />
                    Registered {new Date(reg.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconClock size={13} />
                    {reg.program?.roundsCount || 1} Rounds
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
