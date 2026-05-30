import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  try {
    const { email, plan, price } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-w-xl mx-auto p-8 bg-[#020617] text-white rounded-2xl border border-[#334155]">
        <h1 style="color: #2dd4bf; text-align: center;">Плащането е успешно! 💳</h1>
        <p style="font-size: 16px; color: #cbd5e1; text-align: center;">Благодарим ти, че избра PRO абонамент за AgroAcademy.</p>
        
        <div style="background: rgba(15, 23, 42, 0.8); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(45, 212, 191, 0.2);">
          <h3 style="color: #fff; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 12px;">Детайли на поръчката:</h3>
          <table style="width: 100%; color: #94a3b8; font-size: 15px;">
            <tr>
              <td style="padding: 8px 0;"><strong>План:</strong></td>
              <td style="text-align: right; color: #fff;">${plan || 'PRO / Спонсор'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Цена:</strong></td>
              <td style="text-align: right; color: #2dd4bf; font-weight: bold; font-size: 18px;">${price || '0'} €</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Статус:</strong></td>
              <td style="text-align: right; color: #34d399;">Платено</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: #64748b; text-align: center;">Твоят акаунт вече има достъп до всички PRO функции.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://agrinexus.eu/dashboard" style="background: #2dd4bf; color: #020617; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Към моето табло</a>
        </div>
      </div>
    `;

    if (resend) {
      const data = await resend.emails.send({
        from: 'AgroAcademy Billing <billing@resend.dev>',
        to: email,
        subject: 'Електронна разписка от AgroAcademy',
        html: htmlContent,
      });
      return NextResponse.json({ success: true, data, simulated: false });
    } else {
      console.log(`[SIMULATION] Sending Receipt Email to ${email}`);
      console.log(htmlContent);
      return NextResponse.json({ success: true, simulated: true, message: "Receipt simulated successfully." });
    }

  } catch (error: any) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
