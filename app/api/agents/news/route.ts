import { NextResponse } from 'next/server';

export async function GET() {
    // Mock News/Social Agent
    // In a real app, this would fetch from an external News API or scrape RSS feeds

    const newsFeed = [
        {
            id: "1",
            title: "New Regulations for Industrial Waste 2024",
            summary: "The global council has released new guidelines for industrial by-product usage, incentivizing circular economy models.",
            source: "Global Eco News",
            category: "Regulation",
            timestamp: new Date().toISOString()
        },
        {
            id: "2",
            title: "TechGiant saves $1M using Scrap Metal",
            summary: "A leading tech manufacturer reports 40% cost reduction by sourcing raw materials from local waste exchanges.",
            source: "Industry Weekly",
            category: "Success Story",
            timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
            id: "3",
            title: "Innovative Biotech for Organic Waste",
            summary: "New enzyme discovery allows rapid composting of industrial organic sludge.",
            source: "BioTech Today",
            category: "Innovation",
            timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
    ];

    return NextResponse.json({
        success: true,
        feed: newsFeed
    });
}
