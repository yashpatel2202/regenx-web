import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const { originalWorkflow, availableMaterials } = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ success: false, error: "GEMINI_API_KEY is missing." }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a Sustainable Process Engineer. 
            
            Original Product Workflow:
            "${originalWorkflow}"

            Available Recycled Materials from Marketplace:
            ${JSON.stringify(availableMaterials)}

            Task: Rewrite the workflow to explicitly incorporate these available recycled materials instead of virgin raw materials where applicable. 
            Highlight the sustainability benefits (e.g. "Replaces virgin steel with Recycled Steel Scrap...").
            Keep the output concise but detailed enough to be a valid process description.

            Return the response as a JSON object:
            {
                "optimizedWorkflow": "The rewritten workflow text...",
                "sustainabilityImpact": "A brief summary of the environmental impact improvement (e.g. 20% lower carbon footprint)."
            }
            Do not use markdown formatting.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const responseData = JSON.parse(cleanedText);

        return NextResponse.json({ success: true, data: responseData });

    } catch (error) {
        console.error("Suggest Alternates Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate suggestions" }, { status: 500 });
    }
}
