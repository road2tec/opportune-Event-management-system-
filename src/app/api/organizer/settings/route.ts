import dbConfig from "@/config/db.config";
import Event from "@/models/Event";
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

    const event = await Event.findById(decoded.id);
    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, settings: event.organizer }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/organizer/settings:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const event = await Event.findById(decoded.id);
    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    event.organizer = { ...event.organizer, ...body };
    await event.save();

    return NextResponse.json({ success: true, message: "Organizer profile updated successfully!", settings: event.organizer }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST /api/organizer/settings:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
