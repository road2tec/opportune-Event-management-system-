"use client";

import { useState, useEffect } from "react";
import Title from "@/components/Title";
import {
  IconBook,
  IconSchool,
  IconCoinRupee,
  IconSpeakerphone,
  IconListCheck,
  IconCheck,
  IconChevronRight,
  IconPlus,
  IconTrash,
  IconArrowRight,
  IconBulb,
  IconInfoCircle,
  IconAlertCircle,
  IconTrendingUp,
  IconShare,
  IconDeviceFloppy,
  IconRefresh
} from "@tabler/icons-react";

// Types for budget entries
interface BudgetEntry {
  id: string;
  name: string;
  amount: number;
}

// Types for promotional channels
interface PromoChannel {
  id: string;
  name: string;
  cost: number;
  reachMultiplier: number;
  conversionRate: number; // in %
  isActive: boolean;
}

// Types for checklists
interface ChecklistItem {
  id: string;
  category: "month" | "week" | "dayBefore" | "eventDay";
  text: string;
  completed: boolean;
}

export default function PlanningGuides() {
  const [activeTab, setActiveTab] = useState<"fest" | "budget" | "promotion" | "checklist">("fest");

  // --- BUDGET STATE ---
  const [incomeList, setIncomeList] = useState<BudgetEntry[]>([
    { id: "inc-1", name: "Title Sponsorship", amount: 60000 },
    { id: "inc-2", name: "Associate Sponsorships", amount: 30000 },
    { id: "inc-3", name: "Ticket/Registration Fees", amount: 25000 },
    { id: "inc-4", name: "College Management Grant", amount: 20000 },
  ]);

  const [expenseList, setExpenseList] = useState<BudgetEntry[]>([
    { id: "exp-1", name: "Sound, Stage & Lighting", amount: 40000 },
    { id: "exp-2", name: "Celebrity/Speaker Fees", amount: 30000 },
    { id: "exp-3", name: "Prizes & Trophies", amount: 20000 },
    { id: "exp-4", name: "Logistics & Catering", amount: 15000 },
    { id: "exp-5", name: "Marketing & Flex Printing", amount: 8000 },
    { id: "exp-6", name: "Miscellaneous & Security", amount: 5000 },
  ]);

  const [newIncName, setNewIncName] = useState("");
  const [newIncAmount, setNewIncAmount] = useState("");
  const [newExpName, setNewExpName] = useState("");
  const [newExpAmount, setNewExpAmount] = useState("");

  // Budget calculations
  const totalIncome = incomeList.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseList.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpenses;
  const expensePercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  // Add Income
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncName || !newIncAmount) return;
    const amount = parseFloat(newIncAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIncomeList([...incomeList, { id: `inc-${Date.now()}`, name: newIncName, amount }]);
    setNewIncName("");
    setNewIncAmount("");
  };

  // Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName || !newExpAmount) return;
    const amount = parseFloat(newExpAmount);
    if (isNaN(amount) || amount <= 0) return;

    setExpenseList([...expenseList, { id: `exp-${Date.now()}`, name: newExpName, amount }]);
    setNewExpName("");
    setNewExpAmount("");
  };

  // Delete Income
  const handleDeleteIncome = (id: string) => {
    setIncomeList(incomeList.filter((item) => item.id !== id));
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenseList(expenseList.filter((item) => item.id !== id));
  };


  // --- PROMOTION STATE ---
  const [channels, setChannels] = useState<PromoChannel[]>([
    { id: "ch-1", name: "Social Media (Instagram/LinkedIn)", cost: 5000, reachMultiplier: 3.5, conversionRate: 8, isActive: true },
    { id: "ch-2", name: "Campus Ambassador Outreach", cost: 3000, reachMultiplier: 2.8, conversionRate: 15, isActive: true },
    { id: "ch-3", name: "Posters, Banners & Standees", cost: 7000, reachMultiplier: 1.5, conversionRate: 4, isActive: false },
    { id: "ch-4", name: "Class-to-Class PR & Announcements", cost: 1000, reachMultiplier: 2.2, conversionRate: 20, isActive: true },
    { id: "ch-5", name: "Inter-College WhatsApp Groups", cost: 500, reachMultiplier: 4.0, conversionRate: 12, isActive: false },
  ]);

  const [marketingBudget, setMarketingBudget] = useState(15000);

  const toggleChannel = (id: string) => {
    setChannels(
      channels.map((ch) => (ch.id === id ? { ...ch, isActive: !ch.isActive } : ch))
    );
  };

  const activeChannels = channels.filter((c) => c.isActive);
  const totalChannelsCost = activeChannels.reduce((sum, c) => sum + c.cost, 0);

  // Estimator logic
  const calculatePromotionMetrics = () => {
    if (activeChannels.length === 0) return { reach: 0, conversions: 0 };
    // Base reach per 1000 Rs spent is around 800 people, modified by multipliers
    const baseReach = (marketingBudget / (totalChannelsCost || 1)) * 1000;
    
    let totalWeightedReach = 0;
    let totalWeightedConversions = 0;

    activeChannels.forEach((ch) => {
      // Allocated budget relative to channel base costs
      const channelAllocatedBudget = (ch.cost / totalChannelsCost) * marketingBudget;
      const channelReach = channelAllocatedBudget * 1.5 * ch.reachMultiplier * 10;
      const channelConversions = channelReach * (ch.conversionRate / 100);

      totalWeightedReach += channelReach;
      totalWeightedConversions += channelConversions;
    });

    return {
      reach: Math.round(totalWeightedReach),
      conversions: Math.round(totalWeightedConversions),
    };
  };

  const estimatedMetrics = calculatePromotionMetrics();


  // --- CHECKLIST STATE ---
  const defaultChecklist: ChecklistItem[] = [
    // Month Before
    { id: "chk-1", category: "month", text: "Secure official venue permissions & clearance from college dean/principal", completed: false },
    { id: "chk-2", category: "month", text: "Create event core committees (PR, Logistics, Registration, Tech)", completed: false },
    { id: "chk-3", category: "month", text: "Draft comprehensive event pitch deck & prospectus for sponsors", completed: false },
    { id: "chk-4", category: "month", text: "Establish event rules, guidelines, dates & program catalog", completed: false },
    { id: "chk-5", category: "month", text: "Launch Opportune program registration portals", completed: false },
    // Week Before
    { id: "chk-6", category: "week", text: "Confirm and order all printed materials (Flex posters, ID badges, Certificates)", completed: false },
    { id: "chk-7", category: "week", text: "Finalize sound, stage, backdrop & lighting vendor contracts", completed: false },
    { id: "chk-8", category: "week", text: "Send official reminders & guidelines to registered external teams", completed: false },
    { id: "chk-9", category: "week", text: "Invite judges, keynote speakers, and VIP dignitaries explicitly", completed: false },
    { id: "chk-10", category: "week", text: "Conduct host rehearsal, anchor briefing and dry run of event timeline", completed: false },
    // Day Before
    { id: "chk-11", category: "dayBefore", text: "Vendor setup: stage construction, sound-checking & display testing", completed: false },
    { id: "chk-12", category: "dayBefore", text: "Prepare physical registration desks with volunteer laptops, badges & kits", completed: false },
    { id: "chk-13", category: "dayBefore", text: "Distribute campus signage, direction banners & welcome board", completed: false },
    { id: "chk-14", category: "dayBefore", text: "Final run-through briefing with all volunteers and security crew", completed: false },
    { id: "chk-15", category: "dayBefore", text: "Ensure chief guests' hospitality suite is prepared & keys are secured", completed: false },
    // Event Day
    { id: "chk-16", category: "eventDay", text: "Open registration & check-in gates 1 hour prior to opening ceremony", completed: false },
    { id: "chk-17", category: "eventDay", text: "Welcome VIPs and judges, direct them to reservation lounges", completed: false },
    { id: "chk-18", category: "eventDay", text: "Execute programs on schedule; keep active buffer controls for delays", completed: false },
    { id: "chk-19", category: "eventDay", text: "Direct digital feedback QR code displays at session exits", completed: false },
    { id: "chk-20", category: "eventDay", text: "Consolidate judging sheets & verify winner payouts/certificates", completed: false },
  ];

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // Load checklist from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("opportune_organizer_checklist");
      if (stored) {
        try {
          setChecklist(JSON.parse(stored));
        } catch (e) {
          setChecklist(defaultChecklist);
        }
      } else {
        setChecklist(defaultChecklist);
      }
    }
  }, []);

  // Save checklist to local storage
  const saveChecklist = (updatedList: ChecklistItem[]) => {
    setChecklist(updatedList);
    localStorage.setItem("opportune_organizer_checklist", JSON.stringify(updatedList));
  };

  const handleToggleCheck = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveChecklist(updated);
  };

  const handleResetChecklist = () => {
    if (window.confirm("Are you sure you want to reset all checklist tasks to incomplete?")) {
      saveChecklist(defaultChecklist.map(item => ({ ...item, completed: false })));
    }
  };

  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.completed).length;
  const checklistPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // --- STEPPER/FEST STATE ---
  const [activeStep, setActiveStep] = useState(1);
  const festPhases = [
    {
      step: 1,
      title: "Ideation & Approvals",
      subtitle: "Weeks 1-2",
      desc: "Lay a concrete foundation. Secure administrative support and design the grand blueprint of your fest.",
      milestones: [
        "Brainstorm the core theme, branding name, and list of sub-events.",
        "Submit a formal event request letter to the College Director/Principal.",
        "Obtain approved venue allotments (Auditourim, Ground, Computer Labs).",
        "Draw up a rough financial budget sheet to request seed funding."
      ],
      proTip: "Administrative approvals take time. Always submit paperwork at least 6 weeks before the proposed dates."
    },
    {
      step: 2,
      title: "Structure & Sponsorships",
      subtitle: "Weeks 3-4",
      desc: "Appoint leadership, structure your working teams, and reach out to corporate sponsors with value propositions.",
      milestones: [
        "Form core committees: Creative (decor/design), Tech (website/registrations), PR (outreach), Logistics (vendors/food).",
        "Create an attractive Sponsorship Brochure highlighting footfall and brand visibility.",
        "Assign student representatives to pitch local food joints and tech enterprises.",
        "Configure registration fees and prizes on Opportune's program creator."
      ],
      proTip: "Offer tiered sponsorship models (Title, Gold, Silver) and mention social media promotions as added incentives."
    },
    {
      step: 3,
      title: "Marketing & Vendor Sync",
      subtitle: "Weeks 5-6",
      desc: "Generate widespread buzz. Finalize vendors and drive registrations through dynamic digital and physical campaigns.",
      milestones: [
        "Deploy social media campaigns, teaser reels, and posters in neighboring campuses.",
        "Finalize rentals for professional Sound, Stage, LED walls, and Backdrops.",
        "Initiate a Campus Ambassador program in at least 10 nearby colleges.",
        "Track registration counts daily to dynamically steer PR announcements."
      ],
      proTip: "Bulk registrations happen in the final 7 days. Offer early-bird discounts to kickstart early signups."
    },
    {
      step: 4,
      title: "Day of Reckoning & Wrap-up",
      subtitle: "Event Day & After",
      desc: "Perfect execution under pressure. Ensure guests are catered to, rounds run smoothly, and certificates are awarded.",
      milestones: [
        "Deploy volunteers at strategic checkpoints: entry gate, registration counter, food court.",
        "Coordinate continuous timeline sync between the main auditorium and side rooms.",
        "Ensure prompt judges hospitality, score consolidation, and fair play.",
        "Release feedback surveys and issue verified digit certificates via Opportune."
      ],
      proTip: "Event day will have surprises. Always have an emergency contingency fund (5-10% of total budget) in cash."
    }
  ];

  return (
    <div className="poppins max-w-6xl mx-auto pb-16">
      {/* Title Header */}
      <Title
        title="Event Planning Playbook"
        subtitle="Professional masterclasses and interactive utility tools to help you organize, budget, and promote highly successful events."
      />

      {/* Top Banner (Glassmorphism & Gradients) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-indigo-800 rounded-3xl p-8 mb-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/10">
              Organizer Suite 🚀
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-4 Orbitron tracking-wide">
              Level Up Your Event Coordination
            </h2>
            <p className="mt-3 text-white/90 text-sm leading-relaxed max-w-xl">
              Equip yourself with the tools the pros use. Leverage our real-time budget calculator, marketing estimator, and persistent prep-day checklist to streamline operations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveTab("fest")} 
              className={`btn ${activeTab === "fest" ? "btn-secondary text-white shadow-lg" : "bg-white/20 text-white border-white/20 hover:bg-white/30"} rounded-xl transition duration-300`}
            >
              <IconSchool className="mr-2" size={18} />
              Fest Timeline
            </button>
            <button 
              onClick={() => setActiveTab("budget")} 
              className={`btn ${activeTab === "budget" ? "btn-secondary text-white shadow-lg" : "bg-white/20 text-white border-white/20 hover:bg-white/30"} rounded-xl transition duration-300`}
            >
              <IconCoinRupee className="mr-2" size={18} />
              Budget Planner
            </button>
            <button 
              onClick={() => setActiveTab("promotion")} 
              className={`btn ${activeTab === "promotion" ? "btn-secondary text-white shadow-lg" : "bg-white/20 text-white border-white/20 hover:bg-white/30"} rounded-xl transition duration-300`}
            >
              <IconSpeakerphone className="mr-2" size={18} />
              Promotions
            </button>
            <button 
              onClick={() => setActiveTab("checklist")} 
              className={`btn ${activeTab === "checklist" ? "btn-secondary text-white shadow-lg" : "bg-white/20 text-white border-white/20 hover:bg-white/30"} rounded-xl transition duration-300`}
            >
              <IconListCheck className="mr-2" size={18} />
              Checklist
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Panels */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* TAB 1: COLLEGE FEST STEPPER */}
        {activeTab === "fest" && (
          <div className="card bg-base-200 shadow-xl border border-base-300 p-6 md:p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <IconSchool size={30} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">How to Organize a College Fest</h3>
                <p className="text-sm text-base-content/60">An interactive blueprint charting the journey from ideation to event day.</p>
              </div>
            </div>

            {/* Stepper Steps UI */}
            <div className="w-full overflow-x-auto pb-4">
              <ul className="steps steps-vertical lg:steps-horizontal w-full min-w-[700px] mb-8">
                {festPhases.map((phase) => (
                  <li
                    key={phase.step}
                    onClick={() => setActiveStep(phase.step)}
                    className={`step cursor-pointer transition-all duration-300 ${
                      activeStep >= phase.step ? "step-primary font-semibold text-primary" : "text-base-content/50"
                    }`}
                  >
                    <div className="px-2">
                      <div className="text-xs uppercase opacity-75">{phase.subtitle}</div>
                      <div className="text-sm mt-0.5">{phase.title}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phase Content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4 pt-6 border-t border-base-300">
              <div className="lg:col-span-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary font-bold">Phase {activeStep}</span>
                    <span className="text-sm text-base-content/50">{festPhases[activeStep-1].subtitle}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-base-content mb-3 font-outfit">
                    {festPhases[activeStep-1].title}
                  </h4>
                  <p className="text-base-content/85 mb-6 text-base leading-relaxed">
                    {festPhases[activeStep-1].desc}
                  </p>

                  <h5 className="font-semibold text-base mb-3 flex items-center gap-2">
                    <IconCheck size={18} className="text-success" />
                    Key Milestones to Complete:
                  </h5>
                  <ul className="space-y-3.5 pl-2 mb-6">
                    {festPhases[activeStep-1].milestones.map((milestone, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-base-content/80">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary/70 mt-1.5 flex-shrink-0"></span>
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="btn btn-outline btn-sm rounded-xl px-4"
                  >
                    Back Phase
                  </button>
                  <button
                    disabled={activeStep === 4}
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="btn btn-primary btn-sm rounded-xl px-4"
                  >
                    Next Phase
                    <IconArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Side Pro-Tip Panel */}
              <div className="lg:col-span-2 bg-base-300/60 rounded-3xl p-6 border border-base-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 text-warning mb-4">
                    <IconBulb size={24} className="fill-warning/10" />
                    <span className="text-base font-bold uppercase tracking-wider font-outfit">Core Pro-Tip</span>
                  </div>
                  <p className="text-sm text-base-content/90 leading-relaxed italic">
                    "{festPhases[activeStep-1].proTip}"
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-base-300/80">
                  <h6 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">Recommended Resources</h6>
                  <div className="space-y-2">
                    <button onClick={() => setActiveTab("budget")} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-base-100 hover:bg-base-200 transition text-left text-xs font-medium border border-base-300">
                      <span className="flex items-center gap-2"><IconCoinRupee size={15} /> Setup Event Budget Sheet</span>
                      <IconChevronRight size={14} />
                    </button>
                    <button onClick={() => setActiveTab("checklist")} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-base-100 hover:bg-base-200 transition text-left text-xs font-medium border border-base-300">
                      <span className="flex items-center gap-2"><IconListCheck size={15} /> Open Prep-Day Checklist</span>
                      <IconChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE BUDGET PLANNER */}
        {activeTab === "budget" && (
          <div className="card bg-base-200 shadow-xl border border-base-300 p-6 md:p-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
                  <IconCoinRupee size={30} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Interactive Budget Planner</h3>
                  <p className="text-sm text-base-content/60">Input estimated figures to draft, calculate, and secure a perfectly balanced event budget.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-base-300 rounded-xl p-1 px-3 py-2 border border-base-300">
                <IconInfoCircle size={16} className="text-primary" />
                <span className="text-xs font-semibold">Simulated values. Auto-updates live.</span>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between">
                <span className="text-sm font-semibold text-base-content/50">Total Projected Income</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-extrabold text-success font-outfit">₹{totalIncome.toLocaleString("en-IN")}</span>
                </div>
                <span className="text-[11px] text-base-content/40 mt-1">From sponsorships, grants & ticket fees</span>
              </div>
              <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between">
                <span className="text-sm font-semibold text-base-content/50">Total Estimated Expenses</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-extrabold text-error font-outfit">₹{totalExpenses.toLocaleString("en-IN")}</span>
                </div>
                <span className="text-[11px] text-base-content/40 mt-1">Sum of sound, prizes, celebrity & logistics</span>
              </div>
              <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
                balance >= 0 ? "bg-success/5 border-success/20 text-success-content" : "bg-error/5 border-error/20 text-error-content"
              }`}>
                <span className="text-sm font-semibold text-base-content/60">Net Budget Balance</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={`text-2xl font-extrabold font-outfit ${balance >= 0 ? "text-success" : "text-error"}`}>
                    {balance < 0 ? "-" : ""}₹{Math.abs(balance).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {balance >= 0 ? (
                    <>
                      <IconCheck size={14} className="text-success" />
                      <span className="text-xs text-success font-medium">Safe Surplus. You are good to go!</span>
                    </>
                  ) : (
                    <>
                      <IconAlertCircle size={14} className="text-error animate-pulse" />
                      <span className="text-xs text-error font-medium">Deficit. Cut expenses or pitch more sponsors.</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Gauge / Bar */}
            <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm mb-8">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-sm font-semibold">Budget Absorption Level</span>
                <span className={`text-sm font-bold ${expensePercentage > 100 ? "text-error" : expensePercentage > 85 ? "text-warning" : "text-success"}`}>
                  {expensePercentage.toFixed(1)}% Spends Out of Income
                </span>
              </div>
              <div className="w-full bg-base-300 h-4 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(expensePercentage, 100)}%` }}
                  className={`h-full transition-all duration-500 rounded-full ${
                    expensePercentage > 100 ? "bg-error" : expensePercentage > 85 ? "bg-warning" : "bg-success"
                  }`}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-base-content/40 mt-1.5">
                <span>0% Safe Plan</span>
                <span>80% Warning Limit</span>
                <span>100% Critical Cap</span>
              </div>
            </div>

            {/* Income & Expense Inputs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Income Side */}
              <div className="bg-base-100 p-5 rounded-2xl border border-base-300">
                <h4 className="text-lg font-bold mb-4 text-success flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                  Projected Income Channels
                </h4>

                <form onSubmit={handleAddIncome} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="e.g. RedBull Sponsor"
                    value={newIncName}
                    onChange={(e) => setNewIncName(e.target.value)}
                    className="input input-bordered input-sm flex-1"
                  />
                  <input
                    type="number"
                    placeholder="₹ Amount"
                    value={newIncAmount}
                    onChange={(e) => setNewIncAmount(e.target.value)}
                    className="input input-bordered input-sm w-28"
                  />
                  <button type="submit" className="btn btn-success btn-sm text-white">
                    <IconPlus size={16} />
                    Add
                  </button>
                </form>

                <div className="overflow-y-auto max-h-60 space-y-2">
                  {incomeList.length === 0 ? (
                    <p className="text-xs text-base-content/50 text-center py-4">No income channels added. Add one above.</p>
                  ) : (
                    incomeList.map((inc) => (
                      <div key={inc.id} className="flex justify-between items-center bg-base-200 p-3 rounded-xl border border-base-300 text-sm">
                        <span className="font-medium text-base-content/80">{inc.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-success font-outfit">₹{inc.amount.toLocaleString("en-IN")}</span>
                          <button onClick={() => handleDeleteIncome(inc.id)} className="btn btn-ghost btn-xs text-error hover:bg-error/10">
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Expense Side */}
              <div className="bg-base-100 p-5 rounded-2xl border border-base-300">
                <h4 className="text-lg font-bold mb-4 text-error flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger bg-error"></span>
                  Estimated Expense Channels
                </h4>

                <form onSubmit={handleAddExpense} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="e.g. LED Screen Rental"
                    value={newExpName}
                    onChange={(e) => setNewExpName(e.target.value)}
                    className="input input-bordered input-sm flex-1"
                  />
                  <input
                    type="number"
                    placeholder="₹ Amount"
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value)}
                    className="input input-bordered input-sm w-28"
                  />
                  <button type="submit" className="btn btn-error btn-sm text-white">
                    <IconPlus size={16} />
                    Add
                  </button>
                </form>

                <div className="overflow-y-auto max-h-60 space-y-2">
                  {expenseList.length === 0 ? (
                    <p className="text-xs text-base-content/50 text-center py-4">No expense channels added. Add one above.</p>
                  ) : (
                    expenseList.map((exp) => (
                      <div key={exp.id} className="flex justify-between items-center bg-base-200 p-3 rounded-xl border border-base-300 text-sm">
                        <span className="font-medium text-base-content/80">{exp.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-error font-outfit">₹{exp.amount.toLocaleString("en-IN")}</span>
                          <button onClick={() => handleDeleteExpense(exp.id)} className="btn btn-ghost btn-xs text-error hover:bg-error/10">
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Master Budgeting Tips */}
            <div className="bg-base-300/40 border border-base-300 rounded-2xl p-5 mt-8 flex gap-4">
              <IconBulb className="text-warning flex-shrink-0" size={28} />
              <div>
                <h5 className="font-bold text-sm mb-1 uppercase tracking-wide">Strategic Sponsor Rule</h5>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Always secure sponsorship agreements in writing with a 50% advance before placing orders with vendors. This guarantees a safe cash-flow runway and shields student organizers from personal liability.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROMOTIONS STRATEGIST */}
        {activeTab === "promotion" && (
          <div className="card bg-base-200 shadow-xl border border-base-300 p-6 md:p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-secondary/10 text-indigo-500">
                <IconSpeakerphone size={30} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Promotions & Marketing Strategist</h3>
                <p className="text-sm text-base-content/60">Configure your marketing channels and run live ticket conversion simulations based on budget.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Channel Selector */}
              <div className="lg:col-span-3 space-y-4">
                <h4 className="font-bold text-base mb-3 flex items-center gap-2">
                  <IconTrendingUp size={18} className="text-primary" />
                  Select & Activate PR Channels
                </h4>
                <p className="text-xs text-base-content/60 mb-4 leading-relaxed">
                  Different channels offer varying reach efficiencies and conversion rates. Toggle them on/off to structure a viable PR portfolio.
                </p>

                <div className="space-y-3">
                  {channels.map((ch) => (
                    <div
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`flex justify-between items-center p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        ch.isActive
                          ? "bg-primary/5 border-primary/45 shadow-sm"
                          : "bg-base-100/70 border-base-300 opacity-60 hover:opacity-90"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={ch.isActive}
                          onChange={() => {}} // handled by div click
                          className="checkbox checkbox-primary checkbox-xs"
                        />
                        <div>
                          <span className="text-sm font-semibold block">{ch.name}</span>
                          <span className="text-[11px] text-base-content/40">
                            Est. Conversion: <span className="text-primary font-bold">{ch.conversionRate}%</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-base-content/50 block font-medium">Channel Cost Cap</span>
                        <span className="text-sm font-bold font-outfit">₹{ch.cost.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reach Estimator Box */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-indigo-900 to-primary rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between h-full min-h-[350px]">
                  <div>
                    <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-widest">
                      Reach Simulator Engine 🎛️
                    </span>

                    {/* Interactive Slider */}
                    <div className="mt-6 mb-6">
                      <label className="text-xs font-semibold text-white/80 block mb-2">
                        Allocated Promotions Budget: <span className="font-extrabold text-secondary text-sm">₹{marketingBudget.toLocaleString("en-IN")}</span>
                      </label>
                      <input
                        type="range"
                        min="2000"
                        max="50000"
                        step="1000"
                        value={marketingBudget}
                        onChange={(e) => setMarketingBudget(parseInt(e.target.value))}
                        className="range range-xs range-secondary"
                      />
                      <div className="flex justify-between text-[10px] text-white/50 mt-1">
                        <span>₹2,000</span>
                        <span>₹25,000</span>
                        <span>₹50,000</span>
                      </div>
                    </div>

                    <hr className="border-white/10 my-4" />

                    {/* Estimates Displays */}
                    <div className="grid grid-cols-2 gap-4 my-2">
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase text-white/60 block font-semibold">Total Est. Reach</span>
                        <span className="text-xl font-extrabold font-outfit text-white block mt-1">
                          {activeChannels.length > 0 ? estimatedMetrics.reach.toLocaleString() : "0"}
                        </span>
                        <span className="text-[9px] text-white/40 block mt-0.5">Students targeted</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase text-white/60 block font-semibold">Est. Ticket Signups</span>
                        <span className="text-xl font-extrabold font-outfit text-secondary block mt-1">
                          {activeChannels.length > 0 ? estimatedMetrics.conversions.toLocaleString() : "0"}
                        </span>
                        <span className="text-[9px] text-white/40 block mt-0.5">At current conversions</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-[11px] leading-relaxed text-white/70">
                      *Estimates are calculated using channels weights, active conversion rates, and proportional budget divisions. Target conversion rate increases when utilizing higher Campus Ambassador shares.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Scheduling Timeline */}
            <div className="mt-10 pt-8 border-t border-base-300">
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                <IconSpeakerphone size={20} className="text-primary" />
                The Ultimate 30-Day Promotion Timeline
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-base-100 p-4.5 rounded-2xl border border-base-300 relative">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mb-3">1</div>
                  <h5 className="font-bold text-sm mb-1.5">T-Minus 30 Days</h5>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    Launch teaser posters, create Instagram/LinkedIn handles, and initiate Campus Ambassadors registration drives in neighboring institutes.
                  </p>
                </div>
                <div className="bg-base-100 p-4.5 rounded-2xl border border-base-300">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mb-3">2</div>
                  <h5 className="font-bold text-sm mb-1.5">T-Minus 15 Days</h5>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    Publish the complete event schedule catalog. Release promo reels detailing prize pools (₹₹₹) and special guest disclosures.
                  </p>
                </div>
                <div className="bg-base-100 p-4.5 rounded-2xl border border-base-300">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mb-3">3</div>
                  <h5 className="font-bold text-sm mb-1.5">T-Minus 7 Days</h5>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    Conduct extensive class-to-class outreach drives. Release early-bird countdown posts and share QR links on college WhatsApp forums.
                  </p>
                </div>
                <div className="bg-base-100 p-4.5 rounded-2xl border border-base-300">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm mb-3">4</div>
                  <h5 className="font-bold text-sm mb-1.5">T-Minus 24 Hours</h5>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    Release the 'Venue Map & Schedule Slots'. Issue entry instructions to outstation teams and host a final online FAQ briefing session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRE-EVENT CHECKLIST */}
        {activeTab === "checklist" && (
          <div className="card bg-base-200 shadow-xl border border-base-300 p-6 md:p-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-success/10 text-success">
                  <IconListCheck size={30} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Interactive Prep Checklist</h3>
                  <p className="text-sm text-base-content/60">A comprehensive checklist stored in your local browser so you never lose track of task statuses.</p>
                </div>
              </div>

              {/* Progress Ring / Gauge and Buttons */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3.5">
                  {/* Custom CSS Circular progress representation */}
                  <div className="relative w-16 h-16 flex items-center justify-center bg-base-100 rounded-full border border-base-300 shadow-sm">
                    <svg className="w-14 h-14 transform -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="23"
                        stroke="#e2e8f0"
                        strokeWidth="4.5"
                        fill="transparent"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="23"
                        stroke="var(--color-success)"
                        strokeWidth="4.5"
                        fill="transparent"
                        strokeDasharray={144.5}
                        strokeDashoffset={144.5 - (144.5 * checklistPercentage) / 100}
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    <span className="absolute text-xs font-bold text-base-content font-outfit">
                      {checklistPercentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 block">Global Prep Progress</span>
                    <span className="text-sm font-bold text-success">
                      {completedTasks} / {totalTasks} Tasks Checked
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleResetChecklist}
                  className="btn btn-outline btn-error btn-sm rounded-xl px-3 hover:text-white"
                  title="Reset all checks to incomplete"
                >
                  <IconRefresh size={16} />
                  Reset Check
                </button>
              </div>
            </div>

            {/* Checklist Category Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category 1: 1 Month Before */}
              <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-base-200">
                  <h4 className="text-base font-bold flex items-center gap-2 text-primary font-outfit">
                    <span className="badge badge-primary badge-xs"></span>
                    1. One Month Prior (Planning Phase)
                  </h4>
                  <span className="text-xs text-base-content/50 font-semibold font-outfit">
                    {checklist.filter(i => i.category === "month" && i.completed).length} / {checklist.filter(i => i.category === "month").length} done
                  </span>
                </div>
                <div className="space-y-3">
                  {checklist.filter((item) => item.category === "month").map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                        item.completed
                          ? "bg-success/5 border-success/20 line-through opacity-70"
                          : "bg-base-200/50 border-transparent hover:bg-base-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleCheck(item.id)}
                        className="checkbox checkbox-success checkbox-xs mt-0.5 flex-shrink-0"
                      />
                      <span className="text-xs font-medium leading-relaxed text-base-content">{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category 2: 1 Week Before */}
              <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-base-200">
                  <h4 className="text-base font-bold flex items-center gap-2 text-indigo-500 font-outfit">
                    <span className="badge bg-indigo-500 border-indigo-500 badge-xs"></span>
                    2. One Week Prior (Logistics Sync)
                  </h4>
                  <span className="text-xs text-base-content/50 font-semibold font-outfit">
                    {checklist.filter(i => i.category === "week" && i.completed).length} / {checklist.filter(i => i.category === "week").length} done
                  </span>
                </div>
                <div className="space-y-3">
                  {checklist.filter((item) => item.category === "week").map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                        item.completed
                          ? "bg-success/5 border-success/20 line-through opacity-70"
                          : "bg-base-200/50 border-transparent hover:bg-base-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleCheck(item.id)}
                        className="checkbox checkbox-success checkbox-xs mt-0.5 flex-shrink-0"
                      />
                      <span className="text-xs font-medium leading-relaxed text-base-content">{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category 3: 1 Day Before */}
              <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-base-200">
                  <h4 className="text-base font-bold flex items-center gap-2 text-warning font-outfit">
                    <span className="badge badge-warning badge-xs"></span>
                    3. Day Prior (Setup & Soundcheck)
                  </h4>
                  <span className="text-xs text-base-content/50 font-semibold font-outfit">
                    {checklist.filter(i => i.category === "dayBefore" && i.completed).length} / {checklist.filter(i => i.category === "dayBefore").length} done
                  </span>
                </div>
                <div className="space-y-3">
                  {checklist.filter((item) => item.category === "dayBefore").map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                        item.completed
                          ? "bg-success/5 border-success/20 line-through opacity-70"
                          : "bg-base-200/50 border-transparent hover:bg-base-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleCheck(item.id)}
                        className="checkbox checkbox-success checkbox-xs mt-0.5 flex-shrink-0"
                      />
                      <span className="text-xs font-medium leading-relaxed text-base-content">{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category 4: Event Day */}
              <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-base-200">
                  <h4 className="text-base font-bold flex items-center gap-2 text-success font-outfit">
                    <span className="badge badge-success badge-xs"></span>
                    4. Event Day (Execution Mode)
                  </h4>
                  <span className="text-xs text-base-content/50 font-semibold font-outfit">
                    {checklist.filter(i => i.category === "eventDay" && i.completed).length} / {checklist.filter(i => i.category === "eventDay").length} done
                  </span>
                </div>
                <div className="space-y-3">
                  {checklist.filter((item) => item.category === "eventDay").map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                        item.completed
                          ? "bg-success/5 border-success/20 line-through opacity-70"
                          : "bg-base-200/50 border-transparent hover:bg-base-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleCheck(item.id)}
                        className="checkbox checkbox-success checkbox-xs mt-0.5 flex-shrink-0"
                      />
                      <span className="text-xs font-medium leading-relaxed text-base-content">{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Offline persistence warning */}
            <div className="mt-8 text-center text-xs text-base-content/40 flex items-center justify-center gap-2">
              <IconInfoCircle size={15} />
              <span>Checked items are saved automatically via localStorage to your browser state.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
