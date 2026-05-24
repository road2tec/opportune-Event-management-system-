"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  IconSearch,
  IconUser,
  IconBuildingCommunity,
  IconAlertCircle,
  IconCheck,
  IconTrash,
  IconUserCheck,
  IconMail,
  IconPhone
} from "@tabler/icons-react";
interface College {
  _id: string;
  name: string;
  code?: string;
  email: string;
  phone?: string;
  profileImage?: string;
  website?: string;
  stats?: {
    status?: string;
  };
}

interface Student {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  college?: {
    name: string;
  } | string;
  status: "active" | "inactive" | "banned";
  createdAt?: string;
}

export default function AdminUserManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "colleges">("students");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/users");
      if (res.data.success) {
        setStudents(res.data.students);
        setColleges(res.data.colleges);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (id: string, role: "student" | "college", newStatus: string) => {
    try {
      const res = await axios.put("/api/admin/users", { id, role, status: newStatus });
      if (res.data.success) {
        toast.success("User status updated successfully");
        if (role === "student") {
          setStudents(students.map(s => s._id === id ? { ...s, status: newStatus as any } : s));
        } else {
          setColleges(colleges.map(c => c._id === id ? { ...c, stats: { ...c.stats, status: newStatus } } : c));
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteUser = async (id: string, role: "student" | "college") => {
    if (!window.confirm(`Are you sure you want to delete this ${role}? This action is irreversible!`)) return;
    try {
      const res = await axios.delete(`/api/admin/users?id=${id}&role=${role}`);
      if (res.data.success) {
        toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} deleted successfully`);
        if (role === "student") {
          setStudents(students.filter(s => s._id !== id));
        } else {
          setColleges(colleges.filter(c => c._id !== id));
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Filters
  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || (s.email || "").toLowerCase().includes(term);
  });

  const filteredColleges = colleges.filter((c) => {
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
  });

  if (loading) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12">
      <Title
        title="User Management"
        subtitle="Overview and access control of students and colleges registered on Opportune."
      />

      {/* Tabs Menu */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-base-200 p-2.5 rounded-2xl border border-base-300">
        <div className="flex gap-1">
          <button
            onClick={() => { setActiveTab("students"); setSearchTerm(""); }}
            className={`btn btn-sm rounded-xl border-none ${
              activeTab === "students" ? "btn-primary text-white shadow" : "btn-ghost"
            }`}
          >
            <IconUser size={16} className="mr-1" />
            Students ({students.length})
          </button>
          <button
            onClick={() => { setActiveTab("colleges"); setSearchTerm(""); }}
            className={`btn btn-sm rounded-xl border-none ${
              activeTab === "colleges" ? "btn-primary text-white shadow" : "btn-ghost"
            }`}
          >
            <IconBuildingCommunity size={16} className="mr-1" />
            Colleges ({colleges.length})
          </button>
        </div>

        {/* Search */}
        <div className="join max-w-xs w-full">
          <span className="join-item bg-base-300 flex items-center px-3.5"><IconSearch size={15} /></span>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="input input-bordered input-sm join-item w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* STUDENTS VIEW */}
      {activeTab === "students" && (
        <div className="overflow-x-auto bg-base-200 rounded-2xl border border-base-300 shadow-md">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-base-content/60">No students registered yet.</div>
          ) : (
            <table className="table w-full">
              <thead>
                <tr className="bg-base-300/40 text-base-content/75 font-semibold">
                  <th>Student Info</th>
                  <th>Contact Details</th>
                  <th>Affiliated College</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-base-300/10 border-b border-base-300/40">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10 bg-base-300">
                            <img
                              src={student.profileImage || "/college-placeholder.png"}
                              alt={student.name}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-base-content">{student.name}</div>
                          <div className="text-[10px] text-base-content/40">Role: Student</div>
                        </div>
                      </div>
                    </td>
                    <td className="space-y-0.5 text-xs text-base-content/70">
                      <div className="flex items-center gap-1"><IconMail size={12} /> {student.email || "N/A"}</div>
                      <div className="flex items-center gap-1"><IconPhone size={12} /> {student.phone || "N/A"}</div>
                    </td>
                    <td className="text-xs font-semibold text-base-content/85 truncate max-w-[150px]">
                      {typeof student.college === "object" ? student.college.name : student.college || "Not Specified"}
                    </td>
                    <td>
                      <span className={`badge badge-sm font-bold capitalize ${
                        student.status === "active" ? "badge-success" : 
                        student.status === "banned" ? "badge-error" : "badge-ghost"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {student.status === "active" ? (
                          <button
                            onClick={() => handleUpdateStatus(student._id, "student", "banned")}
                            className="btn btn-warning btn-xs rounded-lg text-white"
                            title="Ban Student"
                          >
                            <IconAlertCircle size={14} className="mr-0.5" /> Ban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(student._id, "student", "active")}
                            className="btn btn-success btn-xs rounded-lg text-white"
                            title="Unban Student"
                          >
                            <IconUserCheck size={14} className="mr-0.5" /> Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(student._id, "student")}
                          className="btn btn-error btn-outline btn-xs rounded-lg"
                          title="Delete User"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* COLLEGES VIEW */}
      {activeTab === "colleges" && (
        <div className="overflow-x-auto bg-base-200 rounded-2xl border border-base-300 shadow-md">
          {filteredColleges.length === 0 ? (
            <div className="p-12 text-center text-base-content/60">No colleges registered yet.</div>
          ) : (
            <table className="table w-full">
              <thead>
                <tr className="bg-base-300/40 text-base-content/75 font-semibold">
                  <th>College Info</th>
                  <th>Code</th>
                  <th>Email & Contacts</th>
                  <th>Website</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredColleges.map((college) => (
                  <tr key={college._id} className="hover:bg-base-300/10 border-b border-base-300/40">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10 bg-base-300">
                            <img
                              src={college.profileImage || "/college-placeholder.png"}
                              alt={college.name}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-base-content leading-tight max-w-[200px] truncate">{college.name}</div>
                          <div className="text-[10px] text-base-content/40">Role: Institution</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs font-bold text-secondary">
                      {college.code || "N/A"}
                    </td>
                    <td className="space-y-0.5 text-xs text-base-content/70">
                      <div className="flex items-center gap-1"><IconMail size={12} /> {college.email}</div>
                      <div className="flex items-center gap-1"><IconPhone size={12} /> {college.phone || "N/A"}</div>
                    </td>
                    <td className="text-xs">
                      {college.website ? (
                        <a href={college.website} target="_blank" rel="noreferrer" className="link link-primary font-medium truncate max-w-[120px] block">
                          {college.website}
                        </a>
                      ) : "N/A"}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDeleteUser(college._id, "college")}
                        className="btn btn-error btn-outline btn-xs rounded-lg"
                        title="Delete College"
                      >
                        <IconTrash size={14} className="mr-0.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
