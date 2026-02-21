import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const requestPath = req.path;
    const requestMethod = req.method;

    if (!token) {
      console.warn(`[AUTH] No token in cookies for ${requestMethod} ${requestPath}`);
      console.warn(`[AUTH] Available cookies:`, req.cookies);
      return res.status(401).json({ 
        message: "Unauthorized - No Token Provided",
        debug: "Please login first"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.warn(`[AUTH] JWT Verification failed for ${requestPath}:`, jwtError.message);
      return res.status(401).json({ 
        message: "Unauthorized - Invalid or Expired Token",
        debug: jwtError.message
      });
    }

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.warn(`[AUTH] User not found with ID: ${decoded.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("[AUTH] Error in protectRoute middleware:", error.message);
    res.status(500).json({ 
      message: "Internal server error",
      debug: error.message
    });
  }
};
