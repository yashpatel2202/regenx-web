import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
        }

        // In a real app, use bcrypt to compare hashes. For this prototype, we use plain text matching against 'password_hash' column.
        // WARNING: NOT FOR PRODUCTION
        const result = await pool.query(
            'SELECT u.id, u.name, u.email, u.company_id, c.name as company_name FROM users u JOIN companies c ON u.company_id = c.id WHERE email = $1 AND password_hash = $2',
            [email, password]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        const user = result.rows[0];

        // In a real app, set a HttpOnly cookie with JWT here.
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                companyId: user.company_id,
                companyName: user.company_name
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
