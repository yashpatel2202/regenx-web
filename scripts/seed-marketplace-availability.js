const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

async function seedMarketplace() {
    try {
        console.log("Seeding Rich Marketplace Data...");

        // Ensure we have a seller company
        let sellerId;
        const compRes = await pool.query("SELECT id FROM companies WHERE name = 'Global Suppliers Inc'");
        if (compRes.rows.length === 0) {
            const ins = await pool.query("INSERT INTO companies (name, industry_type) VALUES ('Global Suppliers Inc', 'General Manufacturing') RETURNING id");
            sellerId = ins.rows[0].id;
        } else {
            sellerId = compRes.rows[0].id;
        }

        // 1. Create a diverse set of listings (30 items)
        const inventory = [
            // Metals
            { title: "Scrap Copper Wire", type: "Metal", price: 600, unit: "Tons" },
            { title: "Aluminum Ingots", type: "Metal", price: 220, unit: "Tons" },
            { title: "High-Grade Steel Scrap", type: "Metal", price: 150, unit: "Tons" },
            { title: "Nickel Cathodes", type: "Metal", price: 1200, unit: "kg" },
            { title: "Zinc Plating Waste", type: "Metal", price: 80, unit: "kg" },

            // Chemicals
            { title: "Industrial Sulfuric Acid", type: "Chemical", price: 50, unit: "Barrels" },
            { title: "Acetone Solvent", type: "Chemical", price: 120, unit: "Liters" },
            { title: "Lithium Carbonate 99%", type: "Chemical", price: 3000, unit: "Tons" },
            { title: "Cobalt Oxide", type: "Chemical", price: 4500, unit: "kg" },
            { title: "Graphite Powder", type: "Chemical", price: 300, unit: "kg" },

            // Plastics & Rubber
            { title: "HDPE Plastic Pellets", type: "Plastic", price: 90, unit: "Tons" },
            { title: "Recycled PET Flakes", type: "Plastic", price: 75, unit: "Tons" },
            { title: "PVC Off-Cuts", type: "Plastic", price: 40, unit: "Tons" },
            { title: "Vulcanized Rubber Scraps", type: "Rubber", price: 200, unit: "Tons" },

            // Electronics
            { title: "E-Waste Circuit Boards", type: "Electronics", price: 500, unit: "kg" },
            { title: "Used Lithium-Ion Cells", type: "Electronics", price: 800, unit: "kg" },

            // Packaging
            { title: "Corrugated Cardboard Bales", type: "Paper", price: 30, unit: "Tons" },
            { title: "Industrial Pallets (Wood)", type: "Wood", price: 5, unit: "Each" },
            { title: "Glass Cullet (Mixed)", type: "Glass", price: 25, unit: "Tons" },
            { title: "Clear Glass Shards", type: "Glass", price: 45, unit: "Tons" },

            // Textiles
            { title: "Cotton Fabric Scraps", type: "Textile", price: 100, unit: "Bales" },
            { title: "Polyester Pre-Consumer Waste", type: "Textile", price: 80, unit: "Bales" },
            { title: "Denim Off-Cuts", type: "Textile", price: 150, unit: "Bales" },
            { title: "Wool Fibers", type: "Textile", price: 300, unit: "kg" },

            // Construction
            { title: "Crushed Concrete Aggregate", type: "Construction", price: 15, unit: "Tons" },
            { title: "Reclaimed Brick", type: "Construction", price: 0.50, unit: "Each" },
            { title: "Recovered Asphalt", type: "Construction", price: 20, unit: "Tons" },
            { title: "Insulation Foam Scraps", type: "Construction", price: 10, unit: "m3" },
            { title: "Gypsum Drywall Waste", type: "Construction", price: 12, unit: "Tons" },
            { title: "Ceramic Tile Broken", type: "Construction", price: 10, unit: "Tons" }
        ];

        console.log(`Seeding ${inventory.length} listings...`);

        for (const item of inventory) {
            // Check if exists to avoid dupes logic omitted for speed, just insert
            await pool.query(`
                INSERT INTO listings (company_id, title, description, quantity, unit, type, price_per_unit, status)
                VALUES ($1, $2, 'High quality certified waste stream available for circular economy use.', 100, $3, $4, $5, 'ACTIVE')
            `, [sellerId, item.title, item.unit, item.type, item.price]);
        }

        console.log("Seeding complete. Creating demo product for 'Buyer'...");

        // Create a product for the default user (assuming user id from seed-users-orders.js or we pick one)
        // We'll attach it to the first company that ISN'T the seller
        const buyerCompRes = await pool.query("SELECT id FROM companies WHERE id != $1 LIMIT 1", [sellerId]);
        if (buyerCompRes.rows.length > 0) {
            const buyerId = buyerCompRes.rows[0].id;

            // Create "Eco-Battery Pack"
            const prodRes = await pool.query(`
                INSERT INTO products (company_id, name, description, workflow_document_text)
                VALUES ($1, 'Eco-Battery Pack Assembly', 'Assembly of lithium-ion battery packs for EVs.', 'Process requires Lithium Carbonate, Cobalt Oxide, and Graphite components.')
                RETURNING id
            `, [buyerId]);

            const pid = prodRes.rows[0].id;

            // Add components that MATCH the seeded data
            await pool.query("INSERT INTO product_components (product_id, material_name) VALUES ($1, 'Lithium Carbonate')", [pid]);
            await pool.query("INSERT INTO product_components (product_id, material_name) VALUES ($1, 'Cobalt Oxide')", [pid]);
            await pool.query("INSERT INTO product_components (product_id, material_name) VALUES ($1, 'Graphite Powder')", [pid]);

            console.log("Created target product for matching demonstration.");
        }

        console.log("Seeding Finished Successfully.");

    } catch (err) {
        console.error("Seeding Error:", err);
    } finally {
        await pool.end();
    }
}

seedMarketplace();
