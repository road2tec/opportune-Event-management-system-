import Program from "@/models/Program";
import Event from "@/models/Event";
import College from "@/models/College";
import Team from "@/models/Team";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import dbConfig from "@/config/db.config";

dbConfig();

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
    const program = await Program.findOne({ slug })
      .populate("event")
      .populate({
        path: "event",
        populate: { path: "college" },
      });
    if (!program) {
      return NextResponse.json(
        { message: "Program not found" },
        { status: 404 }
      );
    }

    // Check if logged-in student is already registered for this program
    let isRegistered = false;
    try {
      const token = req.cookies.get("token")?.value;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          id: string;
          role: string;
        };
        if (decoded && decoded.role === "student") {
          const registeredTeam = await Team.findOne({
            program: program._id,
            members: decoded.id
          });
          if (registeredTeam) {
            isRegistered = true;
          }
        }
      }
    } catch (e) {
      // Ignore token decoding errors
    }

    // Inject isRegistered flag dynamically
    const programObj = program.toObject();
    programObj.isRegistered = isRegistered;

    return NextResponse.json(programObj, { status: 200 });
  } catch (error) {
    console.log("Error in fetching program details", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
