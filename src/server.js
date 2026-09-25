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

// Express route to fetch users
app.get("/users", (req, res) => {
  const sql = "SELECT user_id, user_name, p_no FROM users";
  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

// Express route to create a new user
app.post("/users", (req, res) => {
  const sql = "INSERT INTO users (user_name, pass, p_no) VALUES (?, ?, ?)";
  const values = [
    req.body.user_name,
    req.body.pass,
    req.body.p_no
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "User added successfully!", id: data.insertId });
  });
});

// Express route to update a user
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  // Based on the fields available, it seems we update user_name, pass, p_no
  // Depending on whether password is provided or not, we might conditionally update it.
  // For simplicity, let's assume all fields are provided in the update.
  const sql = "UPDATE users SET user_name = ?, pass = ?, p_no = ? WHERE user_id = ?";
  const values = [
    req.body.user_name,
    req.body.pass,
    req.body.p_no,
    id
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "User updated successfully!" });
  });
});

// Express route to delete a user
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE user_id = ?";
  conn.query(sql, [id], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "User deleted successfully!" });
  });
});

app.listen(5000)