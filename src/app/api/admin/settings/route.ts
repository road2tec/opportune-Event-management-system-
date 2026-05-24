import { NextRequest, NextResponse } from "next/server";

// Simple in-memory storage for demonstration / configurations
let systemSettings = {
  maintenanceMode: false,
  platformCutPercentage: 10,
  maxTeamsPerProgram: 50,
  allowCollegeSelfSignup: true,
  supportEmail: "support@opportune.com",
};

export async function GET(req: NextRequest) {
  return NextResponse.json({ success: true, settings: systemSettings }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    systemSettings = { ...systemSettings, ...body };
    return NextResponse.json({ success: true, message: "Settings updated successfully", settings: systemSettings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
