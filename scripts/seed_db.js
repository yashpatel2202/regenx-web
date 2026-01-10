
const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'regenx',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

const COMPANIES = [
    { name: "AutoMotive Works", industry: "Automotive", desc: "Leading manufacturer of car parts.", address: "123 Auto Dr, Detroit, MI" },
    { name: "GreenBuild Materials", industry: "Construction", desc: "Sustainable construction materials.", address: "456 Concrete Ln, Austin, TX" },
    { name: "TechGadgets Inc", industry: "Electronics", desc: "Consumer electronics assembly.", address: "789 Silicon Way, San Jose, CA" },
    { name: "AgriOrganic Foods", industry: "Agriculture", desc: "Organic food processing.", address: "101 Farm Rd, Fresno, CA" },
    { name: "ChemSafe Solutions", industry: "Chemical", desc: "Industrial chemical solutions.", address: "202 Lab St, Houston, TX" }
];

const USERS = [
    { name: "John Doe", email: "john@automotive.com", password: "password123" },
    { name: "Jane Smith", email: "jane@greenbuild.com", password: "password123" },
    { name: "Bob Tech", email: "bob@techgadgets.com", password: "password123" },
    { name: "Alice Farm", email: "alice@agriorganic.com", password: "password123" },
    { name: "Eve Chem", email: "eve@chemsafe.com", password: "password123" }
];

const PRODUCTS = [
    {
        companyIdx: 0, // AutoMotive
        name: "Car Bumper Manufacturing",
        desc: "Injection molding process for car bumpers.",
        workflow: "1. Plastic pellets (Polypropylene) are melted. 2. Injected into molds. 3. Cooled and trimmed. 4. Painted and polished.",
        wastes: [
            { name: "Plastic Trimmings", qty: "500 Kg", stage: "Trimming", status: "Identified" },
            { name: "Scrap Paint", qty: "50 Liters", stage: "Painting", status: "Identified" }
        ],
        components: [
            { name: "Polypropylene Pellets", qty: "2000 Kg" },
            { name: "Industrial Paint", qty: "200 Liters" }
        ]
    },
    {
        companyIdx: 2, // TechGadgets
        name: "Circuit Board Assembly",
        desc: "PCB populating and soldering.",
        workflow: "1. Raw PCB boards prepared. 2. Components placed by machine. 3. Wave soldering. 4. Testing and cutting excess wire.",
        wastes: [
            { name: "Copper Wire Scraps", qty: "200 Kg", stage: "Trimming", status: "Identified" },
            { name: "Defective PCBs", qty: "50 Units", stage: "Testing", status: "Identified" }
        ],
        components: [
            { name: "Copper Wire", qty: "1000 m" },
            { name: "Solder Flux", qty: "50 Kg" }
        ]
    }
];

const LISTINGS = [
    {
        companyIdx: 0, // AutoMotive
        title: "Plastic Trimmings (PP)",
        qty: 500,
        unit: "Kg",
        price: 20, // 20 rupees
        type: "Plastic",
        desc: "Clean polypropylene trimmings from bumper manufacturing."
    },
    {
        companyIdx: 2, // TechGadgets
        title: "Copper Wire Scraps",
        qty: 200,
        unit: "Kg",
        price: 450, // 450 rupees
        type: "Metal",
        desc: "High grade copper wire clippings."
    },
    {
        companyIdx: 1, // GreenBuild
        title: "Concrete Aggregate Dust",
        qty: 1000,
        unit: "Kg",
        price: 5,
        type: "Construction",
        desc: "Fine dust suitable for filler."
    },
    {
        companyIdx: 4, // ChemSafe
        title: "Spent Acetone Solvent",
        qty: 100,
        unit: "Liters",
        price: 150,
        type: "Chemical",
        desc: "Used acetone, 90% purity remains."
    }
];

// Orders: BuyerIdx, ListingIdx
const ORDERS = [
    { buyerIdx: 1, listingIdx: 0, qty: 100, price: 20, status: "APPROVED" }, // GreenBuild buys Plastic
    { buyerIdx: 2, listingIdx: 3, qty: 50, price: 150, status: "PENDING" }, // TechGadgets buys Chemical
];

async function seed() {
    const client = await pool.connect();
    try {
        console.log("Cleaning DB...");
        await client.query("TRUNCATE TABLE orders, listings, workflow_waste_outputs, product_components, products, users, companies RESTART IDENTITY CASCADE");

        const companyIds = [];
        const userIds = [];
        const listingIds = [];

        console.log("Seeding Companies...");
        for (const c of COMPANIES) {
            const res = await client.query(
                "INSERT INTO companies (id, name, industry_type, description, address, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id",
                [crypto.randomUUID(), c.name, c.industry, c.desc, c.address]
            );
            companyIds.push(res.rows[0].id);
        }

        console.log("Seeding Users...");
        for (let i = 0; i < USERS.length; i++) {
            const u = USERS[i];
            const cid = companyIds[i]; // match 1-to-1
            const res = await client.query(
                "INSERT INTO users (id, email, password_hash, name, company_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id",
                [crypto.randomUUID(), u.email, u.password, u.name, cid]
            );
            userIds.push(res.rows[0].id);
        }

        console.log("Seeding Products...");
        for (const p of PRODUCTS) {
            const cid = companyIds[p.companyIdx];
            const pid = crypto.randomUUID();
            await client.query(
                "INSERT INTO products (id, company_id, name, description, workflow_document_text, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
                [pid, cid, p.name, p.desc, p.workflow]
            );

            for (const w of p.wastes) {
                await client.query(
                    "INSERT INTO workflow_waste_outputs (id, product_id, material_name, stage, estimated_quantity, confidence_score, status, created_at) VALUES ($1, $2, $3, $4, $5, 0.95, $6, NOW())",
                    [crypto.randomUUID(), pid, w.name, w.stage, w.qty, w.status]
                );
            }

            // Check if product_components table allows inserting these
            for (const c of p.components) {
                // Assuming schema is similar
                await client.query(
                    "INSERT INTO product_components (id, product_id, material_name, estimated_quantity, created_at) VALUES ($1, $2, $3, $4, NOW())",
                    [crypto.randomUUID(), pid, c.name, c.qty]
                );
            }
        }

        console.log("Seeding Listings...");
        for (const l of LISTINGS) {
            const cid = companyIds[l.companyIdx];
            const lid = crypto.randomUUID();
            await client.query(
                "INSERT INTO listings (id, company_id, title, description, quantity, unit, price_per_unit, type, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', NOW())",
                [lid, cid, l.title, l.desc, l.qty, l.unit, l.price, l.type]
            );
            listingIds.push({ id: lid, price: l.price, title: l.title });
        }

        console.log("Seeding Orders...");
        for (const o of ORDERS) {
            const buyerCid = companyIds[o.buyerIdx];
            const listing = listingIds[o.listingIdx];
            const total = o.qty * listing.price;
            await client.query(
                "INSERT INTO orders (id, listing_id, buyer_company_id, quantity, total_price, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
                [crypto.randomUUID(), listing.id, buyerCid, o.qty, total, o.status]
            );
        }

        console.log("Done! Users created:");
        USERS.forEach((u, i) => console.log(`${u.email} / password123 (Company: ${COMPANIES[i].name})`));

    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
