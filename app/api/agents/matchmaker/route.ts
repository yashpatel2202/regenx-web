import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const material = searchParams.get('material');

    if (!material) {
        return NextResponse.json({ success: false, error: 'Material parameter is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ success: false, error: "GEMINI_API_KEY is missing." }, { status: 500 });
    }

    try {
        // Fetch candidates (limit to recent 50 to fit context window comfortably for demo)
        const result = await pool.query(`
            SELECT l.id, l.title, l.description, l.quantity, l.unit, l.price_per_unit, c.name as company_name, c.industry_type 
            FROM listings l
            JOIN companies c ON l.company_id = c.id
            WHERE l.status = 'ACTIVE'
            ORDER BY l.created_at DESC
            LIMIT 50
        `);

        if (result.rows.length === 0) {
            return NextResponse.json({ success: true, matches: [] });
        }

        const candidates = result.rows.map(r => ({
            title: r.title,
            desc: r.description,
            qty: `${r.quantity} ${r.unit}`,
            seller: r.company_name,
            industry: r.industry_type,
            price: r.price_per_unit
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a B2B industrial matchmaker. 
            User Request: "Find suppliers for: ${material}"
            
            Available Listings (Candidates):
            ${JSON.stringify(candidates)}

            Task: Identify the top 5 matches from the candidates list that are relevant to the user's request. Semantically match (e.g. "Building material" can match "Steel").
            
            Return a JSON object:
            {
                "matches": [
                    {
                        "companyName": "Seller Name",
                        "industry": "Seller Industry",
                        "matchScore": 0.0 to 1.0,
                        "reason": "Why this is a good match",
                        "potentialRevenue": "$Price"
                    }
                ]
            }
            Return only valid JSON. If no matches found, return empty array.
        `;

        const aiResult = await model.generateContent(prompt);
        const text = aiResult.response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const aiResponse = JSON.parse(cleanedText);

        return NextResponse.json({
            success: true,
            matches: aiResponse.matches || []
        });

    } catch (error) {
        console.error("Matchmaker Error:", error);
        return NextResponse.json({ success: false, error: "Failed to find matches" }, { status: 500 });
    }
}
