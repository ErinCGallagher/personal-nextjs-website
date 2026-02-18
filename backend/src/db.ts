// Shared PostgreSQL connection pool.
// Selects the test or production database based on NODE_ENV.
import { Pool } from 'pg';

const connectionString =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

const pool = new Pool({ connectionString });

export default pool;
