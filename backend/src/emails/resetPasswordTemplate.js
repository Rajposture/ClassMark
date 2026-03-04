export const resetPasswordTemplate = (resetUrl) => {
  return `
  <div style="background:#f3f4f6;padding:40px;font-family:Arial">

    <div style="max-width:520px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08)">

      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:25px;text-align:center;color:white">
        <h1 style="margin:0;font-size:22px">ClassMark</h1>
        <p style="margin:5px 0 0;font-size:13px">
          Password Reset Request
        </p>
      </div>

      <div style="padding:35px;text-align:center">

        <h2 style="margin-top:0;color:#111">
          Reset Your Password
        </h2>

        <p style="color:#555;font-size:15px">
          Click the button below to create a new password.
        </p>

        <a href="${resetUrl}"
          style="
            display:inline-block;
            margin-top:20px;
            padding:14px 28px;
            background:#ef4444;
            color:white;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
            font-size:15px">
          Reset Password
        </a>

        <p style="color:#666;font-size:14px;margin-top:25px">
          This link will expire in <b>15 minutes</b>.
        </p>

      </div>

      <div style="padding:20px;text-align:center;background:#f9fafb;font-size:12px;color:#888">
        If you didn't request this password reset, please ignore this email.
      </div>

    </div>

  </div>
  `;
};