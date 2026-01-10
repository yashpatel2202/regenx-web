const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

const industries = [
    { type: 'Automotive', product: 'Car Chassis', waste: ['Steel Scraps', 'Paint Sludge', 'Hydraulic Oil'] },
    { type: 'Textile', product: 'Cotton Fabric', waste: ['Fabric Cutoffs', 'Dye Sludge', 'Wastewater'] },
    { type: 'Electronics', product: 'Circuit Boards', waste: ['Copper Trimmings', 'Plastic Resins', 'Acidic Waste'] },
    { type: 'Food Processing', product: 'Canned Vegetables', waste: ['Vegetable Peels', 'Wastewater', 'Metal Cuttings'] },
    { type: 'Construction', product: 'Cement Mix', waste: ['Concrete Dust', 'Aggregate Residue', 'Packaging Waste'] },
    { type: 'Medical', product: 'Pharmaceuticals', waste: ['Chemical Solvents', 'Glass Vials', 'Packaging'] },
    { type: 'Agriculture', product: 'Fertilizer', waste: ['Ammonia Runoff', 'Gypsum', 'Organic Sludge'] },
    { type: 'Energy', product: 'Solar Panels', waste: ['Silicon Dust', 'Broken Glass', 'Aluminum Scraps'] }
];

async function seedLargeDataset() {
    try {
        console.log("Starting large dataset seeding...");

        // Ensure Admin Company exists
        let companyRes = await pool.query("SELECT id FROM companies WHERE name = 'EcoBuild Materials'");
        let adminCompanyId;

        if (companyRes.rows.length === 0) {
            console.log("Admin company not found, running basic seed first...");
            // You might want to run the basic seed here if needed, but assuming basic seed ran or we create one
            const newComp = await pool.query("INSERT INTO companies (name, industry_type) VALUES ('EcoBuild Materials', 'Construction') RETURNING id");
            adminCompanyId = newComp.rows[0].id;
        } else {
            adminCompanyId = companyRes.rows[0].id;
        }

        const generatedProducts = [];

        // Generate 100 Products across different "virtual" departments or as part of the main company
        // For variety, let's create a few more dummy companies to spread them out?
        // Or just put them all under EcoBuild to fill the dashboard. Let's put them under EcoBuild for visibility in the assigned task.

        for (let i = 0; i < 100; i++) {
            const industry = industries[Math.floor(Math.random() * industries.length)];
            const productName = `${industry.type} Product Line ${Math.floor(Math.random() * 1000)}`;
            const workflowText = `Standard workflow for producing ${industry.product}. Involves heating, cutting, and assembly. Generates ${industry.waste.join(', ')}.`;

            const productRes = await pool.query(
                `INSERT INTO products (company_id, name, description, workflow_document_text) 
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [adminCompanyId, productName, `Batch #${i + 1} : ${industry.product}`, workflowText]
            );

            const productId = productRes.rows[0].id;

            // Add Waste Streams
            const wasteCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 waste items
            for (let j = 0; j < wasteCount; j++) {
                const wasteName = industry.waste[j % industry.waste.length];
                const stages = ['Processing', 'Finishing', 'Packaging', 'Quality Control'];
                const stage = stages[Math.floor(Math.random() * stages.length)];

                await pool.query(
                    `INSERT INTO workflow_waste_outputs (product_id, material_name, stage, estimated_quantity, confidence_score, status)
                     VALUES ($1, $2, $3, $4, $5, 'IDENTIFIED')`,
                    [
                        productId,
                        wasteName,
                        stage,
                        `${Math.floor(Math.random() * 500) + 10} kg/month`,
                        (Math.random() * 0.5 + 0.4).toFixed(2) // 0.4 to 0.9 confidence
                    ]
                );
            }

            if (i % 10 === 0) process.stdout.write('.');
        }

        console.log("\nSuccessfully added 100 products with waste streams.");

    } catch (err) {
        console.error("Error seeding large dataset:", err);
    } finally {
        await pool.end();
    }
}

seedLargeDataset();
