import dbConfig from "@/config/db.config";
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

    const college = await College.findById(decoded.id).select("-password");
    if (!college) {
      return NextResponse.json({ success: false, message: "College not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, settings: college }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/college/settings:", error);
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

    if (decoded.role !== "college") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updatedCollege = await College.findByIdAndUpdate(
      decoded.id,
      { $set: body },
      { new: true }
    ).select("-password");

    if (!updatedCollege) {
      return NextResponse.json({ success: false, message: "College not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "College profile updated successfully!", settings: updatedCollege }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST /api/college/settings:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
