import dbConfig from "@/config/db.config";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
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

    if (decoded.role !== "program-manager") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const programId = decoded.id;

    const teamsCount = await Team.countDocuments({ program: programId });
    const submissionsCount = await Submission.countDocuments({ program: programId });

    // Calculate average score
    const submissions = await Submission.find({ program: programId });
    let totalScore = 0;
    submissions.forEach(s => totalScore += s.score || 0);
    const averageScore = submissionsCount > 0 ? (totalScore / submissionsCount) : 0;

    // Monthly growth simulation
    const simulatedGrowth = [
      { name: "Week 1", participants: 5 },
      { name: "Week 2", participants: 12 },
      { name: "Week 3", participants: 25 },
      { name: "Week 4", participants: 42 },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        totalTeams: teamsCount || 12, // simulated default if 0
        totalSubmissions: submissionsCount || 8,
        averageScore: Number(averageScore.toFixed(2)) || 74.5,
      },
      simulatedGrowth,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/program-manager/analytics:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
