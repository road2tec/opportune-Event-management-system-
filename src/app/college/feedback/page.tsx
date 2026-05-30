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
  IconCalendar,
  IconSparkles
} from "@tabler/icons-react";
import formatDate from "@/helper/FormatDate";

interface User {
  name: string;
  profileImage?: string;
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
  aiAnalysis?: {
    sentiment: "positive" | "neutral" | "negative";
    satisfaction: number;
    tags: string[];
  };
}

export default function CollegeFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/college/feedback");
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks);
        setAnalytics(res.data.analytics);
      }
    } catch (error) {
      console.error("Error fetching college feedback:", error);
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
        title="Feedback & Reviews"
        subtitle="Review participant experience scores and comments submitted by contestants on your college programs."
      />

      {/* AI Sentiment Suite Analytics Dash */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-base-200/60 p-5 rounded-3xl border border-base-300 shadow-md">
          {/* Stat 1: Overall Sentiment */}
          <div className="bg-base-100/40 p-4 rounded-2xl border border-base-300 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-base-content/40">Overall Sentiment</span>
              <h3 className="text-2xl font-extrabold text-emerald-500 font-outfit mt-1 flex items-center gap-1">
                {analytics.positivePercent}% Positive
              </h3>
              <p className="text-[10px] text-base-content/50 mt-1">Neutral: {analytics.neutralPercent}% | Negative: {analytics.negativePercent}%</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center font-bold text-lg animate-pulse">
              😊
            </div>
          </div>

          {/* Stat 2: Satisfaction Score */}
          <div className="bg-base-100/40 p-4 rounded-2xl border border-base-300 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-base-content/40">Satisfaction Index</span>
              <h3 className="text-2xl font-extrabold text-primary font-outfit mt-1">{analytics.averageSatisfaction}/100</h3>
              <div className="w-24 bg-base-300 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${analytics.averageSatisfaction}%` }}></div>
              </div>
            </div>
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
              📈
            </div>
          </div>

          {/* Stat 3: Primary Focus Areas */}
          <div className="bg-base-100/40 p-4 rounded-2xl border border-base-300 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-base-content/40">Key Focus Areas</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {analytics.improvementAreas && analytics.improvementAreas.length > 0 ? (
                  analytics.improvementAreas.map((area: any, idx: number) => (
                    <span key={idx} className="badge badge-warning text-[9px] font-black uppercase py-2.5 px-2 tracking-wide rounded">
                      {area.name}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-emerald-500 font-bold">Excellent Logistics!</span>
                )}
              </div>
            </div>
            <div className="w-10 h-10 bg-warning/10 text-warning rounded-full flex items-center justify-center font-bold text-lg animate-bounce">
              🎯
            </div>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="card bg-base-200 border border-base-300 p-8 text-center text-base-content/60 italic rounded-2xl">
            No feedback entries found.
          </div>
        ) : (
          feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow-sm space-y-4"
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

              {/* Program details & Sentiment Badging */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-base-300/40 pb-2">
                <div className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 font-outfit">
                  <IconTrophy size={13} /> {fb.program?.title}
                </div>

                {/* AI Sentiment badge status tag */}
                {fb.aiAnalysis && (
                  <div className="flex items-center gap-1.5 font-outfit">
                    <span className={`badge border-none font-bold text-[9px] uppercase tracking-wider px-2 py-2 rounded ${
                      fb.aiAnalysis.sentiment === "positive"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : fb.aiAnalysis.sentiment === "negative"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {fb.aiAnalysis.sentiment === "positive" 
                        ? "✦ Positive Sentiment" 
                        : fb.aiAnalysis.sentiment === "negative" 
                        ? "⚠️ Critical Review" 
                        : "✦ Neutral Analysis"}
                    </span>
                    <span className="badge badge-outline text-[9px] font-bold uppercase py-2 rounded">
                      Score: {fb.aiAnalysis.satisfaction}%
                    </span>
                  </div>
                )}
              </div>

              {/* Comments */}
              <p className="text-xs text-base-content/85 italic bg-base-100/55 p-3 rounded-xl border border-base-300/40 leading-relaxed font-sans">
                "{fb.comments}"
              </p>

              {/* AI tags extracted */}
              {fb.aiAnalysis?.tags && fb.aiAnalysis.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                  <span className="text-base-content/40 font-bold uppercase tracking-wider mr-1">Extracted Categories:</span>
                  {fb.aiAnalysis.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="badge badge-ghost badge-sm text-[9px] border border-base-300/80 px-2 py-0.5 rounded text-base-content/60 font-mono">
                      #{tag.replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
