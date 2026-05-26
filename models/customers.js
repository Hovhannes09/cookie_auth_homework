import DbMysql from "../clients/db.mysql.js";

export async function getAll() {
  try {
    const [rows] = await DbMysql.query(
      "SELECT * FROM Customers ORDER BY CustomerID",
    );
    return rows;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSameCity() {
  try {
    const [rows] = await DbMysql.query(
      `SELECT A.CustomerName AS cm1,
                   B.CustomerName AS cm2,
                   A.City         AS c
            FROM Customers A, Customers B
            WHERE A.CustomerID <> B.CustomerID
              AND A.City = B.City
            ORDER BY c, cm1, cm2`,
    );
    return rows;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function create({ CustomerName, City, LastName }) {
  try {
    const [result] = DbMysql.query(
      "INSERT INTO Customers (CustomerName, City, last_name) VALUES (?, ?, ?)",
      [CustomerName, City, last_name ?? null],
    );
    return result.insertId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function remove(id) {
  try {
    const [result] = DbMysql.query(
      "DELETE FROM Customers WHERE CustomerID = ?",
      [id],
    );
    return result.affectedRows;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default { getAll, getSameCity, create, remove };
