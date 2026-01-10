import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    const client = await pool.connect();

    try {
        const { companyName, industryType, description, address, userName, email, password } = await request.json();

        // Start Transaction
        await client.query('BEGIN');

        // 1. Create Company
        const companyRes = await client.query(
            'INSERT INTO companies (name, industry_type, description, address) VALUES ($1, $2, $3, $4) RETURNING id',
            [companyName, industryType, description, address]
        );
        const companyId = companyRes.rows[0].id;

        // 2. Create User linked to Company
        const userRes = await client.query(
            'INSERT INTO users (name, email, password_hash, company_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
            [userName, email, password, companyId] // password should be hashed in production
        );
        const user = userRes.rows[0];

        // Commit Transaction
        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                companyId: companyId,
                companyName: companyName
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration Error:', error);
        return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
    } finally {
        client.release();
    }
}
