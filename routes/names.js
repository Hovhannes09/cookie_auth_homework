import express from "express";
import * as namesController from "../controllers/names.js";
import authorization from "../middlewares/authorization.js";

const router = express.Router();

router.post(
  "/directory-users",
  authorization,
  namesController.createDirectoryUser,
);
router.get("/unique", authorization, namesController.getUnique);
router.get("/all", authorization, namesController.getAll);
router.get("/by-last", authorization, namesController.getByLast);

export default router;
