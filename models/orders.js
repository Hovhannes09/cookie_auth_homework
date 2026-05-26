import DbMysql from "../clients/db.mysql.js";

export async function getAll() {
  try {
    const [rows] = await DbMysql.query(
      `SELECT o.OrderID, o.OrderNumber, p.FirstName, p.LastName
       FROM Orders o
       JOIN Persons p ON o.PersonID = p.PersonID
       ORDER BY o.OrderID`,
    );
    return rows;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function create({ OrderNumber, PersonID }) {
  try {
    const [result] = await DbMysql.query(
      "INSERT INTO Orders (OrderNumber, PersonID) VALUES (?, ?)",
      [OrderNumber, PersonID],
    );
    return { insertId: result.insertId };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function remove(id) {
  try {
    const [result] = await DbMysql.query(
      "DELETE FROM Orders WHERE OrderID = ?",
      [id],
    );
    return result.affectedRows;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default { getAll, create, remove };
