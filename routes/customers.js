import express from "express";
import * as customersController from "../controllers/customers.js";
import authorization from "../middlewares/authorization.js";

const router = express.Router();

router.post("/", authorization, customersController.create);
router.get("/", authorization, customersController.getAll);
router.get("/same-city", authorization, customersController.getSameCity);
router.delete("/:id", authorization, customersController.remove);

export default router;
