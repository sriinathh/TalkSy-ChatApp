import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  };

  console.log(`[TOKEN] Generating JWT for user: ${userId}`);
  console.log(`[TOKEN] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[TOKEN] Cookie options:`, cookieOptions);

  res.cookie("jwt", token, cookieOptions);

  console.log(`[TOKEN] JWT cookie set successfully`);

  return token;
};
