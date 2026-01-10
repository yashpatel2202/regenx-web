const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

async function seedUsersAndTransactions() {
    try {
        console.log("Seeding Users and Transactions...");

        // 1. Create Companies
        const companyA = await createCompany("RegenX Logistics", "Logistics & Transport");
        const companyB = await createCompany("GreenWorks Recycling", "Recycling");

        // 2. Create Users
        await createUser("buyer@regenx.com", "password123", "Alice Logistics", companyA.id);
        await createUser("seller@greenworks.com", "password123", "Bob Recycler", companyB.id);

        console.log("Created Users:");
        console.log("1. buyer@regenx.com / password123 (RegenX Logistics)");
        console.log("2. seller@greenworks.com / password123 (GreenWorks Recycling)");

        // 3. Create Listings
        // GreenWorks sells "Recycled Plastic Pellets"
        const listing1 = await createListing(companyB.id, "Recycled Plastic Pellets", "High grade HDPE", 500, "Tons", "Plastic", 120);
        // GreenWorks sells "Scrap Aluminum"
        const listing2 = await createListing(companyB.id, "Scrap Aluminum", "Baled aluminum cans", 200, "Tons", "Metal", 800);

        // RegenX sells "Used Pallets"
        const listing3 = await createListing(companyA.id, "Used Wooden Pallets", "Standard size, good condition", 1000, "Units", "Organic", 5);

        // 4. Create Transactions (Orders)

        // Transaction 1: RegenX buys Plastic from GreenWorks (PENDING)
        await createOrder(listing1.id, companyA.id, 50, 6000, 'PENDING');

        // Transaction 2: RegenX buys Aluminum from GreenWorks (APPROVED)
        await createOrder(listing2.id, companyA.id, 20, 16000, 'APPROVED');

        // Transaction 3: GreenWorks buys Pallets from RegenX (REJECTED)
        await createOrder(listing3.id, companyB.id, 100, 500, 'REJECTED');

        console.log("Seeding Complete. Added 3 transactions.");

    } catch (err) {
        console.error("Seeding Failed:", err);
    } finally {
        await pool.end();
    }
}

async function createCompany(name, industry) {
    // Check if exists
    const res = await pool.query("SELECT id FROM companies WHERE name = $1", [name]);
    if (res.rows.length > 0) return res.rows[0];

    const insert = await pool.query(
        "INSERT INTO companies (name, industry_type, description) VALUES ($1, $2, 'Demo Company') RETURNING id",
        [name, industry]
    );
    return insert.rows[0];
}

async function createUser(email, password, name, companyId) {
    // Check if exists
    const res = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (res.rows.length > 0) return res.rows[0];

    const insert = await pool.query(
        "INSERT INTO users (email, password_hash, name, company_id) VALUES ($1, $2, $3, $4) RETURNING id",
        [email, password, name, companyId]
    );
    return insert.rows[0];
}

async function createListing(companyId, title, desc, qty, unit, type, price) {
    const insert = await pool.query(`
        INSERT INTO listings (company_id, title, description, quantity, unit, type, price_per_unit, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
        RETURNING id
    `, [companyId, title, desc, qty, unit, type, price]);
    return insert.rows[0];
}

async function createOrder(listingId, buyerId, qty, total, status) {
    await pool.query(`
        INSERT INTO orders (listing_id, buyer_company_id, quantity, total_price, status)
        VALUES ($1, $2, $3, $4, $5)
    `, [listingId, buyerId, qty, total, status]);
}

seedUsersAndTransactions();
