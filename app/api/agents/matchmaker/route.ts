import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const material = searchParams.get('material');

    if (!material) {
        return NextResponse.json({ success: false, error: 'Material parameter is required' }, { status: 400 });
    }

    try {
        // SQL Query with basic keyword matching using ILIKE
        const result = await pool.query(`
        SELECT l.*, c.name as company_name, c.industry_type 
        FROM listings l
        JOIN companies c ON l.company_id = c.id
        WHERE l.type ILIKE $1 OR l.title ILIKE $1 OR l.description ILIKE $1
    `, [` % ${material}% `]); // query with wildcards for 'contains' logic

        const matches = result.rows.map(listing => ({
            companyName: listing.company_name,
            industry: listing.industry_type,
            matchScore: 0.85 + (Math.random() * 0.1),
            reason: `Available: ${listing.quantity} ${listing.unit} of ${listing.title} `,
            distance: "Local",
            potentialRevenue: `$${listing.price_per_unit}/${listing.unit}`
        }));

        return NextResponse.json({
            success: true,
            matches: matches
        });
    } catch (error) {
        console.error("Matchmaker Error:", error);
        return NextResponse.json({ success: false, error: "Failed to find matches" }, { status: 500 });
    }
}
