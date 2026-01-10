const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

async function seedWorkflows() {
    try {
        console.log("Seeding Product Workflows...");

        // 1. Get Company IDs
        const buyerRes = await pool.query("SELECT id, company_id FROM users WHERE email = 'buyer@regenx.com'");
        const sellerRes = await pool.query("SELECT id, company_id FROM users WHERE email = 'seller@greenworks.com'");

        if (buyerRes.rows.length === 0 || sellerRes.rows.length === 0) {
            console.error("Users not found. Please run seed-users-orders.js first.");
            return;
        }

        const regenX = { userId: buyerRes.rows[0].id, companyId: buyerRes.rows[0].company_id };
        const greenWorks = { userId: sellerRes.rows[0].id, companyId: sellerRes.rows[0].company_id };

        // 2. Add Workflow for RegenX Logistics (Fleet Maintenance)
        const wf1 = await createWorkflow(
            regenX.companyId,
            "Fleet Maintenance Protocol",
            "Routine maintenance of logistics fleet including tire rotation, oil changes, and brake replacements. Generates significant rubber and hazardous liquid waste."
        );
        console.log("Added Workflow for RegenX: Fleet Maintenance Protocol");

        await addWaste(wf1.id, "Used Truck Tires", "Assessment Stage", "500 Units/Month", 0.95, "CATALOGUED");
        await addWaste(wf1.id, "Spent Motor Oil", "Drainage", "200 Gallons", 0.98, "CATALOGUED");
        await addWaste(wf1.id, "Scrap Brake Pads", "Replacement", "50 kg", 0.85, "IDENTIFIED");


        // 3. Add Workflow for GreenWorks (Plastic Sorting)
        const wf2 = await createWorkflow(
            greenWorks.companyId,
            "HDPE Sorting Line",
            "Automated sorting of mixed plastic waste to isolate High-Density Polyethylene. Process involves washing, shredding, and separation."
        );
        console.log("Added Workflow for GreenWorks: HDPE Sorting Line");

        await addWaste(wf2.id, "Mixed Plastic Fines", "Shredding", "2 Tons/Day", 0.92, "CATALOGUED");
        await addWaste(wf2.id, "Wastewater Sludge", "Washing", "5000 Gallons", 0.88, "IDENTIFIED");
        await addWaste(wf2.id, "Non-HDPE Reject Stream", "Optical Sorting", "1.5 Tons/Day", 0.99, "LISTED");

        console.log("\nSuccess: Added workflows and waste outputs for both users.");

    } catch (err) {
        console.error("Seeding Failed:", err);
    } finally {
        await pool.end();
    }
}

async function createWorkflow(companyId, name, text) {
    const res = await pool.query(`
        INSERT INTO products (company_id, name, description, workflow_document_text)
        VALUES ($1, $2, $3, $3)
        RETURNING id
    `, [companyId, name, text]);
    return res.rows[0];
}

async function addWaste(productId, name, stage, qty, confidence, status) {
    await pool.query(`
        INSERT INTO workflow_waste_outputs (product_id, material_name, stage, estimated_quantity, confidence_score, status)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [productId, name, stage, qty, confidence, status]);
}

seedWorkflows();
