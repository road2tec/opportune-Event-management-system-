"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  IconSearch,
  IconCalendar,
  IconBuildingCommunity,
  IconTrash,
  IconCheck,
  IconX,
  IconEye,
  IconRefresh
} from "@tabler/icons-react";
import formatDate from "@/helper/FormatDate";

interface College {
  name: string;
}

interface Event {
  _id: string;
  title: string;
  description?: string;
  college?: College;
  startDate?: string;
  endDate?: string;
  status: "draft" | "published" | "archived" | "completed" | "cancelled";
  coverImage?: string;
  popularityScore: number;
}

export default function AdminManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/events");
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await axios.put("/api/admin/events", { id, status: newStatus });
      if (res.data.success) {
        toast.success(res.data.message || "Status updated successfully");
        setEvents(events.map(event => event._id === id ? { ...event, status: newStatus as any } : event));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This will also delete all associated programs!")) return;
    try {
      const res = await axios.delete(`/api/admin/events?id=${id}`);
      if (res.data.success) {
        toast.success("Event and all programs deleted successfully");
        setEvents(events.filter(event => event._id !== id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete event");
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (event.college?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
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

  if (loading) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12">
      <Title
        title="Manage Events"
        subtitle="Review, approve, cancel, or delete fests and events across all colleges."
      />

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-base-200 p-4 rounded-2xl border border-base-300">
        <fieldset className="fieldset col-span-2">
          <legend className="fieldset-legend">Search events</legend>
          <div className="join w-full">
            <span className="join-item bg-base-300 flex items-center px-4"><IconSearch size={18} /></span>
            <input
              type="text"
              placeholder="Search by event title or college name..."
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
            <option value="draft">Draft (Pending)</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </fieldset>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="card bg-base-200 border border-base-300 p-12 text-center rounded-3xl max-w-md mx-auto">
          <h4 className="text-xl font-bold font-outfit text-base-content/60">No Events Found</h4>
          <p className="text-xs text-base-content/50 mt-1">Try relaxing your search terms or filter constraints.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="card bg-base-100 border border-base-300 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl flex flex-col justify-between"
            >
              <div>
                {/* Event Image Banner */}
                <div className="relative h-44 w-full bg-base-300/40">
                  <Image
                    src={event.coverImage || "/placeholder.jpg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <span className={`absolute top-3 right-3 badge ${getStatusBadgeClass(event.status)} font-bold text-[10px] uppercase py-2 shadow-md`}>
                    {event.status}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary/80 uppercase tracking-wider">
                    <IconBuildingCommunity size={13} />
                    <span className="truncate max-w-[200px]">{event.college?.name || "Independent Organizer"}</span>
                  </div>

                  <h3 className="text-lg font-bold text-base-content leading-snug line-clamp-1 font-outfit">
                    {event.title}
                  </h3>

                  <p className="text-xs text-base-content/60 line-clamp-3 leading-relaxed">
                    {event.description || "No description available."}
                  </p>

                  <hr className="border-base-200" />

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-xs text-base-content/50">
                    <IconCalendar size={14} className="text-secondary" />
                    <span>
                      {event.startDate ? formatDate(new Date(event.startDate)) : "TBD"} → {event.endDate ? formatDate(new Date(event.endDate)) : "TBD"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex justify-between items-center gap-2">
                <button
                  onClick={() => handleDeleteEvent(event._id)}
                  className="btn btn-error btn-outline btn-sm rounded-xl px-3"
                  title="Delete Event"
                >
                  <IconTrash size={16} />
                </button>

                <div className="flex gap-1">
                  {event.status === "draft" && (
                    <button
                      onClick={() => handleUpdateStatus(event._id, "published")}
                      className="btn btn-success btn-sm rounded-xl text-white text-xs px-4"
                    >
                      <IconCheck size={14} className="mr-1" /> Approve
                    </button>
                  )}
                  {event.status === "published" && (
                    <button
                      onClick={() => handleUpdateStatus(event._id, "cancelled")}
                      className="btn btn-warning btn-sm rounded-xl text-white text-xs px-4"
                    >
                      <IconX size={14} className="mr-1" /> Cancel
                    </button>
                  )}
                  {event.status === "cancelled" && (
                    <button
                      onClick={() => handleUpdateStatus(event._id, "published")}
                      className="btn btn-primary btn-sm rounded-xl text-white text-xs px-4"
                    >
                      <IconRefresh size={14} className="mr-1" /> Re-publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
