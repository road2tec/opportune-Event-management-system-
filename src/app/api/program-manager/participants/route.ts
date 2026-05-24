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

    // Find all teams registered under this program (decoded.id is the programId)
    const teams = await Team.find({ program: decoded.id })
      .populate("members")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, teams }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/program-manager/participants:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
