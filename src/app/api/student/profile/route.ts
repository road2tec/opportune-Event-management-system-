import dbConfig from "@/config/db.config";
import Student from "@/models/Student";
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

    if (decoded.role !== "student") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const student = await Student.findById(decoded.id)
      .populate("college")
      .select("-password");

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: student }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/student/profile:", error);
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

    const { name, phone, bio, skills, interests } = await req.json();

    const student = await Student.findById(decoded.id);
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    if (name) student.name = name;
    if (phone) student.phone = phone;
    student.profile = {
      bio: bio || "",
      skills: Array.isArray(skills) ? skills : (skills || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      interests: Array.isArray(interests) ? interests : (interests || "").split(",").map((i: string) => i.trim()).filter(Boolean),
    };

    await student.save();

    const updated = await Student.findById(decoded.id).populate("college").select("-password");

    return NextResponse.json({ success: true, message: "Profile updated successfully!", profile: updated }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST /api/student/profile:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
