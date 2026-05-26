import "dotenv/config";
import mysql from "mysql2";

const pool = mysql.createPool({
  host: process.env.MY_SQL_HOST,
  port: process.env.MY_SQL_PORT,
  user: process.env.MY_SQL_USER,
  password: process.env.MY_SQL_PASSWORD,
  database: process.env.MY_SQL_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connection", () => {
  console.log("DB connection succeeded.");
});

export default pool.promise();
