import * as Orders from "../models/orders.js";
import * as Persons from "../models/persons.js";

export async function getAll(req, res, next) {
  try {
    const persons = await Persons.getAll();
    res.json({ persons });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const { FirstName, LastName } = req.body;
    const id = await Persons.create({ FirstName, LastName });
    res.status(201).json({ message: "Created", id });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const { FirstName, LastName } = req.body;
    const affected = await Persons.update(req.params.id, {
      FirstName,
      LastName,
    });
    if (!affected) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated" });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await Persons.remove(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json({
      message: "Person deleted",
      cascadedOrders: result.cascadedOrders,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const orders = await Orders.getAll();
    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const { OrderNumber, PersonID } = req.body;
    const result = await Orders.create({ OrderNumber, PersonID });
    res.status(201).json({ message: "Created", id: result.insertId });
  } catch (error) {
    if (error.errno === 1452) {
      return res.status(422).json({ errors: { PersonID: "Person not found" } });
    }
    next(error);
  }
}

export async function removeOrder(req, res, next) {
  try {
    const affected = await Orders.remove(req.params.id);
    if (!affected) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
}
