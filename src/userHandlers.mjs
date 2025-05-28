import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { JWT_EXPIRATION, JWT_SECRET_KEY } from "./settings.mjs";

import { insertUser, getUser } from "./db.mjs";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const existingUser = await getUser.get({ $email: email });
  if (existingUser) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = await insertUser.get({
    $id: crypto.randomUUID(),
    $name: name,
    $email: email,
    $password: hashedPassword,
  });
  
  return res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
  
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const user = await getUser.get({ $email: email });

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

   const token = jwt.sign({ user: { id: user.id, email: user.email }}, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRATION});

   res.json({
    email: user.email,
    name: user.name, 
    token 
  });
};