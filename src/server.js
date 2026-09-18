import mysql from "mysql2";
import express from "express";
import cors from "cors";
import path from "path";
let app=express();
app.use(express.json())
app.use(cors(

    ))

let conn=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"apartment_rental"
})

// Express route to fetch apartments
app.get("/appartments", (req, res) => {
  const sql = "SELECT * FROM appartments";
  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});


app.listen(5000)