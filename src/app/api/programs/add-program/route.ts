import jwt from "jsonwebtoken";
import dbConfig from "@/config/db.config";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/models/Event";
import bcrypt from "bcryptjs";
import Program from "@/models/Program";

dbConfig();
export async function POST(req: NextRequest) {
  const { program } = await req.json();
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const decodedId = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    const event = await Event.findById(decodedId.id);
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    const encryptedPassword = await bcrypt.hash(program.manager.password, 10);
    program.manager.password = encryptedPassword;

    // Fallback programType to "other" if left empty or null
    if (!program.programType || program.programType.trim() === "") {
      program.programType = "other";
    }

    const newProgram = new Program(program);
    newProgram.event = event._id;
    await newProgram.save();
    event.programsCount = (event.programsCount || 0) + 1;
    await event.save();
    return NextResponse.json(
      { message: "Program added successfully", program: newProgram },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding program:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
