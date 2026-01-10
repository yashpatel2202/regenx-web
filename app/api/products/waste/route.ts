import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM workflow_waste_outputs WHERE product_id = $1 ORDER BY created_at DESC",
            [productId]
        );
        return NextResponse.json({ success: true, wasteStreams: result.rows });
    } catch (error) {
        console.error('Error fetching waste streams:', error);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { productId, wasteItems } = await request.json();

        if (!productId || !Array.isArray(wasteItems)) {
            return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const insertPromises = wasteItems.map(item => {
                return client.query(
                    `INSERT INTO workflow_waste_outputs (product_id, material_name, stage, estimated_quantity, confidence_score, status)
                     VALUES ($1, $2, $3, $4, $5, 'CATALOGUED')`,
                    [
                        productId,
                        item.material,
                        item.stage || 'General',
                        item.estimatedQuantity,
                        item.confidence || 0.0
                    ]
                );
            });

            await Promise.all(insertPromises);
            await client.query('COMMIT');

            return NextResponse.json({ success: true, message: 'Waste streams catalogued successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error saving waste streams:', error);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
}
