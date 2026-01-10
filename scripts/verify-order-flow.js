const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

async function verifyOrderFlow() {
    try {
        console.log("Starting Order Flow Verification...");

        // 1. Get a Buyer and a Seller Company
        const companiesRes = await pool.query("SELECT id, name FROM companies LIMIT 2");
        if (companiesRes.rows.length < 2) {
            console.error("Not enough companies to test.");
            return;
        }
        const seller = companiesRes.rows[0];
        const buyer = companiesRes.rows[1];
        console.log(`Seller: ${seller.name} (${seller.id})`);
        console.log(`Buyer: ${buyer.name} (${buyer.id})`);

        // 2. Create a Listing for the Seller
        const insertListing = await pool.query(`
            INSERT INTO listings (company_id, title, description, quantity, unit, type, price_per_unit, status)
            VALUES ($1, 'Test Order Item', 'Integration Test Item', 100, 'Tons', 'Metal', 50, 'ACTIVE')
            RETURNING id, title
        `, [seller.id]);
        const listing = insertListing.rows[0];
        console.log(`Created Listing: ${listing.title} (${listing.id})`);

        // 3. Place an Order (Buyer -> Seller)
        // Mimic POST /api/orders
        const insertOrder = await pool.query(`
            INSERT INTO orders (listing_id, buyer_company_id, quantity, total_price, status)
            VALUES ($1, $2, 10, 500, 'PENDING')
            RETURNING id, status
        `, [listing.id, buyer.id]);
        const order = insertOrder.rows[0];
        console.log(`Placed Order: ${order.id} - Status: ${order.status}`);

        if (order.status !== 'PENDING') throw new Error("Order should be PENDING");

        // 4. Approve the Order (Seller Action)
        // Mimic PATCH /api/orders/[id]
        const updateOrder = await pool.query(`
            UPDATE orders 
            SET status = 'APPROVED', updated_at = NOW()
            WHERE id = $1
            RETURNING id, status
        `, [order.id]);
        const updatedOrder = updateOrder.rows[0];
        console.log(`Updated Order Status: ${updatedOrder.status}`);

        if (updatedOrder.status !== 'APPROVED') throw new Error("Order should be APPROVED");

        // 5. Verify Visibility (Query logic used in GET /api/orders)

        // Buyer View (My Orders)
        const buyerView = await pool.query(`
             SELECT o.* FROM orders o WHERE o.buyer_company_id = $1 AND o.id = $2
        `, [buyer.id, order.id]);
        console.log(`Buyer View (My Orders) Found: ${buyerView.rows.length > 0}`);

        // Seller View (Incoming Requests)
        const sellerView = await pool.query(`
             SELECT o.* 
             FROM orders o
             JOIN listings l ON o.listing_id = l.id
             WHERE l.company_id = $1 AND o.id = $2
        `, [seller.id, order.id]);
        console.log(`Seller View (Incoming Requests) Found: ${sellerView.rows.length > 0}`);

        if (buyerView.rows.length === 1 && sellerView.rows.length === 1) {
            console.log("\nSUCCESS: Order Flow Verified Successfully (Create -> Pending -> Approve -> Verify Visibility)");
        } else {
            console.error("\nFAILURE: Visibility check failed.");
        }

        // Cleanup
        await pool.query("DELETE FROM orders WHERE id = $1", [order.id]);
        await pool.query("DELETE FROM listings WHERE id = $1", [listing.id]);

    } catch (err) {
        console.error("Verification Failed:", err);
    } finally {
        await pool.end();
    }
}

verifyOrderFlow();
