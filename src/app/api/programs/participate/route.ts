import jwt from "jsonwebtoken";
import dbConfig from "@/config/db.config";
import { NextRequest, NextResponse } from "next/server";
import Program from "@/models/Program";
import Team from "@/models/Team";
import Student from "@/models/Student";

dbConfig();

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token found" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    if (decoded.role !== "student") {
      return NextResponse.json({ message: "Only students can participate in programs" }, { status: 403 });
    }

    const studentId = decoded.id;
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action, programId, teamName, teamCode, teamPassword } = body;

    if (!programId) {
      return NextResponse.json({ message: "Program ID is required" }, { status: 400 });
    }

    const program = await Program.findById(programId);
    if (!program) {
      return NextResponse.json({ message: "Program not found" }, { status: 404 });
    }

    // 1. INDIVIDUAL PARTICIPATION
    if (action === "individual") {
      if (program.type !== "individual") {
        return NextResponse.json({ message: "This program requires team participation" }, { status: 400 });
      }

      // Check if student is already registered for this program
      const existingTeam = await Team.findOne({ program: programId, leader: studentId });
      if (existingTeam) {
        return NextResponse.json({ message: "You are already registered for this program" }, { status: 400 });
      }

      // Create a single-member team
      const newTeam = new Team({
        program: programId,
        name: `${student.name} - Individual`,
        leader: studentId,
        members: [studentId],
        status: "locked", // locked since it's individual
      });

      await newTeam.save();

      // Update program metrics
      program.totalRegistrations = (program.totalRegistrations || 0) + 1;
      program.totalParticipants = (program.totalParticipants || 0) + 1;
      await program.save();

      return NextResponse.json({
        message: "Successfully registered for the program!",
        team: newTeam,
      }, { status: 201 });
    }

    // 2. CREATE A TEAM
    if (action === "create-team") {
      if (program.type !== "team") {
        return NextResponse.json({ message: "This program requires individual participation" }, { status: 400 });
      }

      if (!teamName || teamName.trim() === "") {
        return NextResponse.json({ message: "Team name is required" }, { status: 400 });
      }

      // Check if team name is already taken (unique in DB)
      const nameExists = await Team.findOne({ name: teamName });
      if (nameExists) {
        return NextResponse.json({ message: "Team name is already taken. Please choose another name." }, { status: 400 });
      }

      // Check if student is already leading a team in this program
      const isAlreadyLeader = await Team.findOne({ program: programId, leader: studentId });
      if (isAlreadyLeader) {
        return NextResponse.json({ message: "You have already created a team for this program" }, { status: 400 });
      }

      // Check if student is already a member of any team in this program
      const isAlreadyMember = await Team.findOne({ program: programId, members: studentId });
      if (isAlreadyMember) {
        return NextResponse.json({ message: "You are already a member of a team in this program" }, { status: 400 });
      }

      // Generate credentials
      const generatedCode = "TM-" + Math.floor(100000 + Math.random() * 900000);
      const generatedPassword = Math.floor(1000 + Math.random() * 9000).toString();

      const newTeam = new Team({
        program: programId,
        name: teamName,
        leader: studentId,
        members: [studentId],
        credentials: {
          teamCode: generatedCode,
          password: generatedPassword,
        },
        status: "open",
      });

      await newTeam.save();

      // Update program metrics
      program.totalRegistrations = (program.totalRegistrations || 0) + 1;
      program.totalParticipants = (program.totalParticipants || 0) + 1;
      await program.save();

      return NextResponse.json({
        message: "Team created successfully!",
        team: newTeam,
      }, { status: 201 });
    }

    // 3. JOIN A TEAM
    if (action === "join-team") {
      if (program.type !== "team") {
        return NextResponse.json({ message: "This program is for individual participation" }, { status: 400 });
      }

      if (!teamCode || !teamPassword) {
        return NextResponse.json({ message: "Team code and password are required" }, { status: 400 });
      }

      // Find the team
      const team = await Team.findOne({
        program: programId,
        "credentials.teamCode": teamCode.trim()
      });

      if (!team) {
        return NextResponse.json({ message: "Invalid Team Code" }, { status: 404 });
      }

      if (team.credentials.password !== teamPassword.trim()) {
        return NextResponse.json({ message: "Incorrect password for this team" }, { status: 400 });
      }

      // Check if student is already in this team
      if (team.members.includes(studentId)) {
        return NextResponse.json({ message: "You are already a member of this team" }, { status: 400 });
      }

      // Check if student is already in ANY team in this program
      const isAlreadyInAnyTeam = await Team.findOne({ program: programId, members: studentId });
      if (isAlreadyInAnyTeam) {
        return NextResponse.json({ message: "You are already registered in a team for this program" }, { status: 400 });
      }

      // Check team size limits
      const maxLimit = program.teamSize?.max || 4;
      if (team.members.length >= maxLimit) {
        return NextResponse.json({ message: `This team is already full (Maximum limit: ${maxLimit} members)` }, { status: 400 });
      }

      // Add student to members list
      team.members.push(studentId);
      
      // If team is now full, lock it
      if (team.members.length >= maxLimit) {
        team.status = "locked";
      }

      await team.save();

      // Update program metrics
      program.totalParticipants = (program.totalParticipants || 0) + 1;
      await program.save();

      return NextResponse.json({
        message: "Successfully joined the team!",
        team,
      }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in program participation route:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
