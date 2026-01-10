import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

// Helper for single queries
export const query = async (text: string, params?: any[]) => {
    return pool.query(text, params);
};

export default pool;
