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

// Express route to create a new apartment
app.post("/appartments", (req, res) => {
  const sql = "INSERT INTO appartments (app_name, h_no, rooms, toilets, description) VALUES (?, ?, ?, ?, ?)";
  const values = [
    req.body.app_name,
    req.body.h_no,
    req.body.rooms,
    req.body.toilets,
    req.body.description
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Apartment added successfully!", id: data.insertId });
  });
});

// Express route for user login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE user_name = ? AND pass = ?";
  conn.query(sql, [username, password], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    if (data.length > 0) {
      return res.json({ success: true, message: "Login successful", user: data[0] });
    } else {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  });
});

app.listen(5000)