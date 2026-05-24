import dbConfig from "@/config/db.config";
import Program from "@/models/Program";
import Event from "@/models/Event";
import { NextRequest, NextResponse } from "next/server";

dbConfig();

export async function GET(req: NextRequest) {
  try {
    // Populate event, and nested populate college
    const programs = await Program.find()
      .populate({
        path: "event",
        populate: { path: "college" },
      })
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, programs }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/admin/programs:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Program ID is required" }, { status: 400 });
    }

    const program = await Program.findById(id);
    if (!program) {
      return NextResponse.json({ success: false, message: "Program not found" }, { status: 404 });
    }

    // Delete the program
    await Program.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Program deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/programs:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, message: "ID and status are required" }, { status: 400 });
    }

    const updatedProgram = await Program.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedProgram) {
      return NextResponse.json({ success: false, message: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Program status updated successfully", program: updatedProgram }, { status: 200 });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/programs:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
