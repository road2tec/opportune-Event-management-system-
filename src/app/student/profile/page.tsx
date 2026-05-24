"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconUser,
  IconBuildingCommunity,
  IconMail,
  IconPhone,
  IconCode,
  IconEdit,
  IconCheck,
  IconRefresh,
  IconHeart,
  IconInfoCircle
} from "@tabler/icons-react";

interface College {
  name: string;
}

interface StudentProfile {
  name: string;
  email?: string;
  phone?: string;
  college?: College;
  profile?: {
    bio?: string;
    skills?: string[];
    interests?: string[];
  };
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit states
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editInterests, setEditInterests] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/student/profile");
      if (res.data.success) {
        const prof = res.data.profile;
        setProfile(prof);
        setEditName(prof.name || "");
        setEditPhone(prof.phone || "");
        setEditBio(prof.profile?.bio || "");
        setEditSkills((prof.profile?.skills || []).join(", "));
        setEditInterests((prof.profile?.interests || []).join(", "));
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.post("/api/student/profile", {
        name: editName,
        phone: editPhone,
        bio: editBio,
        skills: editSkills,
        interests: editInterests,
      });

      if (res.data.success) {
        toast.success("Profile details saved successfully!");
        setProfile(res.data.profile);
      }
    } catch (error) {
      console.error("Error saving student profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12 max-w-4xl mx-auto">
      <Title
        title="Student Profile"
        subtitle="Manage your personal resume details, skills tags, and fest interests."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Summary */}
        <div className="bg-base-200 border border-base-300 p-5 rounded-2xl shadow flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <IconUser size={42} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-base-content font-outfit">{profile.name}</h3>
            <span className="text-[10px] text-base-content/40 uppercase tracking-widest">Active Participant</span>
          </div>

          <hr className="border-base-300 w-full" />

          <div className="w-full space-y-2 text-left text-xs text-base-content/75">
            <div className="flex items-center gap-1.5"><IconBuildingCommunity size={14} className="text-secondary" /> <span className="truncate max-w-[200px] font-bold">{profile.college?.name || "Independent"}</span></div>
            <div className="flex items-center gap-1.5"><IconMail size={14} /> <span className="truncate max-w-[200px]">{profile.email || "N/A"}</span></div>
            <div className="flex items-center gap-1.5"><IconPhone size={14} /> <span>{profile.phone || "N/A"}</span></div>
          </div>
        </div>

        {/* Right Card: Editor Form */}
        <div className="md:col-span-2 bg-base-200 border border-base-300 p-6 rounded-2xl shadow space-y-6">
          <h3 className="font-bold text-lg text-base-content flex items-center gap-1.5 font-outfit uppercase border-b border-base-300 pb-3">
            <IconEdit size={18} className="text-primary" /> Profile Credentials
          </h3>

          <div className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Display Name</legend>
              <input
                type="text"
                className="input input-bordered w-full rounded-xl"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Contact Phone</legend>
              <input
                type="text"
                className="input input-bordered w-full rounded-xl"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend"><IconInfoCircle size={14} /> Short Resume Bio</legend>
              <textarea
                className="textarea textarea-bordered w-full rounded-xl text-xs"
                placeholder="Share your tech experiences or fest motivation..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend"><IconCode size={14} /> Tech Skills (Comma Separated)</legend>
              <input
                type="text"
                className="input input-bordered w-full rounded-xl text-xs font-mono"
                placeholder="e.g. Next.js, React, Node.js, ML, Figma"
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend"><IconHeart size={14} /> Fest Interests (Comma Separated)</legend>
              <input
                type="text"
                className="input input-bordered w-full rounded-xl text-xs font-mono"
                placeholder="e.g. Hackathons, Coding Trivia, Workshops, Quiz"
                value={editInterests}
                onChange={(e) => setEditInterests(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="flex justify-end gap-3 border-t border-base-300 pt-4 mt-6">
            <button onClick={fetchProfile} className="btn btn-outline btn-sm rounded-xl">
              <IconRefresh size={16} className="mr-1" /> Reset
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn btn-primary btn-sm rounded-xl text-white px-6"
            >
              <IconCheck size={16} className="mr-1" /> {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
