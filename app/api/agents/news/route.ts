import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const result = await pool.query(`
        SELECT * FROM feed_items ORDER BY created_at DESC LIMIT 10
    `);

        const formattedFeed = result.rows.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.summary || item.content.substring(0, 100) + '...',
            source: "ReGenX Network",
            category: item.category,
            timestamp: new Date(item.created_at).toISOString() // Ensure date format
        }));

        return NextResponse.json({
            success: true,
            feed: formattedFeed
        });
    } catch (error) {
        console.error("Feed Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch news" }, { status: 500 });
    }
}
