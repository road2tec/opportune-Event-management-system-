"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconSearch,
  IconClipboardList,
  IconExternalLink,
  IconStar,
  IconFolderOpen,
  IconCheck,
  IconX
} from "@tabler/icons-react";
import formatDate from "@/helper/FormatDate";

interface Team {
  name: string;
}

interface Submission {
  _id: string;
  description: string;
  files: { url: string; filename: string; size: number }[];
  links: string[];
  score: number;
  status: "submitted" | "under_review" | "accepted" | "rejected";
  team?: Team;
  createdAt: string;
}

export default function ProgramManagerSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Grading Modal States
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeStatus, setGradeStatus] = useState<string>("accepted");
  const [gradeComments, setGradeComments] = useState("");
  const [grading, setGrading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/program-manager/submissions");
      if (res.data.success) {
        setSubmissions(res.data.submissions);
      }
    } catch (error) {
      console.error("Error fetching program submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenGradeModal = (sub: Submission) => {
    setSelectedSub(sub);
    setGradeScore(sub.score.toString());
    setGradeStatus(sub.status);
    setGradeComments("");
    (document.getElementById("grade-submission-modal") as HTMLDialogElement).showModal();
  };

  const handleSaveGrading = async () => {
    if (!selectedSub) return;
    setGrading(true);
    try {
      const res = await axios.put("/api/program-manager/submissions", {
        submissionId: selectedSub._id,
        score: parseFloat(gradeScore) || 0,
        status: gradeStatus,
        comments: gradeComments,
      });

      if (res.data.success) {
        toast.success("Submission graded successfully!");
        setSubmissions(submissions.map(s => s._id === selectedSub._id ? { ...s, score: parseFloat(gradeScore) || 0, status: gradeStatus as any } : s));
        (document.getElementById("grade-submission-modal") as HTMLDialogElement).close();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save grading");
    } finally {
      setGrading(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch = (s.team?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "accepted": return "badge-success";
      case "under_review": return "badge-warning";
      case "rejected": return "badge-error";
      default: return "badge-ghost";
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12">
      <Title
        title="Contest Submissions"
        subtitle="Review, audit code repositories, download project files, and grade submissions."
      />

      {/* Search Bar */}
      <div className="join w-full bg-base-200 p-3.5 rounded-2xl border border-base-300">
        <span className="join-item bg-base-300 flex items-center px-4"><IconSearch size={18} /></span>
        <input
          type="text"
          placeholder="Search by team name or project description..."
          className="input input-bordered join-item w-full text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Submissions Grid */}
      {filteredSubmissions.length === 0 ? (
        <div className="card bg-base-200 border border-base-300 p-12 text-center text-base-content/60 italic rounded-2xl max-w-md mx-auto">
          No participant submissions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubmissions.map((sub) => (
            <div
              key={sub._id}
              className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base text-base-content leading-snug font-outfit">
                      Team: {sub.team?.name || "Independent"}
                    </h3>
                    <span className="text-[10px] text-base-content/40 font-mono">
                      Sub Ref: {sub._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <span className={`badge badge-sm font-bold uppercase ${getStatusColorClass(sub.status)}`}>
                    {sub.status.replace("_", " ")}
                  </span>
                </div>

                <hr className="border-base-300" />

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-base-content/40 uppercase">Project Description</span>
                  <p className="text-xs text-base-content/80 leading-relaxed font-sans">{sub.description}</p>
                </div>

                {/* Files & Links */}
                <div className="space-y-2">
                  {sub.files && sub.files.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-base-content/40 uppercase block">Uploaded Files</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sub.files.map((file, i) => (
                          <a
                            key={i}
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="badge badge-outline text-[10px] py-2.5 px-3 flex items-center gap-1 hover:bg-base-300"
                          >
                            <IconFolderOpen size={12} /> {file.filename} ({(file.size / 1024).toFixed(1)} KB)
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {sub.links && sub.links.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-base-content/40 uppercase block">Project Links</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sub.links.map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="badge badge-primary text-[10px] py-2.5 px-3 flex items-center gap-1 hover:opacity-90"
                          >
                            <IconExternalLink size={12} /> External URL
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Grading Actions */}
              <div className="border-t border-base-300 pt-3 flex justify-between items-center">
                <div className="flex items-center gap-1 bg-base-100 px-3 py-1.5 rounded-xl border border-base-300 font-mono text-xs font-bold text-secondary">
                  <IconStar size={14} className="fill-secondary text-secondary" /> Grade: {sub.score} pts
                </div>

                <button
                  onClick={() => handleOpenGradeModal(sub)}
                  className="btn btn-primary btn-sm rounded-xl text-xs px-5 text-white"
                >
                  Grade Submission
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GRADING MODAL */}
      <dialog id="grade-submission-modal" className="modal bg-base-100/60 backdrop-blur-sm">
        <div className="modal-box bg-base-200 border border-primary/40 rounded-3xl p-6 Orbitron">
          <h3 className="font-bold text-xl text-primary mb-4 font-outfit uppercase">Grade Contest Submission</h3>
          
          {selectedSub && (
            <div className="space-y-4 poppins">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Assign Score (Max 100) <span className="text-error">*</span></legend>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input input-bordered w-full rounded-xl"
                  placeholder="Enter score points..."
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Review Status</legend>
                <select
                  className="select select-bordered w-full"
                  value={gradeStatus}
                  onChange={(e) => setGradeStatus(e.target.value)}
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Reviewer Comments</legend>
                <textarea
                  className="textarea textarea-bordered w-full rounded-xl text-xs"
                  placeholder="Provide evaluation pro-tips or details..."
                  value={gradeComments}
                  onChange={(e) => setGradeComments(e.target.value)}
                />
              </fieldset>

              <div className="flex justify-end gap-3 border-t border-base-300 pt-4 mt-6">
                <button
                  onClick={() => (document.getElementById("grade-submission-modal") as HTMLDialogElement).close()}
                  className="btn btn-outline btn-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={grading}
                  onClick={handleSaveGrading}
                  className="btn btn-primary btn-sm rounded-xl text-white px-5"
                >
                  {grading ? "Saving..." : "Confirm & Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
