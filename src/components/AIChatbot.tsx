"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconMessageChatbot,
  IconSend,
  IconX,
  IconSparkles,
  IconRobot,
  IconUser
} from "@tabler/icons-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: "greeting",
        sender: "bot",
        text: "Hello! I am Opportune AI Assistant. 🚀\nI can guide you to find events, create/join teams, or explore fests. Let me know how I can assist you today, or click one of the quick suggestions below!",
        timestamp: new Date()
      }
    ]);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const suggestions = [
    { text: "How to Register?", query: "register" },
    { text: "How to form a team?", query: "team" },
    { text: "Opportune Features", query: "features" },
    { text: "Recommend fests", query: "recommend" }
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate smart Bot Response with local NLP in pure English
    setTimeout(() => {
      let botResponse = "";
      const lower = textToSend.toLowerCase();

      if (lower.includes("register") || lower.includes("participate") || lower.includes("join") || lower.includes("how to")) {
        botResponse = "📝 **How to Register for Fests:**\n1. Go to the **'Explore Events'** tab to browse ongoing programs.\n2. Click on the program you are interested in (e.g. Hackathon 2025).\n3. Click on the **'Participate Now'** button.\n4. Select your preferred participation option: Individual or Team registration.";
      } else if (lower.includes("team") || lower.includes("collab") || lower.includes("code") || lower.includes("password") || lower.includes("member")) {
        botResponse = "👥 **Team Collaboration & Roster:**\n* **To Create a Team:** Select 'Create a Team' and enter your team name. Copy the generated **Team Code** and **Password** to share with your friends.\n* **To Join a Team:** Select 'Join a Team' and enter the Team Code and Password provided by your teammate.\n* **Teammate Roster:** Go to your **Registered Events** page and expand the 'Team Roster' section on any team event to view teammate contact details, email, phone, and role in real-time!";
      } else if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("interest") || lower.includes("match")) {
        botResponse = "✨ **AI Event Recommendations:**\n* We automatically evaluate the skills (e.g. React, Next.js, Figma) and interests listed on your profile and match them against published fests.\n* Visit your **Student Dashboard** to see your personalized **'AI Recommended Opportunities'** card carousel with custom Match Percentages!\n* Keep your Profile tags updated to get the most accurate matches!";
      } else if (lower.includes("feature") || lower.includes("about") || lower.includes("what is") || lower.includes("opportune")) {
        botResponse = "🚀 **Opportune Key Features:**\n1. **Cross-College Fests:** Access and compete in events hosted globally across campuses on a single portal.\n2. **Teammates Collaboration:** Joint roster sharing, circular credentialing, and teammate contacts.\n3. **AI Matching Engine:** Intelligently scores and recommends fests matching your tech skills.\n4. **Robust Dashboards:** Seamless fests registration and control tools for Students, Colleges, and Organizers.\n5. **AI Chatbot:** 24/7 interactive assistant to solve fests FAQs.";
      } else {
        botResponse = "🤔 I couldn't quite catch that. But I can help you with registration guides, team collaboration, or AI recommended fests. Try clicking one of the suggested prompts below!";
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: botResponse,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] Orbitron">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-circle btn-primary btn-lg shadow-2xl flex items-center justify-center relative group hover:scale-110 transition duration-300 border border-primary/20 backdrop-blur"
          aria-label="Open AI Assistant"
        >
          <IconMessageChatbot size={28} className="text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent"></span>
          </span>
          <div className="absolute right-14 bg-base-300/90 text-base-content text-xs font-semibold px-3 py-1.5 rounded-xl border border-border shadow opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap poppins">
            AI Assistant 🤖
          </div>
        </button>
      )}

      {/* Glassmorphic Chat Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[400px] h-[550px] bg-base-100/90 backdrop-blur-xl border border-primary/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 via-base-200 to-secondary/20 p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 text-primary animate-bounce">
                <IconRobot size={22} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-extrabold text-sm text-base-content flex items-center gap-1">
                  Opportune AI
                  <IconSparkles size={13} className="text-accent" />
                </h3>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Active Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content hover:bg-base-200"
            >
              <IconX size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-base-100/30 to-base-300/10">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-2 animate-enter`}>
                  {isBot && (
                    <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20 text-[10px]">
                      🤖
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed poppins whitespace-pre-line ${
                    isBot 
                      ? "bg-base-200 text-base-content border border-base-300 rounded-tl-none" 
                      : "bg-primary text-white rounded-tr-none font-medium"
                  }`}>
                    {msg.text}
                  </div>
                  {!isBot && (
                    <div className="w-7 h-7 bg-accent/10 text-accent rounded-full flex items-center justify-center flex-shrink-0 border border-accent/20 text-[10px]">
                      👤
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start items-start gap-2">
                <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20 text-[10px]">
                  🤖
                </div>
                <div className="bg-base-200 text-base-content rounded-2xl p-3 rounded-tl-none flex items-center gap-1 text-xs border border-base-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-base-content/50 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-base-content/50 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-base-content/50 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="p-3 bg-base-200/50 border-t border-border/50 flex gap-2 overflow-x-auto scrollbar-hide flex-nowrap shrink-0">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug.text)}
                className="btn btn-outline btn-primary btn-xs rounded-full whitespace-nowrap poppins text-[10px] px-3 border border-primary/20 hover:bg-primary hover:text-white"
              >
                {sug.text}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-border/80 bg-base-100 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ask me a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              className="input input-bordered input-sm flex-1 rounded-xl bg-base-200 border-base-300 focus:border-primary text-xs poppins"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="btn btn-primary btn-circle btn-sm shadow"
            >
              <IconSend size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
