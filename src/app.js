import express from 'express';
import 'dotenv/config';
import identityRoutes from './routes/contactRoutes.js';
import pool from './database/db.js';

const app = express();
app.use(express.json());

app.use('/api', identityRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(255),
        email VARCHAR(255),
        linked_id INTEGER,
        link_precedence VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);
    console.log('Database table checked/created');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
  }
}

startServer();

export default app;