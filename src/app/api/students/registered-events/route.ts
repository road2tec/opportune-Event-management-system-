import jwt from "jsonwebtoken";
import dbConfig from "@/config/db.config";
import { NextRequest, NextResponse } from "next/server";
import Team from "@/models/Team";
import Program from "@/models/Program";
import Event from "@/models/Event";
import College from "@/models/College";

dbConfig();

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    if (decoded.role !== "student") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const studentId = decoded.id;

    // Find all Teams where the logged-in student is a member (either leader or teammate)
    const teams = await Team.find({ members: studentId })
      .populate({
        path: "program",
        populate: {
          path: "event",
          populate: { path: "college" }
        }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, registrations: teams }, { status: 200 });
  } catch (error: any) {
    console.error("Error in fetching student registered events:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
