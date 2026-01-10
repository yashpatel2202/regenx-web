import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { productId, components } = await request.json();

        if (!productId || !components || !Array.isArray(components)) {
            return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
        }

        // Insert each component
        const inserted = [];
        for (const comp of components) {
            const res = await pool.query(`
                INSERT INTO product_components (product_id, material_name, estimated_quantity)
                VALUES ($1, $2, $3)
                RETURNING *
            `, [productId, comp.material, comp.estimatedQuantity]);
            inserted.push(res.rows[0]);
        }

        return NextResponse.json({ success: true, components: inserted });

    } catch (error) {
        console.error("Save Components Error:", error);
        return NextResponse.json({ success: false, error: "Failed to save components" }, { status: 500 });
    }
}
