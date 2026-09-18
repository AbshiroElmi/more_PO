import mysql from "mysql2";
import express from "express";
import cors from "cors";
import path from "path";

const app = express();
app.use(express.json());
app.use(cors());

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "apartment_rental", // updated to match your database
});

app.get("/appartments", (req, res) => {
  const sql = "SELECT * FROM appartments";
  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});