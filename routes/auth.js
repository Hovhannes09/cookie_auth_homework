import express from "express";
import * as authController from "../controllers/auth.js";
import authorization from "../middlewares/authorization.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authorization, authController.me);

export default router;
