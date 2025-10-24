import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Gemini AI
// Get your API key from: https://makersuite.google.com/app/apikey
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not configured, using mock data");
      const instructions = generateMockInstructions(topic.toLowerCase());
      return NextResponse.json({ instructions });
    }

    // Use Gemini to generate drawing instructions
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are an expert at creating visual diagrams. Generate drawing instructions for a whiteboard to explain the topic: "${topic}".

Return a JSON object with an "instructions" array containing drawing commands. Each instruction should be one of:

1. drawText: { "type": "drawText", "text": "string", "position": [x, y] }
2. drawArrow: { "type": "drawArrow", "from": [x, y], "to": [x, y] }
3. drawCircle: { "type": "drawCircle", "points": [[x1,y1], [x2,y2], [x3,y3], [x4,y4]] } (4 corner points of bounding box)
4. drawRectangle: { "type": "drawRectangle", "points": [[x1,y1], [x2,y2], [x3,y3], [x4,y4]] } (4 corners)
5. drawTriangle: { "type": "drawTriangle", "points": [[x1,y1], [x2,y2], [x3,y3]] } (3 points)
6. drawLine: { "type": "drawLine", "points": [[x1,y1], [x2,y2]] } (2 points)
7. showImage: { "type": "showImage", "url": "https://...", "position": [x, y], "size": [width, height] }

Guidelines:
- Use a canvas area of approximately 800x600 pixels
- Position elements logically with good spacing
- Use text labels to explain concepts
- Use arrows to show flow/relationships
- Keep it simple and educational
- Use emojis in text where appropriate
- Include 5-15 instructions total

Return ONLY valid JSON, no markdown formatting or extra text.

Example format:
{
  "instructions": [
    {"type": "drawText", "text": "Main Concept", "position": [300, 50]},
    {"type": "drawRectangle", "points": [[100, 100], [300, 100], [300, 200], [100, 200]]},
    {"type": "drawArrow", "from": [300, 150], "to": [400, 150]}
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse the JSON response
      let instructions;
      try {
        // Try to extract JSON if wrapped in markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          instructions = parsed.instructions || parsed;
        } else {
          instructions = JSON.parse(text);
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text);
        throw new Error("Invalid JSON response from AI");
      }

      return NextResponse.json({ instructions });
    } catch (aiError) {
      console.error("Gemini API error:", aiError);
      // Fallback to mock data if AI fails
      const instructions = generateMockInstructions(topic.toLowerCase());
      return NextResponse.json({ instructions });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Generate sample drawing instructions based on the topic
function generateMockInstructions(topic: string) {
  // Photosynthesis example
  if (topic.includes("photosynthesis")) {
    return [
      {
        type: "drawText",
        text: "PHOTOSYNTHESIS",
        position: [300, 50],
      },
      {
        type: "drawCircle",
        points: [
          [100, 150],
          [200, 150],
          [200, 250],
          [100, 250],
        ],
      },
      {
        type: "drawText",
        text: "Sun ☀️",
        position: [120, 180],
      },
      {
        type: "drawArrow",
        from: [200, 200],
        to: [300, 200],
      },
      {
        type: "drawRectangle",
        points: [
          [300, 150],
          [450, 150],
          [450, 250],
          [300, 250],
        ],
      },
      {
        type: "drawText",
        text: "Leaf 🍃",
        position: [330, 180],
      },
      {
        type: "drawArrow",
        from: [450, 200],
        to: [550, 200],
      },
      {
        type: "drawCircle",
        points: [
          [550, 150],
          [650, 150],
          [650, 250],
          [550, 250],
        ],
      },
      {
        type: "drawText",
        text: "O₂ + Glucose",
        position: [560, 180],
      },
      {
        type: "drawText",
        text: "CO₂ + H₂O + Light → C₆H₁₂O₆ + O₂",
        position: [200, 300],
      },
    ];
  }

  // For loop example
  if (topic.includes("for") && topic.includes("loop")) {
    return [
      {
        type: "drawText",
        text: "FOR LOOP IN PYTHON",
        position: [250, 50],
      },
      {
        type: "drawRectangle",
        points: [
          [100, 120],
          [600, 120],
          [600, 180],
          [100, 180],
        ],
      },
      {
        type: "drawText",
        text: "for i in range(5):",
        position: [120, 135],
      },
      {
        type: "drawArrow",
        from: [350, 180],
        to: [350, 220],
      },
      {
        type: "drawRectangle",
        points: [
          [150, 220],
          [550, 220],
          [550, 280],
          [150, 280],
        ],
      },
      {
        type: "drawText",
        text: "    print(i)  # Loop body",
        position: [170, 235],
      },
      {
        type: "drawArrow",
        from: [150, 250],
        to: [80, 250],
      },
      {
        type: "drawArrow",
        from: [80, 250],
        to: [80, 150],
      },
      {
        type: "drawArrow",
        from: [80, 150],
        to: [100, 150],
      },
      {
        type: "drawText",
        text: "↻ Repeat",
        position: [20, 190],
      },
      {
        type: "drawArrow",
        from: [350, 280],
        to: [350, 320],
      },
      {
        type: "drawText",
        text: "Output: 0, 1, 2, 3, 4",
        position: [260, 330],
      },
    ];
  }

  // Water cycle example
  if (topic.includes("water cycle") || topic.includes("water")) {
    return [
      {
        type: "drawText",
        text: "WATER CYCLE",
        position: [300, 30],
      },
      {
        type: "drawCircle",
        points: [
          [100, 80],
          [180, 80],
          [180, 160],
          [100, 160],
        ],
      },
      {
        type: "drawText",
        text: "☁️ Cloud",
        position: [110, 105],
      },
      {
        type: "drawArrow",
        from: [140, 160],
        to: [200, 220],
      },
      {
        type: "drawText",
        text: "Rain ⬇️",
        position: [145, 180],
      },
      {
        type: "drawRectangle",
        points: [
          [150, 220],
          [400, 220],
          [400, 280],
          [150, 280],
        ],
      },
      {
        type: "drawText",
        text: "🌊 Ocean/Lake",
        position: [230, 240],
      },
      {
        type: "drawArrow",
        from: [275, 220],
        to: [275, 160],
      },
      {
        type: "drawText",
        text: "⬆️ Evaporation",
        position: [280, 180],
      },
      {
        type: "drawCircle",
        points: [
          [450, 80],
          [530, 80],
          [530, 160],
          [450, 160],
        ],
      },
      {
        type: "drawText",
        text: "☀️ Sun",
        position: [470, 105],
      },
    ];
  }

  // Default generic example
  return [
    {
      type: "drawText",
      text: topic.toUpperCase(),
      position: [250, 50],
    },
    {
      type: "drawText",
      text: "🤖 AI is thinking...",
      position: [200, 150],
    },
    {
      type: "drawRectangle",
      points: [
        [150, 200],
        [550, 200],
        [550, 300],
        [150, 300],
      ],
    },
    {
      type: "drawText",
      text: "This is a placeholder diagram.",
      position: [200, 220],
    },
    {
      type: "drawText",
      text: "Replace /api/draw with OpenAI integration",
      position: [170, 250],
    },
    {
      type: "drawText",
      text: "for intelligent visualizations!",
      position: [200, 270],
    },
    {
      type: "drawCircle",
      points: [
        [50, 350],
        [150, 350],
        [150, 450],
        [50, 450],
      ],
    },
    {
      type: "drawArrow",
      from: [150, 400],
      to: [250, 400],
    },
    {
      type: "drawTriangle",
      points: [
        [250, 370],
        [350, 370],
        [300, 430],
      ],
    },
  ];
}
