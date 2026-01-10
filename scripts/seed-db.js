const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

async function seedDb() {
    try {
        console.log("Seeding database...");

        // Clear existing data
        await pool.query('DELETE FROM listings');
        await pool.query('DELETE FROM companies');
        await pool.query('DELETE FROM feed_items');

        // Create Companies
        const companyRes = await pool.query(`
            INSERT INTO companies (name, industry_type, description, address)
            VALUES 
                ('EcoBuild Materials', 'Construction', 'Sustainable construction materials manufacturer.', '123 Builder Lane'),
                ('MetalWorks Industries', 'Manufacturing', 'Large scale metal fabrication.', '456 Steel St'),
                ('GreenEnergy Corp', 'Energy', 'Biomass and waste-to-energy.', '789 Power Ave')
            RETURNING id, name;
        `);

        const companies = companyRes.rows;
        const compEco = companies.find(c => c.name === 'EcoBuild Materials');
        const compMetal = companies.find(c => c.name === 'MetalWorks Industries');
        const compGreen = companies.find(c => c.name === 'GreenEnergy Corp');

        // Create Users
        await pool.query(`
            INSERT INTO users (email, password_hash, name, company_id)
            VALUES 
                ('admin@ecobuild.com', 'password', 'Admin User', $1),
                ('manager@metalworks.com', 'password', 'Manager', $2)
        `, [compEco.id, compMetal.id]);

        // Create Products (Workflows)
        const productRes = await pool.query(`
            INSERT INTO products (company_id, name, description, workflow_document_text)
            VALUES 
                ($1, 'Steel Pipes Manufacturing', 'Process of cutting and welding steel pipes.', 'Raw steel enters, cut to size. Metal scraps generated. Welding uses argon gas.'),
                ($2, 'Concrete Blocks', 'Mixing cement and aggregates.', 'Cement mixed with crushed stone. Molds used. Excess rubble generated.')
            RETURNING id, name;
        `, [compMetal.id, compEco.id]);

        // Create Listings
        await pool.query(`
            INSERT INTO listings (company_id, title, description, quantity, unit, type, price_per_unit, status)
            VALUES 
                ($1, 'Industrial Steel Scraps', 'High grade steel off-cuts.', 500, 'Tons', 'Metal', 200, 'ACTIVE'),
                ($2, 'Concrete Rubble', 'Crushed concrete for road base.', 1000, 'Tons', 'Construction', 15, 'ACTIVE'),
                ($3, 'Wood Chips', 'Bio-fuel ready wood chips.', 300, 'Tons', 'Organic', 45, 'ACTIVE')
        `, [compMetal.id, compEco.id, compGreen.id]);

        // Create Feed Items
        await pool.query(`
            INSERT INTO feed_items (title, content, summary, source_url, category)
            VALUES 
                ('New Regulations 2024', 'Global council released guidelines for waste.', 'New guidelines released.', 'https://example.com/1', 'Regulation'),
                ('TechGiant saves $1M', 'Leading tech manufacturer reduces costs via waste exchange.', 'Tech giant saves millions.', 'https://example.com/2', 'Success Story'),
                ('Innovative Biotech', 'Enzyme discovery for organic sludge.', 'Enzyme accelerates composting.', 'https://example.com/3', 'Innovation')
        `);

        console.log("Seeding finished.");
    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        await pool.end();
    }
}

seedDb();
