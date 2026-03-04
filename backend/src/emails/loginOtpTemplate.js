export const loginOtpTemplate = (otp) => {
  return `
  <div style="background:#f3f4f6;padding:40px;font-family:Arial">

    <div style="max-width:520px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08)">

      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:25px;text-align:center;color:white">
        <h1 style="margin:0;font-size:22px">ClassMark</h1>
        <p style="margin:5px 0 0;font-size:13px">
          Secure Login Verification
        </p>
      </div>

      <div style="padding:35px;text-align:center">

        <h2 style="margin-top:0;color:#111">
          Login Verification
        </h2>

        <p style="color:#555;font-size:15px">
          Enter this code to continue logging into your account.
        </p>

        <div style="
          font-size:36px;
          letter-spacing:8px;
          font-weight:bold;
          background:#ecfdf5;
          color:#059669;
          padding:18px;
          border-radius:8px;
          margin:25px 0">
          ${otp}
        </div>

        <p style="color:#666;font-size:14px">
          This OTP will expire in <b>5 minutes</b>.
        </p>

      </div>

      <div style="padding:20px;text-align:center;background:#f9fafb;font-size:12px;color:#888">
        If you didn't request this login, please ignore this email.
      </div>

    </div>

  </div>
  `;
};