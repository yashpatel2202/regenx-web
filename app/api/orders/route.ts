import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'buying' or 'selling'
    const companyId = searchParams.get('companyId');

    if (!companyId || !type) {
        return NextResponse.json({ success: false, error: "Missing type or companyId" }, { status: 400 });
    }

    try {
        let query = '';
        let params = [companyId];

        if (type === 'buying') {
            // My Orders: Orders primarily where I am the buyer
            // Join listings to get title and unit, Join companies (seller) to get seller name
            query = `
                SELECT o.*, l.title as listing_title, l.unit, c.name as seller_name 
                FROM orders o
                JOIN listings l ON o.listing_id = l.id
                JOIN companies c ON l.company_id = c.id
                WHERE o.buyer_company_id = $1
                ORDER BY o.created_at DESC
            `;
        } else if (type === 'selling') {
            // Incoming Requests: Orders where I am the seller (via listing)
            // Join listings to filter by MY company (as seller), Join companies (buyer) to get buyer name
            query = `
                SELECT o.*, l.title as listing_title, l.unit, c.name as buyer_name
                FROM orders o
                JOIN listings l ON o.listing_id = l.id
                JOIN companies c ON o.buyer_company_id = c.id
                WHERE l.company_id = $1
                ORDER BY o.created_at DESC
            `;
        } else {
            return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
        }

        const result = await pool.query(query, params);
        return NextResponse.json({ success: true, orders: result.rows });

    } catch (error) {
        console.error("Orders GET Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { listingId, buyerCompanyId, quantity, totalPrice } = body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                INSERT INTO orders (listing_id, buyer_company_id, quantity, total_price, status)
                VALUES ($1, $2, $3, $4, 'PENDING')
                RETURNING *
            `, [listingId, buyerCompanyId, quantity, totalPrice]);

            // Update listing status to SOLD so it disappears from marketplace
            await client.query(`
                UPDATE listings SET status = 'SOLD' WHERE id = $1
            `, [listingId]);

            await client.query('COMMIT');
            return NextResponse.json({ success: true, order: result.rows[0] });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Create Order Error:", error);
        return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
    }
}
