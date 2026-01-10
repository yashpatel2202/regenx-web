import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const productId = searchParams.get('productId');

    try {
        let queryText = 'SELECT * FROM products ORDER BY created_at DESC';
        let params: any[] = [];

        if (productId) {
            queryText = 'SELECT * FROM products WHERE id = $1';
            params = [productId];
        } else if (companyId) {
            queryText = 'SELECT * FROM products WHERE company_id = $1 ORDER BY created_at DESC';
            params = [companyId];
        }

        const result = await pool.query(queryText, params);

        // If specific product requested, enrich with details
        if (productId && result.rows.length > 0) {
            const product = result.rows[0];

            // Get components
            const compRes = await pool.query("SELECT * FROM product_components WHERE product_id = $1", [product.id]);
            const components = compRes.rows;

            // Check marketplace matches
            let matchCount = 0;
            const componentMatches: any[] = [];

            for (const comp of components) {
                const listingsRes = await pool.query(`
                    SELECT l.id, l.title, l.price_per_unit, l.unit, c.name as seller_name
                    FROM listings l
                    JOIN companies c ON l.company_id = c.id
                    WHERE l.status = 'ACTIVE' 
                    AND l.title ILIKE $1 
                    LIMIT 5
                 `, [comp.material_name]);

                if (listingsRes.rows.length > 0) {
                    matchCount++;
                    componentMatches.push({
                        componentName: comp.material_name,
                        availableListings: listingsRes.rows
                    });
                }
            }

            return NextResponse.json({
                success: true,
                product: {
                    ...product,
                    components,
                    matchCount,
                    componentMatches
                }
            });
        }

        return NextResponse.json({ success: true, products: result.rows });
    } catch (error) {
        console.error("Products GET Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { companyId, name, description, workflowText } = await request.json();

        if (!companyId || !name || !workflowText) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const result = await pool.query(`
        INSERT INTO products (company_id, name, description, workflow_document_text)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [companyId, name, description, workflowText]);

        return NextResponse.json({ success: true, product: result.rows[0] });

    } catch (error) {
        console.error("Product Create Error:", error);
        return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
    }
}
