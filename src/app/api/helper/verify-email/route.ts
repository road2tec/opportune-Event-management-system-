import verifyEmail from "@/config/verifyemail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email not specified" }, { status: 400 });
    }

    const emailStr = email.trim().toLowerCase();
    const domain = emailStr.split("@")[1];
    const username = emailStr.split("@")[0] || "";

    // 1. Anti-Spam Disposable Email Domain Filter
    const disposableDomains = [
      "mailinator.com", "yopmail.com", "tempmail.com", "10minutemail.com",
      "trashmail.com", "dispostable.com", "guerrillamail.com", "sharklasers.com",
      "getairmail.com", "temp-mail.org", "yopmail.fr", "yopmail.net"
    ];

    if (disposableDomains.includes(domain)) {
      return NextResponse.json({ 
        message: "AI Security Block: Registrations utilizing temporary or disposable email addresses are prohibited." 
      }, { status: 400 });
    }

    // 2. Anti-Spam Bot Pattern Detection (Anomaly detection)
    const consecutiveDigits = /\d{5,}/; // e.g. aditya123456
    const randomConsonants = /[^aeiou1234567890]{6,}/i; // e.g. bcdfgz (random typing)

    if (consecutiveDigits.test(username) || randomConsonants.test(username) || username.length < 3) {
      return NextResponse.json({ 
        message: "AI Spam Prevention: Suspicious, randomized, or bot-like email pattern detected." 
      }, { status: 400 });
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated secure OTP token:", token);
    const response = await verifyEmail(emailStr, token, name);
    
    if (response) {
      return NextResponse.json({ token, email: emailStr }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Failed to dispatch verification email. Try again." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in verify-email route:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
