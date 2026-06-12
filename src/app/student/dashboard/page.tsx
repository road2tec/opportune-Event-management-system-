"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import Link from "next/link";
import Image from "next/image";
import {
  IconCalendarEvent,
  IconTrophy,
  IconUser,
  IconSparkles,
  IconCircleChevronRight,
  IconChevronRight,
  IconTarget,
  IconBulb,
  IconBuildingCommunity
} from "@tabler/icons-react";
import toast from "react-hot-toast";

interface RecommendedProgram {
  program: {
    _id: string;
    title: string;
    slug: string;
    coverImage?: string;
    programType: string;
    type: string;
    event?: {
      title: string;
      college?: {
        name: string;
      };
    };
  };
  matchPercentage: number;
  reasons: string[];
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    registered: 0,
    teamCollaborations: 0,
    skillsCount: 0
  });
  const [recommendations, setRecommendations] = useState<RecommendedProgram[]>([]);
  const [allEvents, setAllEvents] = useState<RecommendedProgram[]>([]);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch registered fests to compute dynamic counts
        const regRes = await axios.get("/api/students/registered-events");
        const regs = regRes.data.registrations || [];
        const teamsCount = regs.filter((r: any) => r.program?.type === "team").length;

        // Fetch student profile to see skills count
        const profRes = await axios.get("/api/student/profile");
        const profile = profRes.data.profile || {};
        const skillsCount = profile.profile?.skills?.length || 0;
        const interestsCount = profile.profile?.interests?.length || 0;

        setStats({
          registered: regs.length,
          teamCollaborations: teamsCount,
          skillsCount: skillsCount
        });

        setProfileComplete(skillsCount > 0 || interestsCount > 0);

        // Fetch AI recommendations
        const recRes = await axios.get("/api/student/recommendations");
        if (recRes.data.success) {
          setRecommendations(recRes.data.recommendations || []);
          setAllEvents(recRes.data.allEvents || []);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsItems = [
    {
      title: "Registered Programs",
      value: stats.registered.toString().padStart(2, "0"),
      icon: IconCalendarEvent,
      color: "text-primary",
      desc: "Programs registered in portals",
    },
    {
      title: "Team Collaborations",
      value: stats.teamCollaborations.toString().padStart(2, "0"),
      icon: IconTrophy,
      color: "text-secondary",
      desc: "Cross-college groups joined",
    },
    {
      title: "Profile Skills Tags",
      value: stats.skillsCount.toString().padStart(2, "0"),
      icon: IconUser,
      color: "text-accent",
      desc: "Skills added for AI matching",
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-8 poppins max-w-6xl mx-auto pb-16">
      <Title
        title="Student Dashboard"
        subtitle="Overview of your opportunities, team collaborations, and AI recommendations."
      />

      {/* Dynamic Stats Section */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-200/80 backdrop-blur-lg border border-base-300 rounded-3xl overflow-hidden">
        {statsItems.map((stat, index) => (
          <div key={index} className="stat p-6 bg-base-100/40">
            <div className="stat-figure text-3xl">
              <stat.icon className={stat.color} size={28} />
            </div>
            <div className="stat-title text-xs uppercase tracking-widest font-semibold opacity-60">{stat.title}</div>
            <div className={`stat-value font-outfit text-3xl font-extrabold my-1 ${stat.color}`}>{stat.value}</div>
            <div className="stat-desc text-xs text-base-content/50">{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* AI RECOMMENDATIONS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-outfit text-primary flex items-center gap-2">
            <IconSparkles size={24} className="text-accent animate-pulse" />
            AI Recommended Opportunities
          </h2>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary font-bold uppercase tracking-wider px-2 shadow">
              Recommended: {recommendations.length}
            </span>
            <span className="badge badge-accent badge-sm font-bold uppercase tracking-wider px-2 shadow hidden sm:inline-flex">
              Powered by Opportune AI
            </span>
          </div>
        </div>

        {/* Profile incomplete warning */}
        {!profileComplete && (
          <div className="alert bg-accent/10 border border-accent rounded-2xl flex gap-3 p-4 poppins shadow">
            <IconBulb size={24} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-base-content">Unlock highly personalized AI matches!</h4>
              <p className="text-xs text-base-content/85 mt-1 leading-relaxed">
                You haven't added tech skills or fest interests to your resume profile yet. Add them now to unlock intelligent, percentage-scored fests tailored just for you!
              </p>
            </div>
            <Link href="/student/profile" className="btn btn-accent btn-sm rounded-xl">
              Update Profile
            </Link>
          </div>
        )}

        {/* Recommendations list */}
        {recommendations.length === 0 ? (
          <div className="card bg-base-200/50 border border-base-300 p-6 rounded-3xl text-center max-w-md mx-auto">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <IconTarget size={20} />
            </div>
            <h4 className="font-bold text-sm">Recommended: 0</h4>
            <p className="text-[11px] text-base-content/65 mt-1 leading-relaxed">
              No matching programs found for your profile skills or interests. Update your profile or browse all available programs below.
            </p>
          </div>
        ) : (
          /* High Fidelity Recommendation Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {recommendations.map((rec) => (
              <div
                key={rec.program._id}
                className="card bg-base-100 border border-primary/20 hover:border-primary/50 shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden flex flex-col justify-between relative group"
              >
                {/* Match percentage badge overlay */}
                <div className="absolute top-3 right-3 z-10 bg-accent/90 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur flex items-center gap-1 font-mono">
                  <IconSparkles size={12} className="text-white" />
                  {rec.matchPercentage}% Match
                </div>

                <div>
                  {/* Card Image */}
                  <figure className="relative h-44 w-full bg-base-300/30 overflow-hidden">
                    <Image
                      src={rec.program.coverImage || "/placeholder.jpg"}
                      alt={rec.program.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute bottom-3 left-3 badge badge-primary text-[10px] uppercase font-bold tracking-wider py-1 shadow">
                      {rec.program.programType}
                    </span>
                  </figure>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest font-extrabold text-primary font-outfit">
                        {rec.program.event?.title || "Opportune Event"}
                      </span>
                      <h3 className="font-bold text-base text-base-content leading-snug line-clamp-1 font-outfit">
                        {rec.program.title}
                      </h3>
                      {rec.program.event?.college?.name && (
                        <p className="text-[10px] text-base-content/50 flex items-center gap-1">
                          <IconBuildingCommunity size={12} />
                          {rec.program.event.college.name}
                        </p>
                      )}
                    </div>

                    <hr className="border-base-200" />

                    {/* AI Recommendation Reason Bullet */}
                    <div className="bg-base-200/50 p-3 rounded-2xl border border-base-300/40 space-y-1.5">
                      <span className="text-[9px] font-extrabold tracking-wider text-accent uppercase font-outfit block">
                        🤖 AI Recommendation Reason:
                      </span>
                      <ul className="text-[10px] text-base-content/85 space-y-1 font-medium">
                        {rec.reasons.map((reason, rIdx) => (
                          <li key={rIdx} className="flex items-center gap-1">
                            <span className="text-accent font-bold">✦</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Footer link to participation page */}
                <div className="p-5 pt-0 mt-auto">
                  <Link
                    href={`/student/ongoing-events/program/${rec.program.slug}`}
                    className="btn btn-primary btn-sm w-full rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1"
                  >
                    View & Register
                    <IconCircleChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOTAL EVENTS / ALL OPPORTUNITIES SECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-t border-base-200 pt-6">
          <h2 className="text-2xl font-bold font-outfit text-primary flex items-center gap-2">
            <IconCalendarEvent size={24} className="text-secondary" />
            Total Events
          </h2>
          <span className="badge badge-secondary font-bold uppercase tracking-wider px-2 shadow">
            All: {allEvents.length}
          </span>
        </div>

        {allEvents.length === 0 ? (
          <div className="card bg-base-200/50 border border-base-300 p-8 rounded-3xl text-center max-w-lg mx-auto">
            <div className="w-12 h-12 bg-base-300 text-base-content/65 rounded-full flex items-center justify-center mx-auto mb-3">
              <IconCalendarEvent size={24} />
            </div>
            <h4 className="font-bold text-base">No Events Available</h4>
            <p className="text-xs text-base-content/65 mt-2 leading-relaxed">
              There are no published events available at this time. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {allEvents.map((item) => (
              <div
                key={item.program._id}
                className="card bg-base-100 border border-base-300 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden flex flex-col justify-between relative group"
              >
                <div>
                  {/* Card Image */}
                  <figure className="relative h-44 w-full bg-base-300/30 overflow-hidden">
                    <Image
                      src={item.program.coverImage || "/placeholder.jpg"}
                      alt={item.program.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute bottom-3 left-3 badge badge-secondary text-[10px] uppercase font-bold tracking-wider py-1 shadow">
                      {item.program.programType}
                    </span>
                  </figure>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest font-extrabold text-secondary font-outfit">
                        {item.program.event?.title || "Opportune Event"}
                      </span>
                      <h3 className="font-bold text-base text-base-content leading-snug line-clamp-1 font-outfit">
                        {item.program.title}
                      </h3>
                      {item.program.event?.college?.name && (
                        <p className="text-[10px] text-base-content/50 flex items-center gap-1">
                          <IconBuildingCommunity size={12} />
                          {item.program.event.college.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer link to participation page */}
                <div className="p-5 pt-0 mt-auto">
                  <Link
                    href={`/student/ongoing-events/program/${item.program.slug}`}
                    className="btn btn-outline btn-secondary btn-sm w-full rounded-2xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    View Details
                    <IconChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
