import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const material = searchParams.get('material');

    if (!material) {
        return NextResponse.json({ success: false, error: 'Material parameter is required' }, { status: 400 });
    }

    // Mock Matchmaking Logic
    // Matches waste providers to potential consumers

    const matches = [
        {
            companyName: "EcoBuild Materials",
            industry: "Construction",
            matchScore: 0.9,
            reason: `High demand for ${material} in cement reinforcement.`,
            distance: "15 km",
            potentialRevenue: "$450/ton"
        },
        {
            companyName: "GreenEnergy Corp",
            industry: "Energy",
            matchScore: 0.85,
            reason: `Could utilize ${material} for biomass energy generation.`,
            distance: "40 km",
            potentialRevenue: "$300/ton"
        },
        {
            companyName: "PlastFix Inc.",
            industry: "Manufacturing",
            matchScore: 0.72,
            reason: "Uses similar raw compounds for packaging production.",
            distance: "12 km",
            potentialRevenue: "$400/ton"
        }
    ];

    return NextResponse.json({
        success: true,
        matches: matches
    });
}
