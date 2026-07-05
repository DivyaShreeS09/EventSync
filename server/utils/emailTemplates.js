function resetPasswordTemplate({ name, resetUrl }) {
  return `
  <div style="background:#0D0608;padding:40px 20px;font-family:Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#150B0D;border-radius:16px;border:1px solid rgba(155,35,53,0.25);overflow:hidden;">
      <tr>
        <td style="background:linear-gradient(135deg,#9B2335,#7A1A28);padding:28px 32px;text-align:center;">
          <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">⚡ CampusConnect</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#FAF0F1;">Reset your password</h1>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#C4A8AD;">
            Hi ${name || "there"}, we received a request to reset the password for your EventSync account.
            Click the button below to choose a new password.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}" style="background:linear-gradient(135deg,#9B2335,#7A1A28);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 32px;border-radius:10px;display:inline-block;">
              Reset Password
            </a>
          </div>
          <p style="margin:0 0 8px;font-size:12px;color:#6B4A50;">
            Or copy and paste this link into your browser:
          </p>
          <p style="margin:0 0 20px;font-size:12px;word-break:break-all;color:#E8697A;">${resetUrl}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#C4A8AD;">
            ⏱ This link expires in <strong style="color:#FAF0F1;">30 minutes</strong>.
          </p>
          <p style="margin:16px 0 0;font-size:13px;color:#C4A8AD;line-height:1.6;">
            If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 32px;background:rgba(255,255,255,0.03);text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B4A50;">© ${new Date().getFullYear()} CampusConnect · EventSync</p>
        </td>
      </tr>
    </table>
  </div>`;
}

module.exports = { resetPasswordTemplate };
