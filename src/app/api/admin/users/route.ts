import dbConfig from "@/config/db.config";
import Student from "@/models/Student";
import College from "@/models/College";
import { NextRequest, NextResponse } from "next/server";

dbConfig();

export async function GET(req: NextRequest) {
  try {
    const students = await Student.find()
      .populate("college")
      .select("-password")
      .sort({ createdAt: -1 });

    const colleges = await College.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, students, colleges }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, role, status } = await req.json();
    if (!id || !role || !status) {
      return NextResponse.json({ success: false, message: "ID, role, and status are required" }, { status: 400 });
    }

    let updatedUser;
    if (role === "student") {
      updatedUser = await Student.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
    } else {
      // In College, if they don't have status, we can add a field or update metadata
      updatedUser = await College.findByIdAndUpdate(id, { $set: { "stats.status": status } }, { new: true }).select("-password");
    }

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User status updated successfully", user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/users:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const role = searchParams.get("role");
    
    if (!id || !role) {
      return NextResponse.json({ success: false, message: "ID and role are required" }, { status: 400 });
    }

    if (role === "student") {
      await Student.findByIdAndDelete(id);
    } else if (role === "college") {
      await College.findByIdAndDelete(id);
    } else {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/users:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
