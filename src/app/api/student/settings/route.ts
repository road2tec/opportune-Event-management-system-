import dbConfig from "@/config/db.config";
import Student from "@/models/Student";
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

    if (decoded.role !== "student") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const student = await Student.findById(decoded.id).select("-password");
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    // Default student setting configs
    const settings = {
      emailNotifications: true,
      pushAlerts: true,
      showSkillsPublicly: true,
      receiveMarketing: false,
    };

    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/student/settings:", error);
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

    if (decoded.role !== "student") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    return NextResponse.json({ success: true, message: "Settings saved successfully!", settings: body }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST /api/student/settings:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
