import HttpErrors from "http-errors";
import jwt from "jsonwebtoken";

export default function authorization(req, res, next) {
  try {
    const token = req.signedCookies.token;
    if (!token) throw new HttpErrors(401, "Missing or tampered cookie");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    next(new HttpErrors(401, "Invalid session"));
  }
}
