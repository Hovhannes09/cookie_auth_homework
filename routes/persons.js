import express from "express";
import * as personsController from "../controllers/persons.js";
import authorization from "../middlewares/authorization.js";

const router = express.Router();

router.post("/", authorization, personsController.create);
router.get("/", authorization, personsController.getAll);
router.put("/:id", authorization, personsController.update);
router.delete("/:id", authorization, personsController.remove);

router.post("/orders", authorization, personsController.createOrder);
router.get("/orders", authorization, personsController.getAllOrders);
router.delete("/orders/:id", authorization, personsController.removeOrder);

export default router;
