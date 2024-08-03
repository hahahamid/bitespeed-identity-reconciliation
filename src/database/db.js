import 'dotenv/config';  
import pg from 'pg'; 

const dbUser = process.env.DB_USER;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

// console.log(dbUser, dbHost, dbPassword, dbPort, dbName);

const pool = new pg.Pool({
  user: dbUser,
  host: dbHost,
  database: dbName,
  password: dbPassword,
  port: dbPort,
});

pool.on("connect", () => {
  console.log("Database connection established successfully");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool; 
