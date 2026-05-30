import dbConfig from "@/config/db.config";
import Program from "@/models/Program";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";

dbConfig();

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token found" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: string;
      };
    } catch {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "student") {
      return NextResponse.json({ message: "Only students can register for programs" }, { status: 403 });
    }

    const body = await req.json();
    const { programId } = body;

    if (!programId) {
      return NextResponse.json({ message: "Program ID is required" }, { status: 400 });
    }

    const program = await Program.findById(programId);
    if (!program) {
      return NextResponse.json({ message: "Program not found" }, { status: 404 });
    }

    const price = program.pricePerTeam || 0;
    if (price <= 0) {
      return NextResponse.json({ message: "This program is free to participate in" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RzISTxVyZ1l3Pr",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "eIco6L2xvGHf2H32RuKhG20G",
    });

    const options = {
      amount: Math.round(price * 100), // Razorpay amount in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `rcpt_${programId.substring(0, 8)}_${Date.now().toString().substring(6)}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_RzISTxVyZ1l3Pr",
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
