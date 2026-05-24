import dbConfig from "@/config/db.config";
import Event from "@/models/Event";
import College from "@/models/College";
import Program from "@/models/Program";
import { NextRequest, NextResponse } from "next/server";

dbConfig();

export async function GET(req: NextRequest) {
  try {
    const events = await Event.find()
      .populate("college")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, events }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/admin/events:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Event ID is required" }, { status: 400 });
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    // Delete associated programs
    await Program.deleteMany({ event: id });

    // Delete the event
    await Event.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Event and associated programs deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/events:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, message: "ID and status are required" }, { status: 400 });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Event status updated successfully", event: updatedEvent }, { status: 200 });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/events:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
