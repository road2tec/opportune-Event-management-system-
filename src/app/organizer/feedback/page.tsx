"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import toast from "react-hot-toast";
import {
  IconMessageCircle,
  IconStar,
  IconTrophy,
  IconUser,
  IconCalendar
} from "@tabler/icons-react";
import formatDate from "@/helper/FormatDate";

interface User {
  name: string;
}

interface Program {
  title: string;
}

interface Feedback {
  _id: string;
  rating: number;
  comments: string;
  createdAt: string;
  user?: User;
  program?: Program;
}

export default function OrganizerFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/organizer/feedback");
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks);
      }
    } catch (error) {
      console.error("Error fetching organizer feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <IconStar
        key={idx}
        size={14}
        className={idx < rating ? "text-amber-500 fill-amber-500" : "text-base-content/20"}
      />
    ));
  };

  if (loading) return <Loading />;

  return (
    <div className="poppins space-y-6 pb-12 max-w-4xl mx-auto">
      <Title
        title="Feedback & Program Reviews"
        subtitle="Review participant experience scores and comments submitted by contestants on programs under your supervision."
      />

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="card bg-base-200 border border-base-300 p-8 text-center text-base-content/60 italic rounded-2xl">
            No feedback entries found.
          </div>
        ) : (
          feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow-sm space-y-3"
            >
              {/* Header */}
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-9 h-9 rounded-full bg-base-300 flex items-center justify-center">
                      <IconUser size={18} className="text-primary/70" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-base-content leading-tight">{fb.user?.name || "Anonymous Participant"}</h4>
                    <span className="text-[10px] text-base-content/40 flex items-center gap-0.5"><IconCalendar size={11} /> {formatDate(new Date(fb.createdAt))}</span>
                  </div>
                </div>

                <div className="flex gap-0.5 bg-base-100 px-2 py-1 rounded-xl border border-base-300">
                  {renderStars(fb.rating)}
                </div>
              </div>

              {/* Program details */}
              <div className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 font-outfit">
                <IconTrophy size={13} /> {fb.program?.title}
              </div>

              {/* Comments */}
              <p className="text-xs text-base-content/85 italic bg-base-100/55 p-3 rounded-xl border border-base-300/40 leading-relaxed font-sans">
                "{fb.comments}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
