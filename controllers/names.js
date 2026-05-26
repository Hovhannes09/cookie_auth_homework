import * as DirectoryUsers from "../models/directoryUsers.js";

export async function createDirectoryUser(req, res, next) {
  try {
    const { name } = req.body;
    const id = await DirectoryUsers.create({ name });
    res.status(201).json({ message: "Created", id });
  } catch (error) {
    next(error);
  }
}

export async function getUnique(req, res, next) {
  try {
    const rows = await DirectoryUsers.getUnique();
    const names = rows.map((r) => r.name);
    res.json({ names, count: names.length });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req, res, next) {
  try {
    const rows = await DirectoryUsers.getAll();
    const names = rows.map((r) => r.name);
    res.json({ names, count: names.length });
  } catch (error) {
    next(error);
  }
}

export async function getByLast(req, res, next) {
  try {
    const rows = await DirectoryUsers.getByLast();
    const names = rows.map((r) => r.name);
    res.json({ names, count: names.length });
  } catch (error) {
    next(error);
  }
}
