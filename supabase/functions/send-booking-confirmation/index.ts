import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  userEmail: string;
  userName: string;
  courseName: string;
  instructor: string;
  sessionDate: string;
  sessionTime: string;
  price: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userEmail, 
      userName, 
      courseName, 
      instructor, 
      sessionDate, 
      sessionTime, 
      price 
    }: BookingEmailRequest = await req.json();

    console.log("Sending booking confirmation to:", userEmail);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
        <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); padding: 40px 40px 30px; text-align: center;">
                    <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 40px;">🎓</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">Booking Confirmed!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your learning journey begins soon</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px; background: rgba(26, 26, 46, 0.95);">
                    <p style="color: #e2e8f0; font-size: 18px; margin: 0 0 30px;">Hello <strong style="color: #a78bfa;">${userName || 'Learner'}</strong>,</p>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">Thank you for booking your session with us! We're excited to have you join our learning community. Here are your booking details:</p>
                    
                    <!-- Booking Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05)); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.3); margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                                <span style="color: #94a3b8; font-size: 14px;">📚 Course</span><br>
                                <strong style="color: #f1f5f9; font-size: 18px;">${courseName}</strong>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                                <span style="color: #94a3b8; font-size: 14px;">👨‍🏫 Instructor</span><br>
                                <strong style="color: #f1f5f9; font-size: 16px;">${instructor}</strong>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                                <span style="color: #94a3b8; font-size: 14px;">📅 Date</span><br>
                                <strong style="color: #f1f5f9; font-size: 16px;">${sessionDate}</strong>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                                <span style="color: #94a3b8; font-size: 14px;">⏰ Time</span><br>
                                <strong style="color: #f1f5f9; font-size: 16px;">${sessionTime}</strong>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0;">
                                <span style="color: #94a3b8; font-size: 14px;">💰 Amount Paid</span><br>
                                <strong style="color: #10b981; font-size: 20px;">${price}</strong>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- What's Next -->
                    <div style="background: linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-radius: 12px; padding: 20px; border-left: 4px solid #10b981; margin-bottom: 30px;">
                      <h3 style="color: #10b981; margin: 0 0 12px; font-size: 16px;">✨ What's Next?</h3>
                      <ul style="color: #94a3b8; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>You'll receive the session link 30 minutes before the session</li>
                        <li>Make sure you have a stable internet connection</li>
                        <li>Join from your dashboard at the scheduled time</li>
                        <li>Have your questions ready for the instructor!</li>
                      </ul>
                    </div>
                    
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">If you have any questions, feel free to reach out to our support team. We're here to help!</p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: rgba(15, 15, 30, 0.95); padding: 30px 40px; text-align: center; border-top: 1px solid rgba(139, 92, 246, 0.2);">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 10px;">Happy Learning! 🚀</p>
                    <p style="color: #475569; font-size: 12px; margin: 0;">© 2024 SkillVerse by Focsera. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkillVerse <onboarding@resend.dev>",
        to: [userEmail],
        subject: "🎉 Your Session is Booked! - SkillVerse",
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-booking-confirmation function:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
