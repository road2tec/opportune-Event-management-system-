import dbConfig from "@/config/db.config";
import Program from "@/models/Program";
import Event from "@/models/Event";
import College from "@/models/College";
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

    if (decoded.role !== "college") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Find all events of this college
    const events = await Event.find({ college: decoded.id });
    const eventIds = events.map(e => e._id);

    // Find all programs belonging to those events
    const programs = await Program.find({ event: { $in: eventIds } })
      .populate("event")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, programs }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/college/programs:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
