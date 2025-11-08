import transporter from "@/lib/email";

export async function POST(req) {
  try {
    const { name, email, type, company, message } = await req.json();

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: email, // penerima (bisa email kamu sendiri)
      subject: "Pesan Baru dari Website",
      text: message,
      html: `<p><b>Dari:</b> ${name} (${email})</p><p>${message}</p><p>${type}</p><p>${company}</p>`,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({ success: true, message: "Email berhasil dikirim" });
  } catch (error) {
    console.error("Error:", error);

    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
