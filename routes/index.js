import express from "express";
import authRouter from "./auth.js";
import customersRouter from "./customers.js";
import namesRouter from "./names.js";
import personsRouter from "./persons.js";

const router = express.Router();

router.get("/", (req, res) => res.json({ message: "Welcome!" }));
router.use("/auth", authRouter);
router.use("/customers", customersRouter);
router.use("/names", namesRouter);
router.use("/persons", personsRouter);

export default router;
