import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    try {
        let queryText = 'SELECT * FROM products ORDER BY created_at DESC';
        let params: any[] = [];

        if (companyId) {
            queryText = 'SELECT * FROM products WHERE company_id = $1 ORDER BY created_at DESC';
            params = [companyId];
        }

        const result = await pool.query(queryText, params);

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
