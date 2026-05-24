import Event from "@/models/Event";
import Program from "@/models/Program";
import College from "@/models/College";
import Team from "@/models/Team";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json(
        { message: "Slug is required" },
        { status: 400 }
      );
    }
    const event = await Event.findOne({ slug }).populate("college");
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    const programs = await Program.find({ event: event._id });

    // Check if logged-in student is already registered for each program
    let studentId = "";
    try {
      const token = req.cookies.get("token")?.value;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          id: string;
          role: string;
        };
        if (decoded && decoded.role === "student") {
          studentId = decoded.id;
        }
      }
    } catch (e) {
      // Ignore token decoding/missing errors
    }

    const programsWithReg = await Promise.all(
      programs.map(async (program) => {
        let isRegistered = false;
        if (studentId) {
          const registeredTeam = await Team.findOne({
            program: program._id,
            members: studentId
          });
          if (registeredTeam) {
            isRegistered = true;
          }
        }
        const programObj = program.toObject();
        programObj.isRegistered = isRegistered;
        return programObj;
      })
    );

    event.popularityScore = event.popularityScore + 1;
    await event.save();
    return NextResponse.json({ event, programs: programsWithReg }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
