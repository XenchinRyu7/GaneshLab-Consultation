import transporter from "@/lib/email";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type RequestBody = {
  fullname: string;
  email: string;
  type: string;
  company: string;
  message: string;
};

export async function POST(req: Request) {
  try {
    const { fullname, email, type, company, message }: RequestBody = await req.json();

    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #004aad; color: white; padding: 16px;">
            <h2>Selamat Datang, ${fullname}!</h2>
          </div>
          <div style="padding: 16px;">
            <p>Akun kamu telah dibuat dengan detail berikut:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
              <tr><td><strong>Password:</strong></td><td>${password}</td></tr>
            </table>
            <a href="${process.env.BASE_URL_LOGIN_NEXT}"
              style="display:inline-block;margin-top:20px;padding:10px 20px;
              background-color:#004aad;color:white;text-decoration:none;
              border-radius:5px;">Login Sekarang</a>
            <p style="margin-top:20px;font-size:12px;color:#888;">
              Jika kamu tidak merasa mendaftar, abaikan email ini.
            </p>
          </div>
        </div>
      </div>
    `;

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
        fullname,
        email,
        password: hashedPassword,
      },
    });

    return Response.json(
      { success: true, message: "Email berhasil dikirim", client },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error:", error);

    return Response.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}
