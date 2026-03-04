export const signupEmailTemplate = (otp) => {
  return `
  <div style="background:#f3f4f6;padding:40px;font-family:Arial,sans-serif">

    <div style="max-width:520px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08)">

      <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:25px;text-align:center;color:white">
        <h1 style="margin:0;font-size:22px">ClassMark</h1>
        <p style="margin:5px 0 0;font-size:13px;opacity:0.9">
          Smart Attendance Platform
        </p>
      </div>

      <div style="padding:35px;text-align:center">

        <h2 style="margin-top:0;color:#111">Verify Your Account</h2>

        <p style="color:#555;font-size:15px">
          Use the verification code below to complete your signup.
        </p>

<div style="
  font-size:40px;
  font-weight:700;
  letter-spacing:8px;
  text-align:center;
  background:#111827;
  padding:22px;
  border-radius:12px;
  color:#a78bfa;
  font-family:'Courier New', monospace;
">
  ${otp}
  
</div>
<p style="text-align:center;color:#9ca3af;margin-top:10px;">
Copy this code and paste it in ClassMark to verify your account.
</p>

        <p style="color:#666;font-size:14px">
          This OTP will expire in <b>5 minutes</b>.
        </p>

      </div>

      <div style="padding:20px;text-align:center;background:#f9fafb;font-size:12px;color:#888">
        © ${new Date().getFullYear()} ClassMark. All rights reserved.
      </div>

    </div>

  </div>
  `;
};