import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { workflowDescription } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set.");
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY is missing in server environment." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert industrial waste auditor. Analyze the following product workflow description and identify potential waste outputs (by-products).
      
      Workflow Description: "${workflowDescription}"
      
      Return a JSON object with the following structure:
      {
        "identifiedWaste": [
          {
            "material": "Name of material (e.g. Scrap Metal)",
            "confidence": 0.0 to 1.0,
            "estimatedQuantity": "Estimated quantity string (e.g. 100 kg/month)",
            "stage": "Stage of production",
            "suggestedUses": ["Use 1", "Use 2"]
          }
        ],
        "requiredInputs": [
            {
                "material": "Name of input material (e.g. Raw Steel)",
                "estimatedQuantity": "Estimated quantity"
            }
        ],
        "efficiencyScore": 0-100,
        "optimizationSuggestions": "One sentence suggestion."
      }
      
      Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up if markdown is invoked
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const analysis = JSON.parse(cleanedText);

    return NextResponse.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error("Gemini Workflow Error:", error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze workflow with AI' },
      { status: 500 }
    );
  }
}
