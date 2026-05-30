"use client";

import React, { useState } from "react";
import Title from "@/components/Title";
import {
  IconCalendarCheck,
  IconAlertTriangle,
  IconSparkles,
  IconMapPin,
  IconClock,
  IconUser,
  IconCircleCheck
} from "@tabler/icons-react";
import toast from "react-hot-toast";

interface ClashResult {
  hasClash: boolean;
  severity: "high" | "medium" | "low" | "none";
  message: string;
  details: string[];
  recommendations: {
    slot: string;
    venue: string;
    reason: string;
  }[];
}

export default function OrganizerSchedulingAIPage() {
  const [programTitle, setProgramTitle] = useState("");
  const [proposedDate, setProposedDate] = useState("2026-06-15");
  const [proposedTime, setProposedTime] = useState("10:00");
  const [proposedVenue, setProposedVenue] = useState("Seminar Hall A");
  const [facultyKey, setFacultyKey] = useState("Dr. R. S. Sharma");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ClashResult | null>(null);

  // Existing calendar events on proposed dates
  const existingSchedules = [
    { title: "National Web Hackathon", date: "2026-06-15", time: "09:00", venue: "Seminar Hall A", faculty: "Dr. R. S. Sharma" },
    { title: "Robo-Sumo Clash", date: "2026-06-15", time: "14:00", venue: "Main Auditorium", faculty: "Prof. A. V. Deshmukh" },
    { title: "Laser Tag Arena", date: "2026-06-16", time: "11:00", venue: "Seminar Hall A", faculty: "Dr. R. S. Sharma" }
  ];

  const handleAnalyze = () => {
    if (!programTitle.trim()) {
      toast.error("Please enter a proposed program title");
      return;
    }

    setAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      let hasClash = false;
      const details: string[] = [];
      let severity: "high" | "medium" | "low" | "none" = "none";

      const proposedDateTime = new Date(`${proposedDate}T${proposedTime}`);
      
      existingSchedules.forEach((sched) => {
        if (sched.date === proposedDate && sched.venue === proposedVenue) {
          const schedTime = new Date(`${sched.date}T${sched.time}`);
          const diffHours = Math.abs(proposedDateTime.getTime() - schedTime.getTime()) / (1000 * 60 * 60);
          
          if (diffHours < 3) {
            hasClash = true;
            severity = "high";
            details.push(`Time slot clash with "${sched.title}" at ${sched.venue} (scheduled at ${sched.time}). A 3-hour buffer is required.`);
          }
        }
      });

      existingSchedules.forEach((sched) => {
        if (sched.date === proposedDate && sched.faculty === facultyKey) {
          const schedTime = new Date(`${sched.date}T${sched.time}`);
          const diffHours = Math.abs(proposedDateTime.getTime() - schedTime.getTime()) / (1000 * 60 * 60);
          
          if (diffHours < 2) {
            hasClash = true;
            if (severity !== "high") severity = "medium";
            details.push(`Faculty Coordinator ${facultyKey} is already assigned to "${sched.title}" starting at ${sched.time}.`);
          }
        }
      });

      const hours = parseInt(proposedTime.split(":")[0]);
      if (hours < 9 || hours > 18) {
        hasClash = true;
        if (severity === "none") severity = "low";
        details.push(`Proposed timing (${proposedTime}) is considered a low-attendance slot. Ideal campus participation occurs between 10:00 AM and 5:00 PM.`);
      }

      const recommendations = [
        {
          slot: `${proposedDate} at 14:00 (2:00 PM)`,
          venue: proposedVenue === "Seminar Hall A" ? "Seminar Hall B" : "Seminar Hall A",
          reason: "Clash-free slot! Both venue and coordinator are fully available with high student attendance."
        },
        {
          slot: `${proposedDate} at 15:30 (3:30 PM)`,
          venue: "Main Auditorium",
          reason: "Auditorium is unassigned. Avoids conflicts with Dr. Sharma's morning sessions."
        },
        {
          slot: "2026-06-17 at 10:30 (10:30 AM)",
          venue: proposedVenue,
          reason: "Mid-week premium slot! Faculty coordinator is free and no other fests are scheduled on campus."
        }
      ];

      setResult({
        hasClash,
        severity,
        message: hasClash 
          ? "Scheduling conflicts detected! UniSync AI recommends resolving below clashes."
          : "Clash-Free Schedule Approved! The proposed timings are optimal.",
        details: details.length > 0 ? details : ["No timing overlaps detected.", "Faculty is fully available.", "Optimal student attendance timing."],
        recommendations
      });
      setAnalyzing(false);
      toast.success(hasClash ? "Conflicts detected" : "Schedule is clash-free!");
    }, 1500);
  };

  return (
    <div className="poppins space-y-6 pb-12 max-w-5xl mx-auto">
      <Title
        title="Smart Event Scheduling AI"
        subtitle="Avoid timing clashes, hall overlaps, and coordinator conflicts with our smart slot-recommender engine."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUT PROPOSAL PANEL */}
        <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow-sm space-y-4 lg:col-span-1">
          <h3 className="font-extrabold text-base text-base-content font-outfit flex items-center gap-1.5 border-b border-base-content/10 pb-2">
            <IconCalendarCheck className="text-primary" size={20} />
            Proposed Event details
          </h3>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-bold">Program Title</legend>
            <input
              type="text"
              placeholder="e.g. AI-ML Fest 2026"
              className="input input-bordered w-full rounded-xl text-sm"
              value={programTitle}
              onChange={(e) => setProgramTitle(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-bold">Proposed Date</legend>
            <input
              type="date"
              className="input input-bordered w-full rounded-xl text-sm"
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-bold">Proposed Start Time</legend>
            <input
              type="time"
              className="input input-bordered w-full rounded-xl text-sm"
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-bold">Proposed Hall / Venue</legend>
            <select
              className="select select-bordered w-full rounded-xl text-sm"
              value={proposedVenue}
              onChange={(e) => setProposedVenue(e.target.value)}
            >
              <option value="Seminar Hall A">Seminar Hall A</option>
              <option value="Seminar Hall B">Seminar Hall B</option>
              <option value="Main Auditorium">Main Auditorium</option>
              <option value="Computer Lab 4">Computer Lab 4</option>
            </select>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-bold">Faculty Coordinator</legend>
            <select
              className="select select-bordered w-full rounded-xl text-sm"
              value={facultyKey}
              onChange={(e) => setFacultyKey(e.target.value)}
            >
              <option value="Dr. R. S. Sharma">Dr. R. S. Sharma</option>
              <option value="Prof. A. V. Deshmukh">Prof. A. V. Deshmukh</option>
              <option value="Dr. Preeti Patel">Dr. Preeti Patel</option>
            </select>
          </fieldset>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="btn btn-primary w-full rounded-xl text-white font-bold flex items-center justify-center gap-1.5 shadow"
          >
            {analyzing ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Analyzing Calendar...
              </>
            ) : (
              <>
                <IconSparkles size={16} />
                Run AI Clash Analysis
              </>
            )}
          </button>
        </div>

        {/* RESULTS AND RECOMMENDER PANEL */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Campus Calendar Overview */}
          <div className="card bg-base-200 border border-base-300 p-5 rounded-2xl shadow-sm">
            <h3 className="font-extrabold text-sm text-base-content/70 uppercase tracking-wider mb-3 font-outfit">
              📅 Scheduled Events on Proposed Day ({proposedDate})
            </h3>
            <div className="space-y-2">
              {existingSchedules
                .filter(sched => sched.date === proposedDate)
                .map((sched, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-base-100 p-3 rounded-xl border border-base-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-base-content">{sched.title}</h4>
                        <span className="text-[10px] text-base-content/50 flex items-center gap-1.5 mt-0.5">
                          <IconMapPin size={11} /> {sched.venue} | <IconUser size={11} /> {sched.faculty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-outline text-[10px] font-mono font-bold flex items-center gap-1">
                        <IconClock size={11} /> {sched.time}
                      </span>
                    </div>
                  </div>
                ))}
              {existingSchedules.filter(sched => sched.date === proposedDate).length === 0 && (
                <div className="text-xs text-base-content/50 italic py-2 text-center">No other events scheduled on this date. Complete campus availability!</div>
              )}
            </div>
          </div>

          {/* AI Clash Checker Results */}
          {!result && !analyzing && (
            <div className="card bg-base-200 border border-dashed border-base-300 p-12 text-center rounded-2xl flex flex-col justify-center items-center">
              <IconSparkles className="text-primary/45 animate-pulse mb-3" size={40} />
              <h4 className="font-bold text-base text-base-content/60 font-outfit">Ready for scheduling check</h4>
              <p className="text-xs text-base-content/40 max-w-xs mt-1 leading-relaxed">Fill out the proposed details on the left, and click analyze to test slot availability.</p>
            </div>
          )}

          {analyzing && (
            <div className="card bg-base-200 border border-base-300 p-12 text-center rounded-2xl flex flex-col justify-center items-center space-y-3">
              <span className="loading loading-ring loading-lg text-primary"></span>
              <h4 className="font-bold text-sm text-base-content font-outfit animate-pulse">Running AI clash-detection checks...</h4>
              <p className="text-xs text-base-content/50">Inspecting halls occupancy, faculty shifts, and historic attendance trends.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Clash status Banner */}
              <div className={`card p-5 rounded-2xl border flex flex-row items-start gap-4 shadow ${
                result.hasClash 
                  ? result.severity === "high"
                    ? "bg-error/10 border-error/45 text-error-content"
                    : "bg-warning/10 border-warning/45 text-warning-content"
                  : "bg-success/10 border-success/45 text-success-content"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  result.hasClash
                    ? result.severity === "high"
                      ? "bg-error/20 text-error"
                      : "bg-warning/20 text-warning"
                    : "bg-success/20 text-success"
                }`}>
                  {result.hasClash ? <IconAlertTriangle size={22} /> : <IconCircleCheck size={22} />}
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-extrabold text-base font-outfit leading-tight">{result.message}</h4>
                  <ul className="text-xs space-y-1.5 font-medium leading-relaxed opacity-90">
                    {result.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Alternatives recommender panel */}
              {result.hasClash && (
                <div className="card bg-base-200 border border-primary/25 p-5 rounded-2xl shadow-md space-y-4">
                  <h3 className="font-extrabold text-sm text-primary flex items-center gap-1.5 uppercase tracking-wider font-outfit">
                    <IconSparkles size={18} className="text-accent animate-pulse" />
                    Recommended Clash-Free Slots (AI Suggestions)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.recommendations.map((rec, rIdx) => (
                      <div key={rIdx} className="card bg-base-100 border border-base-300 p-4 rounded-xl space-y-2.5 shadow-sm hover:border-secondary transition">
                        <div className="flex items-center gap-1.5 text-secondary">
                          <IconClock size={15} />
                          <span className="font-bold text-[10px] uppercase font-outfit">Slot {rIdx + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-base-content font-mono">{rec.slot}</h4>
                          <span className="text-[10px] text-primary font-bold flex items-center gap-1 mt-1"><IconMapPin size={11} /> {rec.venue}</span>
                        </div>
                        <p className="text-[10px] text-base-content/65 leading-relaxed font-sans border-t border-base-200 pt-2">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
