import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
    try {
        // 1. Fetch Real-time RSS
        const RSS_URL = "https://news.google.com/rss/search?q=waste+management+recycling+innovation+circular+economy&hl=en-US&gl=US&ceid=US:en";
        const response = await fetch(RSS_URL);
        const xmlText = await response.text();

        // 2. Parse RSS (Simple Regex)
        const items: any[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(xmlText)) !== null) {
            const content = match[1];
            const titleMatch = /<title>(.*?)<\/title>/.exec(content);
            const linkMatch = /<link>(.*?)<\/link>/.exec(content);
            const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(content);

            if (titleMatch && linkMatch) {
                items.push({
                    title: titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, ""),
                    link: linkMatch[1],
                    pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
                });
            }
            if (items.length >= 10) break;
        }

        const client = await pool.connect();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

        try {
            await client.query('BEGIN');

            const processedItems = [];

            for (const item of items) {
                // Check if exists
                const existing = await client.query('SELECT * FROM feed_items WHERE source_url = $1', [item.link]);

                if (existing.rows.length > 0) {
                    processedItems.push(existing.rows[0]);
                    continue;
                }

                // Simple Keyword Categorization (No AI)
                let category = "General";
                const t = item.title.toLowerCase();
                if (t.includes("innovation") || t.includes("tech") || t.includes("startups") || t.includes("new")) category = "Innovation";
                else if (t.includes("law") || t.includes("policy") || t.includes("regulation") || t.includes("government")) category = "Regulation";
                else if (t.includes("market") || t.includes("price") || t.includes("demand") || t.includes("supply")) category = "Market";
                else if (t.includes("hazard") || t.includes("toxic") || t.includes("spill") || t.includes("risk")) category = "Hazard";

                const insertRes = await client.query(`
                    INSERT INTO feed_items (title, content, summary, source_url, category, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                `, [item.title, item.title, item.title, item.link, category, new Date(item.pubDate)]);

                processedItems.push(insertRes.rows[0]);
            }

            await client.query('COMMIT');

            // Sort by date desc
            processedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return NextResponse.json({
                success: true,
                feed: processedItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    summary: item.summary,
                    source: "Google News",
                    category: item.category,
                    timestamp: item.created_at
                }))
            });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error("News Fetch Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch news" }, { status: 500 });
    }
}
