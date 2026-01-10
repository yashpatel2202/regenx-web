const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

async function fixDemoWasteStreams() {
    try {
        console.log("Fixing Waste Streams for Demo Product...");

        // 1. Find the Demo Product
        const res = await pool.query("SELECT id FROM products WHERE name = 'Eco-Battery Pack Assembly'");

        if (res.rows.length === 0) {
            console.log("Demo product not found. Run seed-marketplace-availability.js first.");
            return;
        }

        const pid = res.rows[0].id;

        // 2. Insert Waste Streams
        const wasteItems = [
            { material: "Chemical Slurry", stage: "Coating", qty: "50 L/batch", conf: 0.95 },
            { material: "Copper Off-cuts", stage: "Assembly", qty: "20 kg/batch", conf: 0.88 },
            { material: "Plastic Packaging Waste", stage: "Packaging", qty: "10 kg/batch", conf: 0.92 }
        ];

        for (const item of wasteItems) {
            await pool.query(`
                INSERT INTO workflow_waste_outputs (product_id, material_name, stage, estimated_quantity, confidence_score, status)
                VALUES ($1, $2, $3, $4, $5, 'IDENTIFIED')
            `, [pid, item.material, item.stage, item.qty, item.conf]);
        }

        console.log(`Added ${wasteItems.length} waste streams to demo product.`);

    } catch (err) {
        console.error("Fix Error:", err);
    } finally {
        await pool.end();
    }
}

fixDemoWasteStreams();
