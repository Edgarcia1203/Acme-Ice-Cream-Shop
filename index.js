// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Create a pool for connecting to PostgreSQL database
const pool = new Pool({
  user: 'your_username',
  host: 'localhost',
  database: 'your_database_name',
  password: 'your_password',
  port: 5432,
});

// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to get all flavors
app.get('/api/flavors', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM flavors');
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get a single flavor by ID
app.get('/api/flavors/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM flavors WHERE id = $1', [id]);
    client.release();
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to create a new flavor
app.post('/api/flavors', async (req, res) => {
  const { name, is_favorite } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *', [name, is_favorite]);
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to delete a flavor by ID
app.delete('/api/flavors/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM flavors WHERE id = $1', [id]);
    client.release();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to update a flavor by ID
app.put('/api/flavors/:id', async (req, res) => {
  const id = req.params.id;
  const { name, is_favorite } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('UPDATE flavors SET name = $1, is_favorite = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *', [name, is_favorite, id]);
    client.release();
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});