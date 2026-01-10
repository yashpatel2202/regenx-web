const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

const companyNames = [
    "Apex Industries", "BlueWave Solutions", "CarbonLoop", "DuraSteel Corp", "EcoChem Users",
    "FutureFab", "Global Aggregates", "Harbor Logistics", "IronWorks Intl", "Juno Textiles",
    "Kinetic Energy", "Lumina Glass", "Metro Metals", "Nexus Plastics", "Orbit Organic",
    "Prime Polymers", "Quantum Quarry", "ReBuilt Systems", "Solaris Cycle", "Terra Firma"
];

const categories = [
    { type: 'Metal', items: ['Copper Wire', 'Steel Beams', 'Aluminum Sheets', 'Iron Scraps', 'Brass Fittings'] },
    { type: 'Plastic', items: ['HDPE Pellets', 'PVC Off-cuts', 'PET Bottles (Baled)', 'Mixed Plastics', 'Nylon Fibers'] },
    { type: 'Organic', items: ['Wood Chips', 'Compost Base', 'Food Waste (Processed)', 'Cotton Linters', 'Bio-sludge'] },
    { type: 'Glass', items: ['Cullet (Clear)', 'Cullet (Colored)', 'Mirror Shards', 'Glass Dust', 'Tempered Glass Scraps'] },
    { type: 'Construction', items: ['Concrete Crushed', 'Brick Rubble', 'Asphalt Millings', 'Gypsum Board', 'Ceramic Tile Waste'] },
    { type: 'Chemical', items: ['Clean Solvents', 'Glycol Recovery', 'Spent Acids', 'Paint Sludge', 'Industrial Salts'] }
];

async function seedListings() {
    try {
        console.log("Seeding marketplace listings...");

        // 1. Create Companies
        const companyIds = [];
        console.log("Creating companies...");

        for (const name of companyNames) {
            // Check if exists
            let res = await pool.query("SELECT id FROM companies WHERE name = $1", [name]);
            let id;
            if (res.rows.length === 0) {
                const insertRes = await pool.query(
                    `INSERT INTO companies (name, industry_type, description, address) 
                     VALUES ($1, $2, $3, $4) RETURNING id`,
                    [name, 'Diversified', `Leading provider of ${name} related services.`, '100 Industrial Way']
                );
                id = insertRes.rows[0].id;
            } else {
                id = res.rows[0].id;
            }
            companyIds.push(id);
        }

        // 2. Create Listings
        console.log("Creating 80 listings...");

        for (let i = 0; i < 80; i++) {
            const companyId = companyIds[Math.floor(Math.random() * companyIds.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const itemTitle = category.items[Math.floor(Math.random() * category.items.length)];

            const quantity = Math.floor(Math.random() * 900) + 50; // 50 - 950
            const price = Math.floor(Math.random() * 500) + 10; // 10 - 510

            await pool.query(`
                INSERT INTO listings (company_id, title, description, quantity, unit, type, price_per_unit, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
            `, [
                companyId,
                itemTitle,
                `High quality ${itemTitle} available for immediate pickup. Bulk discounts available.`,
                quantity,
                'Tons',
                category.type,
                price
            ]);
            if (i % 10 === 0) process.stdout.write('.');
        }

        console.log("\nSuccess: Added 20 companies and 80 varied listings.");

    } catch (err) {
        console.error("Error seeding listings:", err);
    } finally {
        await pool.end();
    }
}

seedListings();
