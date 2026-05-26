import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as AppUsers from "../models/appUsers.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    console.log("register body:", req.body);

    const existing = await AppUsers.findByEmail(email);
    console.log("existing:", existing);
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = await AppUsers.createUser({ name, email, password: hashed });
    console.log("created id:", id);

    res.status(201).json({ message: "Registered", id });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await AppUsers.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      signed: true,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: Number(process.env.COOKIE_MAX_AGE),
    });

    res
      .status(200)
      .json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    res.clearCookie("token", { signed: true, httpOnly: true, sameSite: "lax" });
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await AppUsers.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    next(error);
  }
}
