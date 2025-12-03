import bcrypt from "bcryptjs";

import transporter from "@/lib/email";
import { prisma } from "@/lib/prisma";

import { generateWelcomeEmailTemplate } from "./_helpers/email-template";

type RequestBody = {
  fullname: string;
  email: string;
  message: string;
};

export async function POST(req: Request) {
  try {
    const { fullname, email, message }: RequestBody = await req.json();

    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    const htmlContent = generateWelcomeEmailTemplate({ fullname, email, password });

    const mailOptions = {
      from: `"GaneshLab Consultation" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Konfirmasi Akun - GaneshLab Consultation",
      text: message,
      html: htmlContent,
    };

    // Kirim email credential
    await transporter.sendMail(mailOptions);

    // Simpan user ke database Supabase
    const client = await prisma.userProfile.create({
      data: {
        userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate temporary userId
        fullname,
        email,
        password: hashedPassword,
      },
    });

    return Response.json(
      { success: true, message: "Email berhasil dikirim", client },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error:", error);

    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
