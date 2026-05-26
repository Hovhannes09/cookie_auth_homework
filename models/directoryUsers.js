import DbMysql from "../clients/db.mysql.js";

export async function create({ name }) {
  try {
    const [result] = await DbMysql.query(
      "INSERT INTO directory_users (name) VALUES (?)",
      [name],
    );
    return result.insertId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getUnique() {
  try {
    const [rows] = await DbMysql.query(
      `SELECT CustomerName AS name FROM Customers
       UNION
       SELECT name FROM directory_users
       ORDER BY name`,
    );
    return rows;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAll() {
  try {
    const [rows] = await DbMysql.query(
      `SELECT CustomerName AS name FROM Customers
       UNION ALL
       SELECT name FROM directory_users
       ORDER BY name`,
    );
    return rows;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getByLast() {
  try {
    const [rows] = await DbMysql.query(
      `SELECT last_name AS name FROM Customers WHERE last_name IS NOT NULL
       UNION
       SELECT name FROM directory_users
       ORDER BY name`,
    );
    return rows;
  } catch (error) {
    console.error("getByLast error:", error.message);
    return null;
  }
}

export default { create, getUnique, getAll, getByLast };
