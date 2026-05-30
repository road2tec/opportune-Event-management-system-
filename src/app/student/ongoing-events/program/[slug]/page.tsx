"use client";

import Loading from "@/components/Loading";
import { Program } from "@/Types";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  IconCalendar,
  IconMail,
  IconPhone,
  IconUser,
  IconTrophy,
  IconUsersGroup,
  IconClipboardList,
  IconClockHour4,
  IconPlus,
  IconUserPlus,
  IconLock,
  IconKey,
  IconCopy,
  IconAlertCircle,
  IconCheck,
  IconX
} from "@tabler/icons-react";
import formatDate from "@/helper/FormatDate";
import Timer from "@/helper/Timer";
import toast from "react-hot-toast";

export default function ProgramReadMorePage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);

  // Participation Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<"select" | "create" | "join" | "success" | "confirm">("select");
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [teamPassword, setTeamPassword] = useState("");
  const [createdTeam, setCreatedTeam] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProgramDetails = async (slug: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/programs/program?slug=${slug}`);
      setProgram(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchProgramDetails(slug as string);
  }, [slug]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Participation Action Submit
  const handleParticipate = async (actionType: "individual" | "create-team" | "join-team") => {
    if (!program) return;
    
    // Validations
    if (actionType === "create-team" && (!teamName || teamName.trim() === "")) {
      toast.error("Please enter a team name");
      return;
    }
    if (actionType === "join-team" && (!teamCode || !teamPassword)) {
      toast.error("Please enter team code and password");
      return;
    }

    setSubmitting(true);
    try {
      const price = program.pricePerTeam || 0;

      // Paid event and not joining a team -> Open Razorpay Checkout popup
      if (price > 0 && actionType !== "join-team") {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error("Failed to load payment gateway. Please check your network.");
          setSubmitting(false);
          return;
        }

        // Get Razorpay order from server
        const orderRes = await axios.post("/api/payment/create-order", {
          programId: program._id,
        });

        if (!orderRes.data.success) {
          toast.error("Failed to generate payment order. Please try again.");
          setSubmitting(false);
          return;
        }

        const { orderId, amount, currency, keyId } = orderRes.data;

        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "UniSync",
          description: `Registration fee for ${program.title}`,
          order_id: orderId,
          handler: async function (response: any) {
            setSubmitting(true);
            try {
              const payload = {
                action: actionType,
                programId: program._id,
                teamName,
                teamCode,
                teamPassword,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };

              const res = await axios.post("/api/programs/participate", payload);
              toast.success(res.data.message || "Registration Successful!");

              if (actionType === "create-team") {
                setCreatedTeam(res.data.team);
                setModalAction("success");
              } else {
                setShowModal(false);
                fetchProgramDetails(slug as string);
              }
            } catch (error: any) {
              console.error(error);
              const errMsg = error.response?.data?.message || "Payment verified but registration failed.";
              toast.error(errMsg);
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              toast.error("Payment cancelled by user");
              setSubmitting(false);
            },
          },
          prefill: {
            name: "",
            email: "",
          },
          theme: {
            color: "#7c3aed",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // Free events or join-team flows
      const payload = {
        action: actionType,
        programId: program._id,
        teamName,
        teamCode,
        teamPassword
      };

      const res = await axios.post("/api/programs/participate", payload);
      
      toast.success(res.data.message || "Registration Successful!");
      
      if (actionType === "create-team") {
        setCreatedTeam(res.data.team);
        setModalAction("success");
      } else {
        // Individual or Joined
        setShowModal(false);
        fetchProgramDetails(slug as string); // reload program details
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Copy Credentials to Clipboard
  const handleCopyCredentials = () => {
    if (!createdTeam) return;
    const text = `Join my team "${createdTeam.name}" on Opportune!\nTeam Code: ${createdTeam.credentials.teamCode}\nPassword: ${createdTeam.credentials.password}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard! Share with your teammates.");
  };

  if (loading || !program) return <Loading />;

  return (
    <div className="p-6 mx-auto border border-accent shadow-lg rounded-2xl bg-base-200/40 space-y-4 Orbitron">
      {/* Header Image */}
      <figure className="relative h-64 w-full overflow-hidden rounded-xl shadow-sm">
        <Image
          src={program.coverImage || "/placeholder.jpg"}
          alt={program.title}
          fill
          className="object-contain bg-base-300/30"
        />
      </figure>

      {/* Program Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-semibold text-base-content">
            {program.title}
          </h1>
          <div
            className={`badge capitalize ${
              program.status === "published"
                ? "badge-success"
                : program.status === "ongoing"
                ? "badge-info"
                : program.status === "completed"
                ? "badge-neutral"
                : program.status === "cancelled"
                ? "badge-error"
                : "badge-ghost"
            }`}
          >
            {program.status}
          </div>
        </div>

        <p className="text-base text-base-content/80 leading-relaxed whitespace-pre-line poppins">
          {program.description || "No description available."}
        </p>

        <div className="badge badge-outline capitalize">
          {program.programType}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm text-base-content/70">
          <div className="flex items-center gap-2">
            <IconCalendar size={16} />
            <span>
              {program.registrationStart
                ? formatDate(program.registrationStart)
                : "TBD"}{" "}
              →{" "}
              {program.registrationEnd
                ? formatDate(program.registrationEnd)
                : "TBD"}
            </span>
          </div>
          <div>
            <Timer deadLine={new Date(program.registrationEnd!)} />
          </div>
        </div>
      </div>

      <hr className="border-base-300" />

      {/* Organizer Details */}
      <div className="card bg-base-200/40 shadow-sm p-5 rounded-xl">
        <h2 className="text-lg font-semibold text-base-content flex items-center gap-2 mb-3">
          <IconUser size={18} /> Organizer
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-full overflow-hidden bg-base-300">
            <Image
              src={
                program.event?.college?.profileImage ||
                "/college-placeholder.png"
              }
              alt={program.event?.college?.name || "College"}
              fill
              className="object-contain"
            />
          </div>
          <div className="space-y-1 poppins">
            <p className="text-sm text-base-content flex items-center gap-1">
              <IconUser size={14} /> {program.manager.name || "Not specified"}
            </p>
            <p className="text-sm text-base-content/70 flex items-center gap-1">
              <IconMail size={14} /> {program.manager.email || "Not specified"}
            </p>
            <p className="text-sm text-base-content/70 flex items-center gap-1">
              <IconPhone size={14} /> {program.manager.phone || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-base-300" />

      {/* Rounds Section */}
      <div className="card bg-base-200/40 shadow-sm p-5 rounded-xl">
        <h2 className="text-lg font-semibold text-base-content flex items-center gap-2 mb-3">
          <IconClipboardList size={18} /> Rounds
        </h2>
        {program.rounds && program.rounds.length > 0 ? (
          <div className="space-y-4">
            {program.rounds.map((round, idx) => (
              <div
                key={idx}
                className="border border-base-300 p-4 rounded-xl bg-base-200/30"
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-base-content">
                    Round {round.order || idx + 1}: {round.name || "Untitled"}
                  </h3>
                  {round.scoringMethod && (
                    <span className="text-xs text-base-content/60">
                      Scoring: {round.scoringMethod}
                    </span>
                  )}
                </div>
                <div className="text-sm text-base-content/70 flex items-center gap-2">
                  <IconClockHour4 size={14} />
                  <span>
                    {round.startTime ? formatDate(round.startTime) : "TBD"} →{" "}
                    {round.endTime ? formatDate(round.endTime) : "TBD"}
                  </span>
                </div>
                {round.instructions && (
                  <p className="text-sm mt-2 text-base-content/80 whitespace-pre-line poppins">
                    {round.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/60 italic">
            No rounds specified.
          </p>
        )}
      </div>

      <hr className="border-base-300" />

      {/* Prizes Section */}
      {program.prizes && program.prizes.length > 0 && (
        <div className="card bg-base-200/40 shadow-sm p-5 rounded-xl">
          <h2 className="text-lg font-semibold text-base-content flex items-center gap-2 mb-3">
            <IconTrophy size={18} /> Prizes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {program.prizes.map((prize, idx) => (
              <div
                key={idx}
                className="rounded-xl p-4 bg-base-200/40 border border-base-300"
              >
                <h3 className="font-medium text-base-content">{prize.title}</h3>
                <p className="text-sm text-base-content/70 mt-1">
                  ₹{prize.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <hr className="border-base-300" />

      {/* Team Info */}
      <div className="card bg-base-200/40 shadow-sm p-5 rounded-xl">
        <h2 className="text-lg font-semibold text-base-content flex items-center gap-2 mb-3">
          <IconUsersGroup size={18} /> Team Information
        </h2>
        <div className="space-y-2 text-sm text-base-content/80">
          <p>
            <strong>Type:</strong> <span className="capitalize">{program.type}</span>
          </p>
          <p>
            <strong>Team Size:</strong>{" "}
            {program.teamSize
              ? `${program.teamSize.min || 1} - ${program.teamSize.max || 1}`
              : "N/A"}
          </p>
          <p>
            <strong>Max Teams:</strong> {program.maxTeams || "Unlimited"}
          </p>
          <p>
            <strong>Price per Team:</strong> ₹{program.pricePerTeam || 0}
          </p>
        </div>
      </div>

      {/* Participate Button */}
      <div className="flex justify-center pt-4">
        {(program as any).isRegistered ? (
          <div
            className="btn btn-success px-12 rounded-xl text-base font-semibold shadow-lg text-white bg-emerald-600 border-none cursor-default flex items-center justify-center opacity-100"
          >
            <IconCheck size={18} className="mr-2 text-white" />
            Already Registered
          </div>
        ) : (
          <button
            className="btn btn-primary px-12 rounded-xl text-base font-semibold shadow-lg hover:scale-105 transition"
            onClick={() => {
              if (program.type === "individual") {
                setModalAction("confirm");
              } else {
                setModalAction("select");
              }
              setShowModal(true);
            }}
          >
            Participate Now
          </button>
        )}
      </div>

      {/* SPECTACULAR PARTICIPATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-base-100 border border-primary rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-fadeIn poppins">
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm"
            >
              <IconX size={20} />
            </button>

            {/* ACTION 1: CONFIRM (INDIVIDUAL PROGRAMS) */}
            {modalAction === "confirm" && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <IconUser size={36} />
                </div>
                <h3 className="text-xl font-bold font-outfit">Individual Registration</h3>
                <p className="text-sm text-base-content/70 max-w-sm mx-auto leading-relaxed">
                  Are you sure you want to register for <strong>{program.title}</strong>? You will be registered as an individual participant.
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <button onClick={() => setShowModal(false)} className="btn btn-outline btn-sm rounded-xl px-5">Cancel</button>
                  <button 
                    disabled={submitting}
                    onClick={() => handleParticipate("individual")} 
                    className="btn btn-primary btn-sm rounded-xl px-6 text-white"
                  >
                    {submitting ? "Processing..." : "Confirm & Register"}
                  </button>
                </div>
              </div>
            )}

            {/* ACTION 2: SELECT OPTIONS (TEAM PROGRAMS) */}
            {modalAction === "select" && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-outfit">Team Participation</h3>
                  <p className="text-xs text-base-content/60 mt-1">Select how you want to participate in this team event.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Create Team Box */}
                  <div 
                    onClick={() => setModalAction("create")}
                    className="border border-base-300 hover:border-primary p-5 rounded-2xl bg-base-200/50 hover:bg-primary/5 transition text-center cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <IconPlus size={24} />
                    </div>
                    <h4 className="font-bold text-sm mt-3">Create a Team</h4>
                    <p className="text-[11px] text-base-content/50 mt-1 leading-relaxed">Start a new team, become the leader, and get a code to share with friends.</p>
                  </div>
                  {/* Join Team Box */}
                  <div 
                    onClick={() => setModalAction("join")}
                    className="border border-base-300 hover:border-secondary p-5 rounded-2xl bg-base-200/50 hover:bg-secondary/5 transition text-center cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <IconUserPlus size={24} />
                    </div>
                    <h4 className="font-bold text-sm mt-3">Join a Team</h4>
                    <p className="text-[11px] text-base-content/50 mt-1 leading-relaxed">Already have a team? Enter their team code and password to jump in.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION 3: CREATE TEAM FORM */}
            {modalAction === "create" && (
              <div className="space-y-4 py-2">
                <h3 className="text-xl font-bold font-outfit">Create New Team</h3>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Team Name <span className="text-error">*</span></legend>
                  <input 
                    type="text" 
                    placeholder="Enter team name (e.g. CyberKnights)" 
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="input input-bordered w-full rounded-xl text-sm"
                  />
                </fieldset>
                <div className="flex justify-end gap-2 pt-4">
                  <button onClick={() => setModalAction("select")} className="btn btn-outline btn-sm rounded-xl">Back</button>
                  <button 
                    disabled={submitting}
                    onClick={() => handleParticipate("create-team")}
                    className="btn btn-primary btn-sm rounded-xl text-white px-5"
                  >
                    {submitting ? "Creating..." : "Create Team"}
                  </button>
                </div>
              </div>
            )}

            {/* ACTION 4: JOIN TEAM FORM */}
            {modalAction === "join" && (
              <div className="space-y-4 py-2">
                <h3 className="text-xl font-bold font-outfit">Join Existing Team</h3>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Team Code <span className="text-error">*</span></legend>
                  <div className="join w-full">
                    <span className="join-item bg-base-300 border border-base-300 flex items-center px-3.5"><IconUsersGroup size={16} /></span>
                    <input 
                      type="text" 
                      placeholder="e.g. TM-123456" 
                      value={teamCode}
                      onChange={(e) => setTeamCode(e.target.value)}
                      className="input input-bordered join-item w-full rounded-r-xl text-sm"
                    />
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Team Password <span className="text-error">*</span></legend>
                  <div className="join w-full">
                    <span className="join-item bg-base-300 border border-base-300 flex items-center px-3.5"><IconKey size={16} /></span>
                    <input 
                      type="password" 
                      placeholder="Enter 4-digit password" 
                      value={teamPassword}
                      onChange={(e) => setTeamPassword(e.target.value)}
                      className="input input-bordered join-item w-full rounded-r-xl text-sm"
                    />
                  </div>
                </fieldset>
                <div className="flex justify-end gap-2 pt-4">
                  <button onClick={() => setModalAction("select")} className="btn btn-outline btn-sm rounded-xl">Back</button>
                  <button 
                    disabled={submitting}
                    onClick={() => handleParticipate("join-team")}
                    className="btn btn-secondary btn-sm rounded-xl text-white px-5"
                  >
                    {submitting ? "Joining..." : "Join Team"}
                  </button>
                </div>
              </div>
            )}

            {/* ACTION 5: TEAM CREATED SUCCESS VIEW */}
            {modalAction === "success" && createdTeam && (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                  <IconCheck size={32} />
                </div>
                <h3 className="text-xl font-bold font-outfit text-success">Team Created!</h3>
                <p className="text-xs text-base-content/75 max-w-xs mx-auto">
                  Team <strong>"{createdTeam.name}"</strong> has been successfully registered. Share these credentials with your teammates to let them join:
                </p>
                
                {/* Credentials Display */}
                <div className="bg-base-200 p-4 rounded-2xl border border-base-300 max-w-sm mx-auto space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-base-content/50 font-medium">TEAM CODE:</span>
                    <span className="font-extrabold text-primary select-all text-sm font-mono">{createdTeam.credentials.teamCode}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-base-content/50 font-medium">PASSWORD:</span>
                    <span className="font-extrabold text-primary select-all text-sm font-mono">{createdTeam.credentials.password}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-2 pt-4 max-w-xs mx-auto">
                  <button 
                    onClick={handleCopyCredentials} 
                    className="btn btn-primary btn-sm rounded-xl text-white flex items-center justify-center gap-2 flex-1"
                  >
                    <IconCopy size={16} /> Copy Code
                  </button>
                  <button 
                    onClick={() => {
                      setShowModal(false);
                      fetchProgramDetails(slug as string);
                    }} 
                    className="btn btn-outline btn-sm rounded-xl flex-1"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
