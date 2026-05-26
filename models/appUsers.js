import DbMysql from "../clients/db.mysql.js";
import _ from "lodash";

export async function findByEmail(email) {
  try {
    const [rows] = await DbMysql.query(
      "SELECT * FROM app_users WHERE email = ?",
      [email],
    );
    return _.head(rows) ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createUser({ name, email, password }) {
  try {
    const [result] = await DbMysql.query(
      "INSERT INTO app_users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
    );
    return result.insertId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function findById(id) {
  try {
    const [rows] = await DbMysql.query(
      "SELECT id, name, email, created_at FROM app_users WHERE id = ?",
      [id],
    );
    return _.head(rows) ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default { findByEmail, createUser, findById };
