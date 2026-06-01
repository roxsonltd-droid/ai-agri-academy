import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend conditionally
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-w-xl mx-auto p-8 bg-[#020617] text-white rounded-2xl border border-[#334155]">
        <h1 style="color: #2dd4bf; text-align: center;">Добре дошли в AgroAcademy! 🌱</h1>
        <p style="font-size: 16px; color: #cbd5e1; line-height: 1.5;">Здравей${name ? ' ' + name : ''},</p>
        <p style="font-size: 16px; color: #cbd5e1; line-height: 1.5;">Благодарим ти, че се присъедини към първата AI платформа за земеделци в България. Твоят акаунт е успешно създаден.</p>
        
        <div style="background: rgba(15, 23, 42, 0.8); padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(45, 212, 191, 0.2);">
          <h3 style="color: #fff; margin-top: 0;">Какво следва?</h3>
          <ul style="color: #94a3b8; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Влез в своя профил и въведи региона си.</li>
            <li style="margin-bottom: 10px;">Разгледай <strong style="color: #2dd4bf;">Mission Control</strong> и активирай своите AI Агенти.</li>
            <li>Анализирай данни с Ректора (нашия главен AI асистент).</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://agrinexus.eu/dashboard" style="background: #2dd4bf; color: #020617; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Към моето табло</a>
        </div>
        <p style="text-align: center; font-size: 12px; color: #64748b; margin-top: 40px;">Това е автоматично съобщение от AI Agro Academy.</p>
      </div>
    `;

    // If we have an API key, send real email
    if (resend) {
      const data = await resend.emails.send({
        from: 'AgroAcademy <onboarding@resend.dev>', // Change to your verified domain later
        to: email,
        subject: 'Добре дошли в бъдещето на земеделието! 🚜',
        html: htmlContent,
      });
      return NextResponse.json({ success: true, data, simulated: false });
    } else {
      // Simulation mode
      console.log(`[SIMULATION] Sending Welcome Email to ${email}`);
      console.log(htmlContent);
      return NextResponse.json({ success: true, simulated: true, message: "Email simulated successfully." });
    }

  } catch (error: any) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
