import dbConfig from "@/config/db.config";
import Submission from "@/models/Submission";
import Team from "@/models/Team";
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

    // Find submissions for this program (decoded.id is the programId)
    const submissions = await Submission.find({ program: decoded.id })
      .populate("team")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, submissions }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/program-manager/submissions:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

    const { submissionId, score, status, comments } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ success: false, message: "Submission ID is required" }, { status: 400 });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ success: false, message: "Submission not found" }, { status: 404 });
    }

    if (score !== undefined) submission.score = Number(score);
    if (status !== undefined) submission.status = status;
    if (comments) {
      submission.review.push({
        comments,
        score: score !== undefined ? Number(score) : 0,
        createdAt: new Date(),
      });
    }

    await submission.save();

    // If score is updated, aggregate it to the Team points!
    if (score !== undefined && submission.team) {
      const team = await Team.findById(submission.team);
      if (team) {
        team.points = (team.points || 0) + Number(score);
        team.submissionCount = (team.submissionCount || 0) + 1;
        await team.save();
      }
    }

    return NextResponse.json({ success: true, message: "Submission graded successfully!", submission }, { status: 200 });
  } catch (error: any) {
    console.error("Error in PUT /api/program-manager/submissions:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
