import nodemailer from "nodemailer";
import ejs from "ejs";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL || "projectiot1406@gmail.com",
    pass: process.env.SMTP_PASSWORD || "xyxjtekycznhpxyo",
  },
});

export default async function POST(
  email: string,
  token: string,
  name: string
): Promise<boolean> {
  const templatePath = path.join(process.cwd(), "src/helper/mailTemplate.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const senderEmail = process.env.SMTP_EMAIL || "projectiot1406@gmail.com";
  const mailOptions = {
    from: `"UniSync OTP Verification" <${senderEmail}>`,
    to: email,
    subject: "Verify Your Email - UniSync",
    html: ejs.render(template, { token, name }),
  };
  try {
    await new Promise<void>((resolve, reject) => {
      transporter.sendMail(mailOptions, (err: any, info: any) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("Email sent:", info.response);
          resolve();
        }
      });
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
