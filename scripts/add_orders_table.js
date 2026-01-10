const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

async function migrate() {
    try {
        console.log("Adding orders table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                listing_id UUID REFERENCES listings(id),
                buyer_company_id UUID REFERENCES companies(id),
                quantity DECIMAL NOT NULL,
                total_price DECIMAL,
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log("Successfully added orders table.");
    } catch (err) {
        console.error("Error migrating:", err);
    } finally {
        await pool.end();
    }
}

migrate();
