import dbConfig from "@/config/db.config";
import Team from "@/models/Team";
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

    // Find all programs managed by this organizer's event (decoded.id is the eventId)
    const programs = await Program.find({ event: decoded.id });
    const programIds = programs.map(p => p._id);

    // Find all teams registered in these programs
    const teams = await Team.find({ program: { $in: programIds } })
      .populate("members")
      .populate("program")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, teams }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/organizer/participants:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
