const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("🔍 Authorization header:", req.headers.authorization);

  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token error:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
