import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const result = await pool.query(`
      SELECT l.id, l.company_id, l.title, l.quantity, l.unit, l.price_per_unit, l.type, c.name as seller_name 
      FROM listings l
      JOIN companies c ON l.company_id = c.id
      WHERE l.status = 'ACTIVE'
      ORDER BY l.created_at DESC
    `);

        const formattedListings = result.rows.map(l => ({
            id: l.id,
            companyId: l.company_id, // Expose company ID for frontend check
            title: l.title,
            quantity: `${l.quantity} ${l.unit}`,
            price: `₹${l.price_per_unit}/${l.unit}`, // map snake_case from DB
            seller: l.seller_name,
            type: l.type,
            raw_quantity: l.quantity,
            raw_price: l.price_per_unit
        }));

        return NextResponse.json({ success: true, listings: formattedListings });
    } catch (error) {
        console.error("Listings GET Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch listings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        let companyId = body.companyId;

        if (!companyId) {
            // Fallback for testing if no companyId provided
            const companyRes = await pool.query('SELECT id FROM companies LIMIT 1');
            if (companyRes.rows.length === 0) {
                return NextResponse.json({ success: false, error: "No company found to link listing" }, { status: 400 });
            }
            companyId = companyRes.rows[0].id;
        }

        const result = await pool.query(`
            INSERT INTO listings (company_id, title, description, quantity, unit, type, price_per_unit, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
            RETURNING *
        `, [
            companyId,
            body.title,
            body.description,
            parseFloat(body.quantity),
            body.unit,
            body.type,
            parseFloat(body.price)
        ]);

        return NextResponse.json({ success: true, listing: result.rows[0] });
    } catch (error) {
        console.error("Create Listing Error", error);
        return NextResponse.json({ success: false, error: "Failed to create listing" }, { status: 500 });
    }
}
