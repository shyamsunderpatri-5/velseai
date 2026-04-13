import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "VELSEAI <noreply@selvo.in>",
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });
    
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
}

export function getWelcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VELSEAI</title>
</head>
<body style="font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="padding: 30px 40px; background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">VELSEAI</h1>
              <p style="margin: 5px 0 0 0; color: #E94560; font-size: 14px;">Beat the ATS. Get the Interview.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <h2 style="margin: 0 0 20px 0; color: #1A1A2E; font-size: 24px;">Welcome to VELSEAI, ${name || "there"}! 🎉</h2>
        
        <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Congratulations on joining 10,000+ job seekers who are using VELSEAI to beat the ATS and land their dream jobs.
        </p>
        
        <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Here's how to get started:
        </p>
        
        <!-- Steps -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
          <tr>
            <td style="padding: 15px 20px; background: #F3F4F6; border-radius: 8px; margin-bottom: 10px;">
              <strong style="color: #E94560;">1.</strong> <span style="color: #1A1A2E;">Check your ATS score free</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; background: #F3F4F6; border-radius: 8px; margin-bottom: 10px;">
              <strong style="color: #E94560;">2.</strong> <span style="color: #1A1A2E;">Build your ATS-optimized resume</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; background: #F3F4F6; border-radius: 8px;">
              <strong style="color: #E94560;">3.</strong> <span style="color: #1A1A2E;">Start tracking your job applications</span>
            </td>
          </tr>
        </table>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ats-checker" style="display: inline-block; background: #E94560; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px;">
          Check Your ATS Score Now →
        </a>
        
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 40px;">
          Need help? Just reply to this email — we're here to help you succeed!
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB;">
        <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-align: center;">
          © 2026 VELSEAI. Built with ❤️ for Indian job seekers.<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color: #6B7280;">Privacy</a> | 
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms" style="color: #6B7280;">Terms</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getPaymentConfirmationHtml(name: string, plan: string): string {
  const planNames: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    lifetime: "Lifetime",
  };
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed</title>
</head>
<body style="font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="padding: 30px 40px; background: linear-gradient(135deg, #0F9B58 0%, #059669 100%);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✓ Payment Confirmed!</h1>
              <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 14px;">Your VELSEAI ${planNames[plan] || plan} plan is now active</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <h2 style="margin: 0 0 20px 0; color: #1A1A2E; font-size: 24px;">You're all set, ${name || "there"}! 🎉</h2>
        
        <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Thank you for upgrading to VELSEAI ${planNames[plan] || plan}. You now have access to all premium features!
        </p>
        
        <div style="background: #F3F4F6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1A1A2E; font-size: 16px;">Your Plan Includes:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #6B7280;">
            <li>Unlimited resumes</li>
            <li>All 5 professional templates</li>
            <li>Unlimited AI-powered features</li>
            <li>Full job tracker</li>
            <li>Priority support</li>
          </ul>
        </div>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #1A1A2E; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Go to Dashboard →
        </a>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB;">
        <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-align: center;">
          © 2026 VELSEAI. Built with ❤️ for Indian job seekers.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getAtsScoreEmailHtml(
  name: string, 
  score: number, 
  topSuggestions: string[]
): string {
  const scoreColor = score >= 75 ? "#0F9B58" : score >= 50 ? "#F59E0B" : "#EF4444";
  const scoreLabel = score >= 85 ? "Excellent" : score >= 75 ? "Good" : score >= 50 ? "Fair" : "Needs Work";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ATS Score</title>
</head>
<body style="font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="padding: 30px 40px; background: #1A1A2E;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Your ATS Score: ${score}/100</h1>
        <p style="margin: 5px 0 0 0; color: ${scoreColor}; font-size: 18px; font-weight: 600;">${scoreLabel}</p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Hi ${name || "there"},
        </p>
        
        <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Here's your ATS analysis. ${score >= 75 
            ? "Great job! Your resume is well-optimized. Here are some tips to make it even better:" 
            : "Your resume needs some improvements to pass ATS. Here's what to focus on:"}
        </p>
        
        <div style="background: #F3F4F6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1A1A2E; font-size: 16px;">Top Fixes:</h3>
          <ol style="margin: 0; padding-left: 20px; color: #6B7280;">
            ${topSuggestions.map(s => `<li style="margin-bottom: 8px;">${s}</li>`).join("")}
          </ol>
        </div>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ats-checker" style="display: inline-block; background: #E94560; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Get Full Analysis with AI →
        </a>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB;">
        <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-align: center;">
          © 2026 VELSEAI. Built with ❤️ for Indian job seekers.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="padding: 30px 40px; background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">VELSEAI</h1>
              <p style="margin: 5px 0 0 0; color: #E94560; font-size: 14px;">Beat the ATS. Get the Interview.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <h2 style="margin: 0 0 20px 0; color: #1A1A2E; font-size: 24px;">Reset your password</h2>
        
        <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Hi ${name || "there"},
        </p>
        
        <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Reset Password
        </a>
        
        <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB;">
        <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-align: center;">
          © 2026 VELSEAI. Built with love for Indian job seekers.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}