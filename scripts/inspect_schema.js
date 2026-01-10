
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

async function main() {
    try {
        const res = await pool.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            ORDER BY table_name, ordinal_position;
        `);
        console.log("Schema Info:");
        res.rows.forEach(r => console.log(`${r.table_name}.${r.column_name} (${r.data_type})`));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();
