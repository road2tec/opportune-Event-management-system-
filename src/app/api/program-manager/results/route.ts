import dbConfig from "@/config/db.config";
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

    // Get leaderboard standins sorted by points descending
    const standings = await Team.find({ program: decoded.id })
      .populate("members")
      .sort({ points: -1, submissionCount: -1 });

    return NextResponse.json({ success: true, standings }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/program-manager/results:", error);
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

    const { teamId, points } = await req.json();

    if (!teamId || points === undefined) {
      return NextResponse.json({ success: false, message: "Team ID and points are required" }, { status: 400 });
    }

    const team = await Team.findByIdAndUpdate(
      teamId,
      { $set: { points: Number(points) } },
      { new: true }
    );

    if (!team) {
      return NextResponse.json({ success: false, message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Team points updated successfully!", team }, { status: 200 });
  } catch (error: any) {
    console.error("Error in PUT /api/program-manager/results:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
