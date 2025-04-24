require('dotenv').config(); // Load env variables

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL connection setup using environment variables
const mysqlconnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

// Connect to DB
mysqlconnection.connect((err) => {
  if (!err) console.log(" DB connection successful");
  else console.log("DB connection failed \n Error: " + JSON.stringify(err, null, 2));
});

// POST /addSchool
app.post('/addSchool', (req, res) => {
  const { name, address, longitude, latitude } = req.body;
  const query = `INSERT INTO schools (name, address, longitude, latitude) VALUES (?, ?, ?, ?)`;

  mysqlconnection.query(query, [name, address, longitude, latitude], (err, result) => {
    if (err) {
      console.error(" Error inserting data:", err);
      return res.status(500).send("Error in inserting data");
    }
    console.log("School added successfully:", result);
    res.status(201).send("School added successfully");
  });
});

// GET /listSchools
app.get('/listSchools', (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLong = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLong)) {
    return res.status(400).json({ error: "Invalid latitude or longitude" });
  }

  const distanceFormula = `
    6371 * ACOS(
      COS(RADIANS(?)) * COS(RADIANS(latitude)) *
      COS(RADIANS(longitude) - RADIANS(?)) +
      SIN(RADIANS(?)) * SIN(RADIANS(latitude))
    )`;

  const query = `SELECT *, ${distanceFormula} AS distance FROM schools ORDER BY distance ASC`;

  mysqlconnection.query(query, [userLat, userLong, userLat], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Start server
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
