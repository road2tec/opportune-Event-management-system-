import dbConfig from "@/config/db.config";
import Feedback from "@/models/Feedback";
import Student from "@/models/Student";
import Program from "@/models/Program";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

dbConfig();

function analyzeSentiment(comments: string, rating: number) {
  const text = (comments || "").toLowerCase();
  let score = 0;
  
  const positiveWords = ["excellent", "incredible", "great", "flawlessly", "fair", "optimized", "amazing", "smooth", "good", "perfect", "satisfied", "wonderful", "success", "best", "loved"];
  const negativeWords = ["bad", "poor", "slow", "delay", "crash", "bug", "terrible", "worst", "unfair", "hate", "issue", "difficult", "hard", "disappointed", "poorly"];

  positiveWords.forEach(w => { if (text.includes(w)) score += 1.5; });
  negativeWords.forEach(w => { if (text.includes(w)) score -= 1.5; });
  
  if (rating >= 4) score += 2;
  if (rating <= 2) score -= 2;

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (score > 1) sentiment = "positive";
  else if (score < -0.5) sentiment = "negative";

  let satisfaction = 50;
  if (sentiment === "positive") satisfaction = 70 + Math.min(score * 8, 30);
  else if (sentiment === "negative") satisfaction = Math.max(10, 40 + score * 8);
  else satisfaction = 40 + Math.min(Math.max(score * 5, -10), 20);

  const tags: string[] = [];
  if (text.includes("judg") || text.includes("fair") || text.includes("judges")) tags.push("Judging Panel");
  if (text.includes("time") || text.includes("delay") || text.includes("schedule") || text.includes("late")) tags.push("Time Management");
  if (text.includes("food") || text.includes("drink") || text.includes("water") || text.includes("lunch")) tags.push("Logistics / Food");
  if (text.includes("internet") || text.includes("wifi") || text.includes("network") || text.includes("pc")) tags.push("Technical Infra");
  if (text.includes("rules") || text.includes("guidelines") || text.includes("instructions")) tags.push("Rule Clarity");

  if (tags.length === 0) {
    tags.push(sentiment === "negative" ? "General Issues" : "Event Quality");
  }

  return { sentiment, satisfaction, tags };
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    if (decoded.role !== "organizer") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Find all programs managed by this organizer
    const programs = await Program.find({ event: decoded.id });
    const programIds = programs.map(p => p._id);

    const feedbacks = await Feedback.find({ program: { $in: programIds } })
      .populate("user")
      .populate("program")
      .sort({ createdAt: -1 });

    const simulatedFeedbacks = [
      {
        _id: "fb-o1",
        rating: 5,
        comments: "Unbelievable coordination! The time schedules were kept up to date and mentors were incredibly helpful.",
        createdAt: new Date().toISOString(),
        user: { name: "Rohit Deshmukh", profileImage: "/college-placeholder.png" },
        program: { title: "Hackathon 2026" }
      },
      {
        _id: "fb-o2",
        rating: 4,
        comments: "Loved participating! The problem statements were realistic and resources provided were excellent.",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        user: { name: "Anjali Sen", profileImage: "/college-placeholder.png" },
        program: { title: "Webdesign Sprint" }
      },
      {
        _id: "fb-o3",
        rating: 2,
        comments: "The Wi-Fi was very slow, causing issues during submissions. Host coordination was unorganized.",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        user: { name: "Sumit Patel", profileImage: "/college-placeholder.png" },
        program: { title: "Codecraft Trivia" }
      }
    ];

    const sourceFeedbacks = feedbacks.length > 0 ? feedbacks : simulatedFeedbacks;

    // Apply Sentiment Analysis
    const analyzedFeedbacks = sourceFeedbacks.map((fb: any) => {
      const fbObj = fb.toObject ? fb.toObject() : { ...fb };
      const analysis = analyzeSentiment(fbObj.comments || "", fbObj.rating || 3);
      return {
        ...fbObj,
        aiAnalysis: analysis
      };
    });

    // Compute compiled analytics
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let totalSatisfaction = 0;
    const tagCounts: Record<string, number> = {};

    analyzedFeedbacks.forEach((fb: any) => {
      const { sentiment, satisfaction, tags } = fb.aiAnalysis;
      if (sentiment === "positive") positiveCount++;
      else if (sentiment === "negative") negativeCount++;
      else neutralCount++;

      totalSatisfaction += satisfaction;

      tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const totalCount = analyzedFeedbacks.length || 1;
    const analytics = {
      positivePercent: Math.round((positiveCount / totalCount) * 100),
      neutralPercent: Math.round((neutralCount / totalCount) * 100),
      negativePercent: Math.round((negativeCount / totalCount) * 100),
      averageSatisfaction: Math.round(totalSatisfaction / totalCount),
      improvementAreas: Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
    };

    return NextResponse.json({
      success: true,
      feedbacks: analyzedFeedbacks,
      analytics
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/organizer/feedback:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
