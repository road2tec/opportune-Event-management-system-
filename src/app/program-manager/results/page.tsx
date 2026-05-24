"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconSearch,
  IconTrophy,
  IconUsers,
  IconEdit,
  IconCheck,
  IconAward
} from "@tabler/icons-react";

interface Member {
  name: string;
}

interface Team {
  _id: string;
  name: string;
  points: number;
  submissionCount: number;
  members: Member[];
  status: string;
}

export default function ProgramManagerResultsPage() {
  const [standings, setStandings] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Points state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [overridePoints, setOverridePoints] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchStandings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/program-manager/results");
      if (res.data.success) {
        setStandings(res.data.standings);
      }
    } catch (error) {
      console.error("Error fetching program standings:", error);
      toast.error("Failed to load standings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, []);

  const handleOpenEditModal = (team: Team) => {
    setEditingTeam(team);
    setOverridePoints(team.points.toString());
    (document.getElementById("override-points-modal") as HTMLDialogElement).showModal();
  };

  const handleSavePoints = async () => {
    if (!editingTeam) return;
    setSaving(true);
    try {
      const res = await axios.put("/api/program-manager/results", {
        teamId: editingTeam._id,
        points: parseFloat(overridePoints) || 0,
      });

      if (res.data.success) {
        toast.success("Team points overrides updated successfully!");
        setStandings(standings.map(t => t._id === editingTeam._id ? { ...t, points: parseFloat(overridePoints) || 0 } : t).sort((a,b) => b.points - a.points));
        (document.getElementById("override-points-modal") as HTMLDialogElement).close();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save points");
    } finally {
      setSaving(false);
    }
  };

  const filteredStandings = standings.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.members.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (loading) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12">
      <Title
        title="Leaderboard & Standings"
        subtitle="Manage competitor scoreboards, override points, and lock winner standing podiums."
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

      {/* Standings Grid / List */}
      <div className="overflow-x-auto bg-base-200 rounded-2xl border border-base-300 shadow-md">
        {filteredStandings.length === 0 ? (
          <div className="p-12 text-center text-base-content/60">No competitor scores logged yet.</div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr className="bg-base-300/40 text-base-content/75 font-semibold text-xs uppercase">
                <th className="w-12 text-center">Rank</th>
                <th>Team Name</th>
                <th>Submissions Count</th>
                <th>Leaderboard Standings</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStandings.map((team, idx) => {
                const rank = idx + 1;
                const isPodium = rank <= 3;
                return (
                  <tr key={team._id} className="hover:bg-base-300/10 border-b border-base-300/40 text-xs">
                    <td className="text-center">
                      {isPodium ? (
                        <span className={`badge badge-md font-bold px-3 shadow flex items-center justify-center mx-auto gap-0.5 ${
                          rank === 1 ? "bg-amber-500 text-white" : 
                          rank === 2 ? "bg-slate-400 text-white" : "bg-amber-700 text-white"
                        }`}>
                          <IconAward size={13} /> {rank}
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-base-content/60 text-sm">{rank}</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <IconUsers size={16} className="text-primary/70" />
                        <div>
                          <div className="font-bold text-sm text-base-content">{team.name}</div>
                          <div className="text-[10px] text-base-content/40">Members: {team.members.map(m => m.name).join(", ")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-semibold text-base-content/70 text-center">
                      {team.submissionCount || 0} projects
                    </td>
                    <td className="font-mono text-sm font-extrabold text-success">
                      <IconTrophy size={14} className="inline mr-1" />
                      {team.points || 0} pts
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleOpenEditModal(team)}
                        className="btn btn-secondary btn-outline btn-xs rounded-lg flex items-center gap-0.5 ml-auto"
                      >
                        <IconEdit size={12} /> Override Points
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* OVERRIDE POINTS MODAL */}
      <dialog id="override-points-modal" className="modal bg-base-100/60 backdrop-blur-sm">
        <div className="modal-box bg-base-200 border border-secondary/40 rounded-3xl p-6 Orbitron">
          <h3 className="font-bold text-xl text-secondary mb-4 font-outfit uppercase">Override Team Points</h3>
          
          {editingTeam && (
            <div className="space-y-4 poppins">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Manual Score Override (Team: <strong>{editingTeam.name}</strong>)</legend>
                <input
                  type="number"
                  className="input input-bordered w-full rounded-xl"
                  placeholder="Enter custom points override..."
                  value={overridePoints}
                  onChange={(e) => setOverridePoints(e.target.value)}
                />
              </fieldset>

              <div className="flex justify-end gap-3 border-t border-base-300 pt-4 mt-6">
                <button
                  onClick={() => (document.getElementById("override-points-modal") as HTMLDialogElement).close()}
                  className="btn btn-outline btn-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={handleSavePoints}
                  className="btn btn-secondary btn-sm rounded-xl text-white px-5"
                >
                  {saving ? "Saving..." : "Confirm Override"}
                </button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
