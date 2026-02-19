const resetPasswordTemplate = (name, resetLink) => {
  return `
  <div style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 0;">
      <tr>
        <td align="center">

          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 15px 40px rgba(0,0,0,0.08);">
            
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:0;font-size:24px;color:#4f46e5;font-weight:700;">
                  ClassMark
                </h1>
                <p style="margin:6px 0 0;color:#6b7280;font-size:13px;">
                  Secure Password Reset
                </p>
              </td>
            </tr>

            <tr>
              <td>
                <p style="font-size:16px;color:#111827;margin:0 0 10px;">
                  Hi ${name || "there"},
                </p>

                <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 20px;">
                  We received a request to reset your password for your 
                  <strong>ClassMark</strong> account.
                </p>

                <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 25px;">
                  Click the button below to set a new password.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:10px 0 30px 0;">
                <a href="${resetLink}" 
                   style="
                     display:inline-block;
                     padding:14px 30px;
                     font-size:15px;
                     font-weight:600;
                     color:#ffffff;
                     text-decoration:none;
                     background:linear-gradient(135deg,#4f46e5,#6366f1);
                     border-radius:10px;
                     box-shadow:0 6px 15px rgba(79,70,229,0.4);
                   ">
                   Reset Password
                </a>
              </td>
            </tr>

            <tr>
              <td>
                <p style="font-size:13px;color:#374151;margin:0 0 8px;">
                  This link will expire in <strong>10 minutes</strong>.
                </p>

                <p style="font-size:13px;color:#dc2626;margin:0 0 20px;">
                  If you didn’t request a password reset, please ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding-top:20px;">
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;" />
                <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
                  For security reasons, never share your password with anyone.
                </p>
                <p style="font-size:12px;color:#9ca3af;text-align:center;margin:8px 0 0;">
                  © ${new Date().getFullYear()} ClassMark. All rights reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `;
};

export default resetPasswordTemplate;
