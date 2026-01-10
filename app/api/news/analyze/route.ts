import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const { newsId, companyId } = await request.json();

        if (!newsId || !companyId) {
            return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            // 1. Get News
            const newsRes = await client.query('SELECT * FROM feed_items WHERE id = $1', [newsId]);
            if (newsRes.rows.length === 0) {
                return NextResponse.json({ success: false, error: "News item not found" }, { status: 404 });
            }
            const newsItem = newsRes.rows[0];

            // 2. Get User Waste
            const wasteRes = await client.query(`
                SELECT w.material_name, p.name as product_name
                FROM workflow_waste_outputs w
                JOIN products p ON w.product_id = p.id
                WHERE p.company_id = $1
            `, [companyId]);

            const userWasteContext = wasteRes.rows.map(w => `${w.material_name}`).join(", ");

            // 3. AI Analysis
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

            const prompt = `
                Analyze this industrial news:
                Title: "${newsItem.title}"
                Link: "${newsItem.source_url}"
                
                My Factory Waste Streams: [${userWasteContext || "None currently"}]

                Tasks:
                1. Summarize the news in 2 sentences for a factory owner.
                2. Provide 3 bullet-point "Actionable Solutions" or takeaways.
                3. Match: Look at my waste streams. If this news is relevant to any of them (e.g. news about plastic recycling -> I have plastic scrap), create a match recommendation.

                Return JSON:
                {
                    "summary": "string",
                    "solutions": ["string", "string", "string"],
                    "matches": [
                        { "waste_name": "string (from my list)", "suggestion": "string" }
                    ]
                }
            `;

            const result = await model.generateContent(prompt);
            const analysis = JSON.parse(result.response.text());

            return NextResponse.json({
                success: true,
                news: newsItem,
                analysis
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ success: false, error: "Failed to analyze" }, { status: 500 });
    }
}
