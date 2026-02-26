import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET = process.env.JWT_SECRET || "supersecret";

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const comparePassword = (p: string, h: string) => bcrypt.compare(p, h);

export const signToken = (payload: any) => jwt.sign(payload, SECRET, { expiresIn: "7d" });
export const verifyToken = (token: string) => jwt.verify(token, SECRET);
