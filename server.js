require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
// POST /addSchool
app.post('/addSchool', async (req, res) => {
  const { name, address, longitude, latitude } = req.body;
  const query = 'INSERT INTO schools (name, address, longitude, latitude) VALUES ($1, $2, $3, $4)';

  try {
    await pool.query(query, [name, address, longitude, latitude]);
    res.status(201).send("School added successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send("Error in inserting data");
  }
});

// GET /listSchools
app.get('/listSchools', async (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLong = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLong)) {
    return res.status(400).json({ error: "Invalid latitude or longitude" });
  }

  const distanceFormula = `
    6371 * ACOS(
      COS(RADIANS($1)) * COS(RADIANS(latitude)) *
      COS(RADIANS(longitude) - RADIANS($2)) +
      SIN(RADIANS($1)) * SIN(RADIANS(latitude))
    )
  `;

  const query = `SELECT *, ${distanceFormula} AS distance FROM schools ORDER BY distance ASC`;

  try {
    const result = await pool.query(query, [userLat, userLong]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
