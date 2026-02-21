import express from "express";

const router = express.Router();

// Returns request headers and cookies for debugging CORS / cookie issues
router.get("/headers", (req, res) => {
  try {
    res.status(200).json({
      headers: req.headers,
      cookies: req.cookies || {},
      origin: req.get("origin") || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Debug route error", error: error.message });
  }
});

export default router;
