import DbMysql from "../clients/db.mysql.js";
import _ from "lodash";

export async function getAll() {
  try {
    const [rows] = await DbMysql.query(
      "SELECT * FROM Persons ORDER BY PersonID",
    );
    return rows;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function create({ FirstName, LastName }) {
  try {
    const [result] = await DbMysql.query(
      "INSERT INTO Persons (FirstName, LastName) VALUES (?, ?)",
      [FirstName, LastName],
    );
    return result.insertId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function update(id, { FirstName, LastName }) {
  try {
    const [result] = await DbMysql.query(
      "UPDATE Persons SET FirstName = ?, LastName = ? WHERE PersonID = ?",
      [FirstName, LastName, id],
    );
    return result.affectedRows;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function remove(id) {
  try {
    const [orderRows] = await DbMysql.query(
      "SELECT COUNT(*) AS cnt FROM Orders WHERE PersonID = ?",
      [id],
    );
    const cascadedOrders = _.get(orderRows, "[0].cnt", 0);

    await DbMysql.query("DELETE FROM Persons WHERE PersonID = ?", [id]);

    return { cascadedOrders };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default { getAll, create, update, remove };
