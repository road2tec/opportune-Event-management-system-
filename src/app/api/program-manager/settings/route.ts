import dbConfig from "@/config/db.config";
import Program from "@/models/Program";
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

    const program = await Program.findById(decoded.id);
    if (!program) {
      return NextResponse.json({ success: false, message: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, settings: program.manager }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/program-manager/settings:", error);
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

    if (decoded.role !== "program-manager") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const program = await Program.findById(decoded.id);
    if (!program) {
      return NextResponse.json({ success: false, message: "Program not found" }, { status: 404 });
    }

    program.manager = { ...program.manager, ...body };
    await program.save();

    return NextResponse.json({ success: true, message: "Manager profile updated successfully!", settings: program.manager }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST /api/program-manager/settings:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
