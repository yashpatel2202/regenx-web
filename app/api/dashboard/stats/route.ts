import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        return NextResponse.json({ success: false, error: "Missing companyId" }, { status: 400 });
    }

    try {
        const client = await pool.connect();
        try {
            // 1. Revenue (Sales)
            const revenueRes = await client.query(`
                SELECT SUM(o.total_price) as total 
                FROM orders o 
                JOIN listings l ON o.listing_id = l.id 
                WHERE l.company_id = $1
            `, [companyId]);
            const revenue = parseFloat(revenueRes.rows[0].total || '0');

            // 2. Waste Streams Found
            const wasteRes = await client.query(`
                SELECT COUNT(*) as count 
                FROM workflow_waste_outputs w 
                JOIN products p ON w.product_id = p.id 
                WHERE p.company_id = $1
            `, [companyId]);
            const wasteCount = parseInt(wasteRes.rows[0].count || '0');

            // 3. Active Listings
            const listingsRes = await client.query(`
                SELECT COUNT(*) as count 
                FROM listings 
                WHERE company_id = $1 AND status = 'ACTIVE'
            `, [companyId]);
            const activeListings = parseInt(listingsRes.rows[0].count || '0');

            // 4. CO2 Estimation (Now Calculated via AI below)
            let co2Offset = 0; // Initialize for scope access


            // 5. Recent Activity
            const salesRes = await client.query(`
                SELECT 'sale' as type, o.created_at, l.title, c.name as party_name, o.quantity, l.unit, l.description
                FROM orders o 
                JOIN listings l ON o.listing_id = l.id
                JOIN companies c ON o.buyer_company_id = c.id
                WHERE l.company_id = $1 
                ORDER BY o.created_at DESC LIMIT 5
            `, [companyId]);

            const purchasesRes = await client.query(`
                SELECT 'purchase' as type, o.created_at, l.title, c.name as party_name
                FROM orders o 
                JOIN listings l ON o.listing_id = l.id
                JOIN companies c ON l.company_id = c.id
                WHERE o.buyer_company_id = $1
                ORDER BY o.created_at DESC LIMIT 5
            `, [companyId]);

            const wasteActivityRes = await client.query(`
                SELECT 'waste' as type, w.created_at, w.material_name as title, p.name as party_name
                FROM workflow_waste_outputs w
                JOIN products p ON w.product_id = p.id
                WHERE p.company_id = $1
                ORDER BY w.created_at DESC LIMIT 5
            `, [companyId]);

            const activities = [
                ...salesRes.rows.map(r => ({ ...r, text: `Sold ${r.title} to ${r.party_name}` })),
                ...purchasesRes.rows.map(r => ({ ...r, text: `Purchased ${r.title} from ${r.party_name}` })),
                ...wasteActivityRes.rows.map(r => ({ ...r, text: `Identified ${r.title} in ${r.party_name}` }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5);


            // 6. AI-Powered Insight
            let insight = "";


            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
                const prompt = `
                You are the sustainability engine for ReGenX.
                Generate a single sentence daily specific sustainability insight/tip for the dashboard.
                Context:
                - Active Listings: ${activeListings}
                - Identified Waste Streams: ${wasteCount}
                - Revenue: $${revenue}
                
                Return JSON format:
                {
                    "insight": "string"
                }
                `;

                const result = await model.generateContent(prompt);
                const aiResponse = JSON.parse(result.response.text());

                insight = aiResponse.insight;

            } catch (e) {
                console.error("AI Insight failed", e);
                insight = "Keep optimizing your workflow to find more value in your waste streams.";
            }

            return NextResponse.json({
                success: true,
                stats: {
                    revenue,
                    wasteCount,
                    activeListings,
                    co2Offset,
                    activities,
                    insight
                }
            });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
    }
}
