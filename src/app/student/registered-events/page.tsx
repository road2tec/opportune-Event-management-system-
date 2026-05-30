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
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconMail,
  IconPhone,
  IconTicket,
  IconPrinter,
  IconQrcode,
  IconBarcode
} from "@tabler/icons-react";
import toast from "react-hot-toast";

interface Teammate {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  profileImage?: string;
}

interface Registration {
  _id: string;
  name: string;
  leader: Teammate | string;
  members: (Teammate | string)[];
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
  const [expandedRoster, setExpandedRoster] = useState<Record<string, boolean>>({});
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);

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

  const toggleRoster = (regId: string) => {
    setExpandedRoster(prev => ({
      ...prev,
      [regId]: !prev[regId]
    }));
  };

  const isTeammateObject = (m: any): m is Teammate => {
    return m && typeof m === "object" && "name" in m;
  };

  const getLeaderId = (leader: Teammate | string): string => {
    if (typeof leader === "object" && leader !== null) {
      return leader._id;
    }
    return leader;
  };

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
            const leaderId = getLeaderId(reg.leader);
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
                      <div className="space-y-3">
                        <div className="bg-base-200/60 p-4 rounded-xl border border-base-300/80 space-y-3">
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

                        {/* Collapsible Teammates Roster */}
                        <div className="border border-base-300 rounded-xl bg-base-200/20 overflow-hidden">
                          <button
                            onClick={() => toggleRoster(reg._id)}
                            className="w-full flex items-center justify-between p-3 text-xs font-bold text-base-content/80 hover:bg-base-200/50 transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <IconUsersGroup size={14} className="text-primary" />
                              Team Roster ({reg.members?.length || 1})
                            </span>
                            {expandedRoster[reg._id] ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                          </button>

                          {expandedRoster[reg._id] && (
                            <div className="p-3 border-t border-base-300 bg-base-100/50 space-y-2 animate-fadeIn">
                              {reg.members?.map((member, mIdx) => {
                                const isObj = isTeammateObject(member);
                                const isLeader = isObj ? member._id === leaderId : false;
                                return (
                                  <div key={isObj ? member._id : mIdx} className="flex items-center justify-between p-2 rounded-lg bg-base-200/40 border border-base-300/40">
                                    <div className="flex items-center gap-2">
                                      <div className="relative w-7 h-7 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                        {isObj && member.profileImage ? (
                                          <Image src={member.profileImage} alt={member.name} fill className="object-cover" />
                                        ) : (
                                          <span>{isObj ? member.name[0].toUpperCase() : "U"}</span>
                                        )}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[11px] font-bold flex items-center gap-1">
                                          {isObj ? member.name : "Teammate"}
                                          {isLeader && <span className="badge badge-accent badge-xs text-[8px] px-1 font-bold">👑 Leader</span>}
                                        </span>
                                        {isObj && member.email && <span className="text-[9px] text-base-content/50 truncate max-w-[120px]">{member.email}</span>}
                                      </div>
                                    </div>
                                    {isObj && (member.email || member.phone) && (
                                      <div className="flex gap-1">
                                        {member.email && (
                                          <a href={`mailto:${member.email}`} className="btn btn-ghost btn-circle btn-xs hover:bg-primary/20" title={`Email: ${member.email}`}>
                                            <IconMail size={11} className="text-primary" />
                                          </a>
                                        )}
                                        {member.phone && (
                                          <a href={`tel:${member.phone}`} className="btn btn-ghost btn-circle btn-xs hover:bg-secondary/20" title={`Call: ${member.phone}`}>
                                            <IconPhone size={11} className="text-secondary" />
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Individual Registration info */
                      <div className="flex items-center gap-2 bg-base-200/50 p-3 rounded-xl border border-base-300 text-xs font-medium text-base-content/75 font-outfit">
                        <IconUser size={15} className="text-primary" />
                        <span>Registered as Individual Participant</span>
                      </div>
                    )}
                  </div>
                  
                  {/* View Ticket Action button */}
                  <div className="px-5 pt-1.5 no-print">
                    <button
                      onClick={() => setSelectedTicket(reg)}
                      className="btn btn-outline btn-primary btn-xs w-full rounded-xl flex items-center justify-center gap-1 font-bold transition hover:scale-[1.02] hover:bg-primary hover:text-white font-outfit"
                    >
                      <IconTicket size={14} />
                      View Entry Pass
                    </button>
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

      {/* SPECTACULAR PRINTABLE TICKET MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto no-print">
          <div className="bg-base-100 border border-primary/40 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-fadeIn poppins">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content hover:bg-base-200"
            >
              ✕
            </button>

            {/* Printable Ticket Card */}
            <div className="printable-ticket bg-gradient-to-br from-base-200 via-base-100 to-base-200 border-2 border-primary/30 rounded-2xl p-5 shadow-inner space-y-5 select-text">
              
              {/* Ticket Header */}
              <div className="text-center space-y-1 pb-3.5 border-b border-base-content/10">
                <span className="text-[9px] tracking-[0.25em] font-black text-primary uppercase block font-outfit">UNISYNC FESTIVAL PASS</span>
                <h3 className="text-xl font-black text-base-content font-outfit uppercase leading-tight line-clamp-1">{selectedTicket.program?.event?.title || "OFFICIAL ENTRY"}</h3>
                <p className="text-[10px] text-base-content/50 font-medium truncate">{selectedTicket.program?.event?.college?.name || "HOST CAMPUS"}</p>
              </div>

              {/* Contestant and Event Information */}
              <div className="grid grid-cols-2 gap-3.5 text-[11px] leading-tight">
                <div>
                  <span className="text-[8px] font-extrabold text-base-content/40 uppercase block tracking-wider">COMPETITION / PORTAL:</span>
                  <span className="font-extrabold text-base-content text-xs block font-outfit truncate">{selectedTicket.program?.title}</span>
                </div>
                <div>
                  <span className="text-[8px] font-extrabold text-base-content/40 uppercase block tracking-wider">ENTRY TYPE:</span>
                  <span className="font-extrabold text-secondary capitalize text-xs block font-outfit">{selectedTicket.program?.type}</span>
                </div>
                <div>
                  <span className="text-[8px] font-extrabold text-base-content/40 uppercase block tracking-wider">TICKET HOLDER:</span>
                  <span className="font-bold text-base-content block truncate">{typeof selectedTicket.leader === 'object' ? selectedTicket.leader.name : "Teammate"}</span>
                </div>
                <div>
                  <span className="text-[8px] font-extrabold text-base-content/40 uppercase block tracking-wider">REGISTRATION DATE:</span>
                  <span className="font-bold text-base-content block">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Team details */}
              {selectedTicket.program?.type === "team" && (
                <div className="bg-base-300/40 p-3 rounded-xl border border-base-300 flex justify-between items-center text-[11px]">
                  <div>
                    <span className="text-[8px] font-extrabold text-base-content/40 uppercase block tracking-wider">REGISTERED TEAM:</span>
                    <span className="font-bold text-primary block font-outfit">{selectedTicket.name}</span>
                  </div>
                  {selectedTicket.credentials && (
                    <div className="text-right">
                      <span className="text-[8px] font-extrabold text-base-content/40 uppercase block tracking-wider">TEAM CODE:</span>
                      <span className="font-mono font-bold text-secondary text-xs">{selectedTicket.credentials.teamCode}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Info Stamp */}
              <div className="flex justify-between items-center bg-base-300/50 p-3.5 rounded-xl border border-base-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-extrabold text-base-content/40 uppercase">STATUS:</span>
                  {selectedTicket.program?.pricePerTeam > 0 ? (
                    <span className="badge badge-success font-black text-[9px] tracking-wider py-2 px-2.5 border-none bg-emerald-600/20 text-emerald-400 shadow-sm">
                      ✓ PAID
                    </span>
                  ) : (
                    <span className="badge badge-info font-black text-[9px] tracking-wider py-2 px-2.5 border-none bg-sky-500/20 text-sky-400 shadow-sm">
                      FREE PASS
                    </span>
                  )}
                </div>
                <div className="text-right text-[9px] font-medium text-base-content/50 leading-tight">
                  {selectedTicket.program?.pricePerTeam > 0 ? (
                    <>
                      <span className="block text-[8px] font-bold text-base-content/30 uppercase">GATEWAY REF:</span>
                      <span className="font-mono text-base-content font-bold">RZP_{selectedTicket._id.substring(14)}</span>
                    </>
                  ) : (
                    <span>Complimentary Pass</span>
                  )}
                </div>
              </div>

              {/* Simulated High-tech QR Code scanner mock */}
              <div className="flex flex-col items-center justify-center py-3 border-t border-dashed border-base-content/20 gap-2">
                <div className="relative w-24 h-24 bg-white p-1.5 rounded-xl border border-base-300 flex items-center justify-center shadow">
                  <div className="w-full h-full bg-slate-900 rounded flex flex-col justify-between p-1 gap-1 select-none">
                    <div className="flex justify-between w-full h-[30%]">
                      <div className="w-[30%] h-full border-2 border-white rounded-sm bg-slate-900"></div>
                      <div className="w-[10%] h-full bg-white rounded-sm"></div>
                      <div className="w-[30%] h-full border-2 border-white rounded-sm bg-slate-900"></div>
                    </div>
                    <div className="flex justify-between w-full h-[20%] gap-0.5">
                      <div className="w-[20%] h-full bg-white rounded-sm"></div>
                      <div className="w-[40%] h-full bg-white rounded-sm"></div>
                      <div className="w-[10%] h-full bg-white rounded-sm"></div>
                      <div className="w-[20%] h-full bg-white rounded-sm"></div>
                    </div>
                    <div className="flex justify-between w-full h-[30%]">
                      <div className="w-[30%] h-full border-2 border-white rounded-sm bg-slate-900"></div>
                      <div className="w-[30%] h-full bg-white rounded-sm"></div>
                      <div className="w-[20%] h-full bg-white rounded-sm"></div>
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[8px] text-base-content/35 tracking-[0.2em] font-extrabold uppercase mt-0.5">
                  *SECURE_VERIFIED_TICKET_PASS*
                </span>
              </div>
            </div>

            {/* Print and Close controls */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setSelectedTicket(null)}
                className="btn btn-outline btn-sm rounded-xl px-4 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-primary btn-sm rounded-xl px-5 text-xs text-white font-bold flex items-center gap-1 shadow"
              >
                <IconPrinter size={14} />
                Print Entry Pass
              </button>
            </div>

            {/* Embedded Print Override styling block */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                .printable-ticket, .printable-ticket * {
                  visibility: visible !important;
                }
                .printable-ticket {
                  position: absolute !important;
                  left: 50% !important;
                  top: 40px !important;
                  transform: translateX(-50%) !important;
                  width: 100% !important;
                  max-width: 480px !important;
                  border: 2px solid #000000 !important;
                  background: #ffffff !important;
                  color: #000000 !important;
                  box-shadow: none !important;
                  border-radius: 16px !important;
                  padding: 20px !important;
                }
                .printable-ticket * {
                  color: #000000 !important;
                  border-color: #cbd5e1 !important;
                  background: transparent !important;
                }
                .printable-ticket .badge {
                  border: 1px solid #000000 !important;
                  background: transparent !important;
                  color: #000000 !important;
                }
              }
            ` }} />
          </div>
        </div>
      )}
    </div>
  );
}
