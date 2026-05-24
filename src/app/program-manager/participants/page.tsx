"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconSearch,
  IconUsers,
  IconMail,
  IconUser
} from "@tabler/icons-react";
import formatDate from "@/helper/FormatDate";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Team {
  _id: string;
  name: string;
  members: Member[];
  status: string;
  createdAt: string;
  points: number;
}

export default function ProgramManagerParticipantsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/program-manager/participants");
      if (res.data.success) {
        setTeams(res.data.teams);
      }
    } catch (error) {
      console.error("Error fetching program participants:", error);
      toast.error("Failed to load participants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const filteredTeams = teams.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.members.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (loading) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12">
      <Title
        title="Competition Registrants"
        subtitle="Manage teams, check individual member accounts, and track status for your program."
      />

      {/* Search Bar */}
      <div className="join w-full bg-base-200 p-3.5 rounded-2xl border border-base-300">
        <span className="join-item bg-base-300 flex items-center px-4"><IconSearch size={18} /></span>
        <input
          type="text"
          placeholder="Search by team name or member name..."
          className="input input-bordered join-item w-full text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Audit */}
      <div className="overflow-x-auto bg-base-200 rounded-2xl border border-base-300 shadow-md">
        {filteredTeams.length === 0 ? (
          <div className="p-12 text-center text-base-content/60">No participants found under fests.</div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr className="bg-base-300/40 text-base-content/75 font-semibold text-xs uppercase">
                <th>Team/Individual Name</th>
                <th>Team Members</th>
                <th>Registration Date</th>
                <th>Leaderboard Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => (
                <tr key={team._id} className="hover:bg-base-300/10 border-b border-base-300/40 text-xs">
                  <td>
                    <div className="flex items-center gap-2">
                      <IconUsers size={16} className="text-primary" />
                      <div>
                        <div className="font-bold text-sm text-base-content">{team.name}</div>
                        <div className="text-[10px] text-base-content/40">ID: {team._id.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1.5 py-1">
                      {team.members.map((member) => (
                        <div key={member._id} className="flex flex-col bg-base-100 p-1.5 rounded-lg border border-base-300/60 max-w-[220px]">
                          <span className="font-bold text-base-content flex items-center gap-1"><IconUser size={11} className="text-primary" /> {member.name}</span>
                          <span className="text-[10px] text-base-content/50 flex items-center gap-1"><IconMail size={11} /> {member.email}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="text-base-content/70">
                    {formatDate(new Date(team.createdAt))}
                  </td>
                  <td className="font-mono text-sm font-extrabold text-secondary">
                    {team.points || 0} pts
                  </td>
                  <td>
                    <span className={`badge badge-sm font-bold uppercase ${
                      team.status === "locked" || team.status === "open" ? "badge-success" : "badge-ghost"
                    }`}>
                      {team.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
