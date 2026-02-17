const otpEmailTemplate = (name, otp) => {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 30px;">
    <div style="max-width: 480px; margin: auto; background-color: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
      
      <h2 style="color: #4f46e5; text-align: center; margin-bottom: 10px;">
        ClassMark
      </h2>

      <p style="color: #111827; font-size: 16px;">
        Hi ${name || "there"},
      </p>

      <p style="color: #374151; font-size: 14px; line-height: 1.6;">
        Thank you for registering with <strong>ClassMark</strong>.
        Please use the OTP below to verify your email address.
      </p>

      <div style="margin: 30px 0; text-align: center;">
        <div style="display: inline-block; background-color: #eef2ff; color: #1e3a8a; font-size: 28px; letter-spacing: 6px; padding: 14px 24px; border-radius: 10px; font-weight: bold;">
          ${otp}
        </div>
      </div>

      <p style="color: #374151; font-size: 14px;">
        This OTP is valid for <strong>5 minutes</strong>.
      </p>

      <p style="color: #dc2626; font-size: 13px; margin-top: 20px;">
        Do not share this code with anyone. ClassMark will never ask for your OTP.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

      <p style="color: #6b7280; font-size: 12px; text-align: center;">
        If you didn’t request this, you can safely ignore this email.<br />
        © ${new Date().getFullYear()} ClassMark. All rights reserved.
      </p>

    </div>
  </div>
  `;
};

export default otpEmailTemplate;
