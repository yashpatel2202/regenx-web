import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { workflowDescription } = await request.json();

    // Mock AI Logic: Simple keyword extraction to identify potential waste
    // In a real scenario, this would call an LLM.

    const potentialWaste = [];
    const descriptionLower = workflowDescription.toLowerCase();

    if (descriptionLower.includes('metal') || descriptionLower.includes('steel')) {
      potentialWaste.push({
        material: 'Scrap Metal',
        confidence: 0.95,
        estimatedQuantity: '100-500 kg/month',
        stage: 'Cutting / Fabrication',
        suggestedUses: ['Construction Support', 'Recycling'],
      });
    }

    if (descriptionLower.includes('plastic') || descriptionLower.includes('packaging')) {
      potentialWaste.push({
        material: 'Plastic Extracts',
        confidence: 0.88,
        estimatedQuantity: '50-200 kg/month',
        stage: 'Sorting line',
        suggestedUses: ['Plastic Pellets', 'Insulation'],
      });
    }

    if (descriptionLower.includes('organic') || descriptionLower.includes('food')) {
      potentialWaste.push({
        material: 'Organic Compost',
        confidence: 0.92,
        estimatedQuantity: '200-1000 kg/month',
        stage: 'Decomposition',
        suggestedUses: ['Fertilizer', 'Biogas'],
      });
    }

    if (potentialWaste.length === 0) {
      // Default fallback
      potentialWaste.push({
        material: 'General Industrial Waste',
        confidence: 0.5,
        estimatedQuantity: 'Variable',
        stage: 'Final Assembly',
        suggestedUses: ['Energy Recovery'],
      });
    }

    return NextResponse.json({
      success: true,
      analysis: {
        identifiedWaste: potentialWaste,
        efficiencyScore: 78, // Mocked score
        optimizationSuggestions: "Consider separating liquid waste to improve recyclability."
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to parse workflow' },
      { status: 500 }
    );
  }
}
