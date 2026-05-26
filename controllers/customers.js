import * as Customers from "../models/customers.js";

export async function getAll(req, res, next) {
  try {
    const customers = await Customers.getAll();
    res.json({ customers });
  } catch (error) {
    next(error);
  }
}

export async function getSameCity(req, res, next) {
  try {
    const pairs = await Customers.getSameCity();
    res.json({ pairs, count: pairs.length });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const { CustomerName, City, last_name } = req.body;
    const id = await Customers.create({ CustomerName, City, last_name });
    res.status(201).json({ message: "Created", id });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const affected = await Customers.remove(req.params.id);
    if (!affected) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
}
