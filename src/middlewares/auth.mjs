import jwt from "jsonwebtoken";

import { JWT_SECRET_KEY } from "../settings.mjs";

export const auth = (req, res, next) => {
  console.log(req.header("Authorization"));

  const token = req.header("Authorization");
  
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });
  
  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};
