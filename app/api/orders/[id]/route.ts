import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    try {
        const body = await request.json();
        const { status } = body; // 'APPROVED', 'REJECTED'

        const result = await pool.query(`
            UPDATE orders 
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, order: result.rows[0] });
    } catch (error) {
        console.error("Update Order Error:", error);
        return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
    }
}
