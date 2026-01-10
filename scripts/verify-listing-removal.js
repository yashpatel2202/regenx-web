const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

async function verifyListingRemoval() {
    try {
        console.log("Starting Verification: Listing Removal after Order...");

        // 1. Setup
        const companies = await pool.query("SELECT id FROM companies LIMIT 1");
        const companyId = companies.rows[0].id;

        // 2. Create Listing
        const listingRes = await pool.query(`
            INSERT INTO listings (company_id, title, description, quantity, unit, type, price_per_unit, status)
            VALUES ($1, 'Disappearing Item Test', 'Should vanish', 10, 'kg', 'Metal', 5, 'ACTIVE')
            RETURNING id
        `, [companyId]);
        const listingId = listingRes.rows[0].id;
        console.log(`Created Active Listing: ${listingId}`);

        // 3. Verify it is visible (Simulating GET /api/listings logic)
        const check1 = await pool.query("SELECT id FROM listings WHERE id = $1 AND status = 'ACTIVE'", [listingId]);
        if (check1.rows.length !== 1) throw new Error("Listing not created active");
        console.log("Listing is currently ACTIVE (Visible).");

        // 4. Place Order (Simulating POST /api/orders)
        // This query mimics the TRANSACTION logic we just added to the API
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`
                INSERT INTO orders (listing_id, buyer_company_id, quantity, total_price, status)
                VALUES ($1, $2, 10, 50, 'PENDING')
            `, [listingId, companyId]);

            await client.query(`UPDATE listings SET status = 'SOLD' WHERE id = $1`, [listingId]);
            await client.query('COMMIT');
            console.log("Order Placed & Listing Updated to SOLD.");
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        // 5. Verify it is GONE (Simulating GET /api/listings logic)
        const check2 = await pool.query("SELECT id FROM listings WHERE id = $1 AND status = 'ACTIVE'", [listingId]);
        if (check2.rows.length === 0) {
            console.log("SUCCESS: Listing is no longer 'ACTIVE' (Hidden from Marketplace).");
        } else {
            console.error("FAILURE: Listing is still ACTIVE.");
        }

        // Cleanup
        await pool.query("DELETE FROM orders WHERE listing_id = $1", [listingId]);
        await pool.query("DELETE FROM listings WHERE id = $1", [listingId]);

    } catch (err) {
        console.error("Verification Failed:", err);
    } finally {
        await pool.end();
    }
}

verifyListingRemoval();
