import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret not configured");
  }

  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export default generateToken;
