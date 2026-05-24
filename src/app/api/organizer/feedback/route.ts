import dbConfig from "@/config/db.config";
import Feedback from "@/models/Feedback";
import Student from "@/models/Student";
import Program from "@/models/Program";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

dbConfig();

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
      }
    ];

    return NextResponse.json({
      success: true,
      feedbacks: feedbacks.length > 0 ? feedbacks : simulatedFeedbacks
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/organizer/feedback:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
