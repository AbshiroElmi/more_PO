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

// Express route to fetch houses
app.get("/houses", (req, res) => {
  const sql = "SELECT * FROM houses";
  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

// Express route to create a new house
app.post("/houses", (req, res) => {
  const sql = "INSERT INTO houses (house_name, owner, add_no) VALUES (?, ?, ?)";
  const values = [
    req.body.house_name,
    req.body.owner,
    req.body.add_no
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "House added successfully!", id: data.insertId });
  });
});

// Express route to update a house
app.put("/houses/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE houses SET house_name = ?, owner = ?, add_no = ? WHERE h_no = ?";
  const values = [
    req.body.house_name,
    req.body.owner,
    req.body.add_no,
    id
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "House updated successfully!" });
  });
});

// Express route to delete a house
app.delete("/houses/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM houses WHERE h_no = ?";
  conn.query(sql, [id], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "House deleted successfully!" });
  });
});

// Express route to fetch accounts
app.get("/accounts", (req, res) => {
  const sql = "SELECT * FROM accounts";
  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

// Express route to create a new account
app.post("/accounts", (req, res) => {
  const sql = "INSERT INTO accounts (acc_name, institution, balance) VALUES (?, ?, ?)";
  const values = [
    req.body.acc_name,
    req.body.institution,
    req.body.balance
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Account added successfully!", id: data.insertId });
  });
});

// Express route to update an account
app.put("/accounts/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE accounts SET acc_name = ?, institution = ?, balance = ? WHERE acc_no = ?";
  const values = [
    req.body.acc_name,
    req.body.institution,
    req.body.balance,
    id
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Account updated successfully!" });
  });
});

// Express route to delete an account
app.delete("/accounts/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM accounts WHERE acc_no = ?";
  conn.query(sql, [id], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Account deleted successfully!" });
  });
});

// Express route to fetch address
app.get("/address", (req, res) => {
  const sql = "SELECT * FROM address";
  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

// Express route to create a new address
app.post("/address", (req, res) => {
  const sql = "INSERT INTO address (district, village) VALUES (?, ?)";
  const values = [
    req.body.district,
    req.body.village
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Address added successfully!", id: data.insertId });
  });
});

// Express route to update an address
app.put("/address/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE address SET district = ?, village = ? WHERE add_no = ?";
  const values = [
    req.body.district,
    req.body.village,
    id
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Address updated successfully!" });
  });
});

// Express route to delete an address
app.delete("/address/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM address WHERE add_no = ?";
  conn.query(sql, [id], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Address deleted successfully!" });
  });
});

// Express route to fetch billing
app.get("/billing", (req, res) => {
  const sql = "SELECT * FROM billing";
  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

// Express route to create a new billing record
app.post("/billing", (req, res) => {
  const sql = "INSERT INTO billing (rt_no, amount, bt_date, description) VALUES (?, ?, ?, ?)";
  const values = [
    req.body.rt_no,
    req.body.amount,
    req.body.bt_date,
    req.body.description
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Billing record added successfully!", id: data.insertId });
  });
});

// Express route to update a billing record
app.put("/billing/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE billing SET rt_no = ?, amount = ?, bt_date = ?, description = ? WHERE bl_no = ?";
  const values = [
    req.body.rt_no,
    req.body.amount,
    req.body.bt_date,
    req.body.description,
    id
  ];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Billing record updated successfully!" });
  });
});

// Express route to delete a billing record
app.delete("/billing/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM billing WHERE bl_no = ?";
  conn.query(sql, [id], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Billing record deleted successfully!" });
  });
});

// Express routes for people
app.get("/people", (req, res) => {
  const sql = "SELECT * FROM people";
  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

app.post("/people", (req, res) => {
  const sql = "INSERT INTO people (name, tell) VALUES (?, ?)";
  const values = [req.body.name, req.body.tell];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Person added successfully!", id: data.insertId });
  });
});

app.put("/people/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE people SET name = ?, tell = ? WHERE p_no = ?";
  const values = [req.body.name, req.body.tell, id];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Person updated successfully!" });
  });
});

app.delete("/people/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM people WHERE p_no = ?";
  conn.query(sql, [id], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Person deleted successfully!" });
  });
});

// Express routes for receipts
app.get("/receipts", (req, res) => {
  const sql = "SELECT * FROM receipts";
  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

app.post("/receipts", (req, res) => {
  const sql = "INSERT INTO receipts (p_no, acc_no, rt_date) VALUES (?, ?, ?)";
  const values = [req.body.p_no, req.body.acc_no, req.body.rt_date];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Receipt added successfully!", id: data.insertId });
  });
});

app.put("/receipts/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE receipts SET p_no = ?, acc_no = ?, rt_date = ? WHERE r_no = ?";
  const values = [req.body.p_no, req.body.acc_no, req.body.rt_date, id];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Receipt updated successfully!" });
  });
});

app.delete("/receipts/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM receipts WHERE r_no = ?";
  conn.query(sql, [id], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Receipt deleted successfully!" });
  });
});

// Express routes for renting
app.get("/renting", (req, res) => {
  const sql = "SELECT * FROM renting";
  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

app.post("/renting", (req, res) => {
  const sql = "INSERT INTO renting (app_no, customer, price, rt_date, deposit, description) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [req.body.app_no, req.body.customer, req.body.price, req.body.rt_date, req.body.deposit, req.body.description];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Renting record added successfully!", id: data.insertId });
  });
});

app.put("/renting/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE renting SET app_no = ?, customer = ?, price = ?, rt_date = ?, deposit = ?, description = ? WHERE rt_no = ?";
  const values = [req.body.app_no, req.body.customer, req.body.price, req.body.rt_date, req.body.deposit, req.body.description, id];
  conn.query(sql, values, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Renting record updated successfully!" });
  });
});

app.delete("/renting/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM renting WHERE rt_no = ?";
  conn.query(sql, [id], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Renting record deleted successfully!" });
  });
});

// Express route for dashboard stats
app.get("/dashboard/stats", (req, res) => {
  const queries = {
    houses: "SELECT COUNT(*) AS count FROM houses",
    apartments: "SELECT COUNT(*) AS count FROM appartments",
    people: "SELECT COUNT(*) AS count FROM people",
    renting: "SELECT COUNT(*) AS count FROM renting",
    billing: "SELECT COUNT(*) AS count FROM billing",
    accounts: "SELECT COUNT(*) AS count FROM accounts",
    recentRenting: "SELECT rt_no, app_no, customer, price, rt_date, deposit FROM renting ORDER BY rt_no DESC LIMIT 5",
    recentBilling: "SELECT bl_no, rt_no, amount, bt_date FROM billing ORDER BY bl_no DESC LIMIT 5",
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach((key) => {
    conn.query(queries[key], (err, data) => {
      if (err) { results[key] = null; }
      else { results[key] = data; }
      completed++;
      if (completed === keys.length) {
        return res.json(results);
      }
    });
  });
});

app.listen(5000)