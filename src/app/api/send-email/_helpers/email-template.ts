/**
 * Generate HTML email template for new user account
 */
export function generateWelcomeEmailTemplate(params: {
  fullname: string;
  email: string;
  password: string;
}): string {
  const { fullname, email, password } = params;

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://ganeshlab-consultation.vercel.app"
      : "http://localhost:3000";

  return `
    <!doctype html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Selamat Datang di GaneshLab Consultation</title>
    </head>
    <body
      style="
        margin: 0;
        padding: 0;
        font-family:
          -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif;
        background-color: #f4f7fa;
        line-height: 1.6;
      "
    >
      <!-- Email Container -->
      <table
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
        width="100%"
        style="background-color: #f4f7fa; padding: 40px 20px"
      >
        <tr>
          <td align="center">
            <!-- Main Content Card -->
            <table
              role="presentation"
              cellspacing="0"
              cellpadding="0"
              border="0"
              width="600"
              style="
                max-width: 600px;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                overflow: hidden;
              "
            >
              <!-- Header with Brand -->
              <tr>
                <td
                  style="
                    background: linear-gradient(135deg, #004aad 0%, #0066dd 100%);
                    padding: 40px 40px 35px;
                    text-align: center;
                  "
                >
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                    <tr>
                      <td
                        style="
                          background-color: rgba(255, 255, 255, 0.15);
                          border-radius: 50%;
                          width: 80px;
                          height: 80px;
                          text-align: center;
                          vertical-align: middle;
                        "
                      >
                        <h1 style="color: #ffffff; font-size: 36px; font-weight: 700; margin: 0; line-height: 80px; letter-spacing: -0.5px">
                          GL
                        </h1>
                      </td>
                    </tr>
                  </table>
                  <h2 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 20px 0 8px; letter-spacing: -0.3px">
                    Selamat Datang!
                  </h2>
                  <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0">
                    Akun Anda telah berhasil dibuat
                  </p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 35px 40px 25px">
                  <p style="font-size: 18px; color: #1a1a1a; margin: 0 0 10px; font-weight: 500">Halo ${fullname},</p>
                  <p style="font-size: 15px; color: #4a5568; margin: 0; line-height: 1.7">
                    Terima kasih telah bergabung dengan <strong>GaneshLab Consultation</strong>. Akun Anda telah siap
                    digunakan dan kami sangat senang dapat melayani kebutuhan konsultasi Anda.
                  </p>
                </td>
              </tr>

              <!-- Credentials Card -->
              <tr>
                <td style="padding: 0 40px 30px">
                  <div
                    style="
                      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                      border: 2px solid #e2e8f0;
                      border-radius: 10px;
                      padding: 25px;
                    "
                  >
                    <p
                      style="
                        font-size: 14px;
                        color: #718096;
                        margin: 0 0 18px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        font-weight: 600;
                      "
                    >
                      Detail Akun Anda
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0">
                          <p style="font-size: 13px; color: #718096; margin: 0 0 4px; font-weight: 500">Email</p>
                          <p style="font-size: 15px; color: #1a202c; margin: 0; font-weight: 600">${email}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0">
                          <p style="font-size: 13px; color: #718096; margin: 0 0 4px; font-weight: 500">
                            Password Sementara
                          </p>
                          <p
                            style="
                              font-size: 15px;
                              color: #1a202c;
                              margin: 0;
                              font-family: &quot;Courier New&quot;, monospace;
                              background-color: #ffffff;
                              padding: 8px 12px;
                              border-radius: 6px;
                              display: inline-block;
                              font-weight: 600;
                              letter-spacing: 1px;
                            "
                          >
                            ${password}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding: 0 40px 30px; text-align: center">
                  <a
                    href="${baseUrl}/auth/login"
                    style="
                      display: inline-block;
                      background: linear-gradient(135deg, #004aad 0%, #0066dd 100%);
                      color: #ffffff;
                      text-decoration: none;
                      padding: 16px 40px;
                      border-radius: 8px;
                      font-size: 16px;
                      font-weight: 600;
                      box-shadow: 0 4px 14px rgba(0, 74, 173, 0.3);
                      transition: all 0.3s ease;
                    "
                  >
                    Masuk ke Akun Saya →
                  </a>
                </td>
              </tr>

              <!-- Security Tips -->
              <tr>
                <td style="padding: 0 40px 30px">
                  <div
                    style="
                      background-color: #fffaf0;
                      border-left: 4px solid #f6ad55;
                      border-radius: 6px;
                      padding: 18px 20px;
                    "
                  >
                    <p style="font-size: 14px; color: #744210; margin: 0 0 8px; font-weight: 600">🔒 Tips Keamanan</p>
                    <ul style="font-size: 13px; color: #975a16; margin: 0; padding-left: 20px; line-height: 1.6">
                      <li style="margin-bottom: 4px">Segera ubah password Anda setelah login pertama kali</li>
                      <li style="margin-bottom: 4px">Jangan bagikan kredensial akun Anda kepada siapa pun</li>
                      <li>Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol</li>
                    </ul>
                  </div>
                </td>
              </tr>

              <!-- Next Steps -->
              <tr>
                <td style="padding: 0 40px 35px">
                  <p style="font-size: 15px; color: #2d3748; margin: 0 0 12px; font-weight: 600">Langkah Selanjutnya:</p>
                  <ol style="font-size: 14px; color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.8">
                    <li style="margin-bottom: 6px">Klik tombol "Masuk ke Akun Saya" di atas</li>
                    <li style="margin-bottom: 6px">Login menggunakan email dan password yang tertera</li>
                    <li style="margin-bottom: 6px">Lengkapi profil Anda untuk pengalaman yang lebih baik</li>
                    <li>Mulai jelajahi layanan konsultasi kami</li>
                  </ol>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 40px">
                  <div style="height: 1px; background-color: #e2e8f0"></div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; text-align: center">
                  <p style="font-size: 13px; color: #718096; margin: 0 0 15px; line-height: 1.6">
                    Jika Anda tidak merasa mendaftar akun ini, silakan abaikan email ini atau hubungi tim support kami.
                  </p>

                  <div style="margin: 20px 0">
                    <p style="font-size: 14px; color: #2d3748; margin: 0 0 8px; font-weight: 600">Butuh bantuan?</p>
                    <p style="font-size: 13px; color: #4a5568; margin: 0">
                      Email:
                      <a href="mailto:support@ganeshlab.com" style="color: #004aad; text-decoration: none"
                        >support@ganeshlab.com</a
                      ><br />
                      WhatsApp:
                      <a href="https://wa.me/6281234567890" style="color: #004aad; text-decoration: none"
                        >+62 812-3456-7890</a
                      >
                    </p>
                  </div>

                  <div style="margin: 25px 0 15px">
                    <a
                      href="#"
                      style="display: inline-block; margin: 0 8px; color: #4a5568; text-decoration: none; font-size: 12px"
                      >Website</a
                    >
                    <span style="color: #cbd5e0">•</span>
                    <a
                      href="#"
                      style="display: inline-block; margin: 0 8px; color: #4a5568; text-decoration: none; font-size: 12px"
                      >Facebook</a
                    >
                    <span style="color: #cbd5e0">•</span>
                    <a
                      href="#"
                      style="display: inline-block; margin: 0 8px; color: #4a5568; text-decoration: none; font-size: 12px"
                      >Instagram</a
                    >
                    <span style="color: #cbd5e0">•</span>
                    <a
                      href="#"
                      style="display: inline-block; margin: 0 8px; color: #4a5568; text-decoration: none; font-size: 12px"
                      >LinkedIn</a
                    >
                  </div>

                  <p style="font-size: 12px; color: #a0aec0; margin: 15px 0 0; line-height: 1.5">
                    © 2025 GaneshLab Consultation. All rights reserved.<br />
                    <a href="#" style="color: #718096; text-decoration: none">Privacy Policy</a> •
                    <a href="#" style="color: #718096; text-decoration: none">Terms of Service</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
