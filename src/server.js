import mysql from "mysql2";
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const conn = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "apartment_rental",
});

conn.on("error", (err) => {
  console.error("MySQL connection error:", err.message);
});

/** Allowed tables and their primary key columns */
const TABLES = {
  accounts: "acc_no",
  address: "add_no",
  appartments: "app_no",
  billing: "bl_no",
  houses: "h_no",
  people: "p_no",
  receipts: "r_no",
  renting: "rt_no",
  sidebars: "id",
  users: "user_id",
};

function getPk(table) {
  return TABLES[table] || null;
}

function getColumnsFromTableInfo(table, cb) {
  const sql = "SELECT `table` AS col FROM tableinfo WHERE tablename = ? ORDER BY tid";
  conn.query(sql, [table], (err, rows) => {
    if (err) return cb(err);
    const cols = (rows || []).map((r) => r.col).filter(Boolean);
    cb(null, cols);
  });
}

// Form field metadata from tableinfo
app.post("/tables", (req, res) => {
  const { tablename } = req.body;
  if (!tablename) {
    return res.status(400).json({ error: "tablename is required" });
  }
  const sql = `
    SELECT key1 AS \`key\`, label, type, \`table\` AS magac, placeholder
    FROM tableinfo
    WHERE tablename = ?
    ORDER BY tid
  `;
  conn.query(sql, [tablename], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

// ---------- ONE GET / POST / PUT / DELETE for all tables ----------

// GET all rows: /data/people , /data/appartments , ...
app.get("/data/:table", (req, res) => {
  const { table } = req.params;
  if (!getPk(table)) return res.status(400).json({ error: "Unknown table" });

  // Never return passwords in list
  const sql =
    table === "users"
      ? "SELECT user_id, user_name, p_no FROM users"
      : `SELECT * FROM \`${table}\``;

  conn.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

// POST create: /data/people  body = { name, tell, ... }
app.post("/data/:table", (req, res) => {
  const { table } = req.params;
  const pk = getPk(table);
  if (!pk) return res.status(400).json({ error: "Unknown table" });

  getColumnsFromTableInfo(table, (err, cols) => {
    if (err) return res.status(500).json({ error: err.message });

    let fields = cols.length
      ? cols.filter((c) => Object.prototype.hasOwnProperty.call(req.body, c))
      : Object.keys(req.body).filter((k) => k !== pk);

    if (!fields.length) {
      return res.status(400).json({ error: "No valid fields to insert" });
    }

    const placeholders = fields.map(() => "?").join(", ");
    const sql = `INSERT INTO \`${table}\` (${fields.map((f) => `\`${f}\``).join(", ")}) VALUES (${placeholders})`;
    const values = fields.map((f) => req.body[f]);

    conn.query(sql, values, (err2, data) => {
      if (err2) return res.status(500).json({ error: err2.message });
      return res.json({ message: "Added successfully!", id: data.insertId });
    });
  });
});

// PUT update: /data/people/3
app.put("/data/:table/:id", (req, res) => {
  const { table, id } = req.params;
  const pk = getPk(table);
  if (!pk) return res.status(400).json({ error: "Unknown table" });

  getColumnsFromTableInfo(table, (err, cols) => {
    if (err) return res.status(500).json({ error: err.message });

    let fields = cols.length
      ? cols.filter((c) => Object.prototype.hasOwnProperty.call(req.body, c))
      : Object.keys(req.body).filter((k) => k !== pk);

    // Allow empty password skip on users update
    if (table === "users" && fields.includes("pass") && !req.body.pass) {
      fields = fields.filter((f) => f !== "pass");
    }

    if (!fields.length) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const sets = fields.map((f) => `\`${f}\` = ?`).join(", ");
    const sql = `UPDATE \`${table}\` SET ${sets} WHERE \`${pk}\` = ?`;
    const values = [...fields.map((f) => req.body[f]), id];

    conn.query(sql, values, (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      return res.json({ message: "Updated successfully!" });
    });
  });
});

// DELETE: /data/people/3
app.delete("/data/:table/:id", (req, res) => {
  const { table, id } = req.params;
  const pk = getPk(table);
  if (!pk) return res.status(400).json({ error: "Unknown table" });

  const sql = `DELETE FROM \`${table}\` WHERE \`${pk}\` = ?`;
  conn.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ message: "Deleted successfully!" });
  });
});

// Login (special)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE user_name = ? AND pass = ?";
  conn.query(sql, [username, password], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    if (data.length > 0) {
      return res.json({ success: true, message: "Login successful", user: data[0] });
    }
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  });
});

// Dashboard (special)
app.get("/dashboard/stats", (req, res) => {
  const queries = {
    houses: "SELECT COUNT(*) AS count FROM houses",
    apartments: "SELECT COUNT(*) AS count FROM appartments",
    people: "SELECT COUNT(*) AS count FROM people",
    renting: "SELECT COUNT(*) AS count FROM renting",
    billing: "SELECT COUNT(*) AS count FROM billing",
    accounts: "SELECT COUNT(*) AS count FROM accounts",
    recentRenting:
      "SELECT rt_no, app_no, customer, price, rt_date, deposit FROM renting ORDER BY rt_no DESC LIMIT 5",
    recentBilling:
      "SELECT bl_no, rt_no, amount, bt_date FROM billing ORDER BY bl_no DESC LIMIT 5",
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach((key) => {
    conn.query(queries[key], (err, data) => {
      results[key] = err ? null : data;
      completed++;
      if (completed === keys.length) return res.json(results);
    });
  });
});

app.listen(5000);
console.log("Server running on http://localhost:5000");
