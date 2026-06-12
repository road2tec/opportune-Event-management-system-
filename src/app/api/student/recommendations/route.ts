import dbConfig from "@/config/db.config";
import Student from "@/models/Student";
import Program from "@/models/Program";
import Event from "@/models/Event";
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

    const student = await Student.findById(decoded.id);
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    const studentSkills = student.profile?.skills || [];
    const studentInterests = student.profile?.interests || [];

    // Fetch all published programs
    const programs = await Program.find({ status: "published" })
      .populate({
        path: "event",
        populate: { path: "college" }
      });

    const recommendations = programs.map((prog: any) => {
      let score = 25; // Base score
      const reasons: string[] = [];
      let isMatch = false;

      // 1. Match programType against student interests
      if (prog.programType && studentInterests.length > 0) {
        const matchesInterest = studentInterests.some(
          (interest: string) => interest.toLowerCase().trim() === prog.programType.toLowerCase().trim()
        );
        if (matchesInterest) {
          score += 40;
          reasons.push(`Matches your interest in ${prog.programType}`);
          isMatch = true;
        }
      }

      // 2. Match program title/description against student tech skills
      let skillsMatched = 0;
      if (studentSkills.length > 0) {
        studentSkills.forEach((skill: string) => {
          const s = skill.toLowerCase().trim();
          const inTitle = prog.title?.toLowerCase().includes(s);
          const inDesc = prog.description?.toLowerCase().includes(s);
          if (inTitle || inDesc) {
            skillsMatched++;
            score += 15;
            isMatch = true;
            if (reasons.length < 3) {
              reasons.push(`Matches your skill in ${skill}`);
            }
          }
        });
      }

      // 3. Add popularity score
      if (prog.popularityScore) {
        const popBonus = Math.min(prog.popularityScore * 2, 15);
        score += popBonus;
      }

      if (reasons.length === 0) {
        reasons.push("Trending program on Opportune");
      }

      // Capped match percentage
      const matchPercentage = Math.min(Math.round(score), 98);

      return {
        program: prog,
        matchPercentage,
        reasons,
        isMatch
      };
    });

    // Filter to ONLY programs that match the student profile
    const matchedRecs = recommendations.filter(r => r.isMatch);

    // Sort by match percentage in descending order
    matchedRecs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Limit to top 5 recommendations
    const topRecommendations = matchedRecs.slice(0, 5);

    // Also format all published programs for the fallback list
    const allPrograms = programs.map((p: any) => ({
      program: p,
      matchPercentage: 0,
      reasons: ["Available Opportunity"]
    }));

    return NextResponse.json({ 
      success: true, 
      recommendations: topRecommendations,
      allEvents: allPrograms
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/student/recommendations:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
