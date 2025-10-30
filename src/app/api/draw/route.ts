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

      //       const prompt = `
      // You are an expert AI visual tutor who creates clear, educational whiteboard diagrams to teach any topic interactively.

      // Generate drawing instructions for a whiteboard to explain the topic: "${topic}".

      // Return a single valid JSON object (no markdown, no text outside JSON) with this structure:

      // {
      //   "narration": "A short, 1–2 sentence explanation of what this diagram teaches.",
      //   "instructions": [
      //     {
      //       "id": "unique_id",
      //       "type": "drawText" | "drawArrow" | "drawCircle" | "drawRectangle" | "drawTriangle" | "drawLine" | "drawPath" | "drawHighlight" | "showImage" | "drawCodeBlock" | "drawSpeechBubble" | "eraseArea",
      //       "text"?: "string",
      //       "from"?: [x, y],
      //       "to"?: [x, y],
      //       "points"?: [[x1, y1], [x2, y2], ...],
      //       "url"?: "https://...",
      //       "position"?: [x, y],
      //       "size"?: [width, height],
      //       "color"?: "string",
      //       "opacity"?: number,
      //       "step"?: number,
      //       "duration"?: number,
      //       "layer"?: "background" | "main" | "overlay",
      //       "targetId"?: "string",
      //       "visible"?: boolean
      //     }
      //   ]
      // }

      // Guidelines:
      // - Use a whiteboard area of approximately 800x600 pixels.
      // - Use simple, easy-to-understand visuals — avoid clutter.
      // - Position elements logically with good spacing.
      // - Label every visual element with short, clear text.
      // - Use arrows to show relationships and flow.
      // - Use highlights to emphasize important parts.
      // - For examples or equations, use drawCodeBlock.
      // - For short tutor speech, use drawSpeechBubble.
      // - If referencing real objects, prefer valid web URLs in showImage.
      // - Use emojis in text labels only when they improve understanding (📐, 📊, ⚡, etc.).
      // - Include 5–15 total drawing instructions.
      // - Maintain a logical step order for sequential animation.
      // - Return ONLY valid JSON — no markdown, no explanations, no code fences.

      // Example output:
      // {
      //   "narration": "A right-angled triangle has one 90° angle. Its area is 1/2 × base × height.",
      //   "instructions": [
      //     { "id": "t1", "type": "drawText", "text": "Right-Angled Triangle 📐", "position": [280, 50], "step": 1 },
      //     { "id": "tri1", "type": "drawTriangle", "points": [[200, 400], [400, 400], [400, 200]], "color": "#1E90FF", "opacity": 0.8, "step": 2 },
      //     { "id": "arrow1", "type": "drawArrow", "from": [400, 300], "to": [480, 300], "color": "#FF0000", "step": 3 },
      //     { "id": "txt1", "type": "drawText", "text": "Base", "position": [280, 420], "step": 4 },
      //     { "id": "txt2", "type": "drawText", "text": "Height", "position": [420, 300], "step": 5 },
      //     { "id": "highlight1", "type": "drawHighlight", "points": [[200, 400], [400, 200]], "color": "rgba(255,255,0,0.3)", "step": 6 },
      //     { "id": "speech1", "type": "drawSpeechBubble", "text": "Let's calculate its area!", "position": [500, 150], "step": 7 }
      //   ]
      // }
      // `;

      const prompt = `
You are an expert AI visual tutor who creates educational whiteboard diagrams using TLDraw-compatible instructions.

Generate drawing instructions to visually teach the topic: "${topic}".

Return a valid JSON object with this structure (NO markdown, NO code fences):

{
  "narration": "A short 1–2 sentence explanation of what this diagram teaches.",
  "instructions": [
    {
      "id": "unique_id",
      "type": "drawText" | "drawArrow" | "drawCircle" | "drawRectangle" | "drawTriangle" | "drawLine" | "drawPath" | "drawHighlight" | "showImage" | "drawSpeechBubble",
      "narration": "What this specific step adds to the diagram (optional but recommended)",
      "text"?: "string",
      "from"?: [x, y],
      "to"?: [x, y],
      "points"?: [[x1, y1], [x2, y2], ...],
      "url"?: "https://...",
      "position"?: [x, y],
      "size"?: [width, height],
      "color"?: "string",
      "opacity"?: number,
      "step"?: number,
      "duration"?: number
    }
  ]
}

Guidelines:
- Assume the TLDraw canvas size is about 800x600 pixels.
- Use simple educational layouts with good spacing.
- Label elements with clear, short text.
- Use arrows for flow and relationships.
- Use highlights for emphasis.
- For real-world illustrations, use image URLs from web 
- Each instruction should use logical coordinates (x,y in pixels).
- Include 5–15 total drawing instructions.
- Use emojis in text where helpful (📐, 📊, 🧠, ⚡).
- Add a "narration" field to EACH instruction explaining what that step demonstrates
- Ensure "showImage" URLs are direct links that support browser loading.
- Return ONLY valid JSON — no markdown or extra commentary.

Example output:
{
  "narration": "The water cycle shows how water moves through evaporation, condensation, and precipitation.",
  "instructions": [
    { "id": "t1", "type": "drawText", "text": "💧 Water Cycle", "position": [300, 40], "step": 1, "narration": "Let's explore how water moves in nature" },
    { "id": "img1", "type": "showImage", "url": "https://source.unsplash.com/featured/?clouds,water", "position": [150, 100], "size": [500, 300], "step": 2, "narration": "This shows clouds forming in the atmosphere" },
    { "id": "arrow1", "type": "drawArrow", "from": [200, 350], "to": [400, 150], "color": "#0077FF", "step": 3, "narration": "Water vapor rises up from the ocean" },
    { "id": "text1", "type": "drawText", "text": "Evaporation ☀️", "position": [220, 370], "step": 4, "narration": "Evaporation: the sun heats water, turning it into vapor" },
    { "id": "arrow2", "type": "drawArrow", "from": [450, 150], "to": [350, 350], "color": "#00BFFF", "step": 5, "narration": "Water vapor cools and falls back down" },
    { "id": "text2", "type": "drawText", "text": "Condensation 🌫️", "position": [470, 140], "step": 6, "narration": "Condensation: vapor becomes water droplets in clouds" },
    { "id": "highlight", "type": "drawHighlight", "points": [[200,350],[400,150]], "color": "rgba(255,255,0,0.3)", "step": 7, "narration": "This is the key evaporation zone" },
    { "id": "bubble1", "type": "drawSpeechBubble", "text": "Let's follow a drop of water!", "position": [500, 100], "step": 8, "narration": "Understanding this cycle helps us appreciate nature" }
  ]
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse the JSON response
      let parsedData;
      try {
        // Try to extract JSON if wrapped in markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          parsedData = JSON.parse(text);
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text);
        throw new Error("Invalid JSON response from AI");
      }

      // Return both narration and instructions
      return NextResponse.json({
        narration: parsedData.narration,
        instructions: parsedData.instructions || parsedData,
      });
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
    return {
      narration:
        "Photosynthesis is the process where plants use sunlight, carbon dioxide, and water to create glucose and oxygen.",
      instructions: [
        {
          type: "drawText",
          text: "PHOTOSYNTHESIS",
          position: [300, 50],
          narration: "Let's explore how plants make their own food",
        },
        {
          type: "drawCircle",
          points: [
            [100, 150],
            [200, 150],
            [200, 250],
            [100, 250],
          ],
          narration: "The sun provides energy for photosynthesis",
        },
        {
          type: "drawText",
          text: "Sun ☀️",
          position: [120, 180],
          narration: "Sunlight is the primary energy source",
        },
        {
          type: "drawArrow",
          from: [200, 200],
          to: [300, 200],
          narration: "Energy travels from the sun to the plant",
        },
        {
          type: "drawRectangle",
          points: [
            [300, 150],
            [450, 150],
            [450, 250],
            [300, 250],
          ],
          narration: "The leaf is where photosynthesis happens",
        },
        {
          type: "drawText",
          text: "Leaf 🍃",
          position: [330, 180],
          narration: "Chloroplasts in the leaf capture sunlight",
        },
        {
          type: "drawArrow",
          from: [450, 200],
          to: [550, 200],
          narration: "The plant produces oxygen and glucose",
        },
        {
          type: "drawCircle",
          points: [
            [550, 150],
            [650, 150],
            [650, 250],
            [550, 250],
          ],
          narration: "These are the products of photosynthesis",
        },
        {
          type: "drawText",
          text: "O₂ + Glucose",
          position: [560, 180],
          narration: "Oxygen is released and glucose is stored",
        },
        {
          type: "drawText",
          text: "CO₂ + H₂O + Light → C₆H₁₂O₆ + O₂",
          position: [200, 300],
          narration: "This is the chemical equation for photosynthesis",
        },
      ],
    };
  }

  // For loop example
  if (topic.includes("for") && topic.includes("loop")) {
    return {
      narration:
        "A for loop in Python repeats a block of code a specific number of times, iterating through a sequence.",
      instructions: [
        {
          type: "drawText",
          text: "FOR LOOP IN PYTHON",
          position: [250, 50],
          narration: "Let's understand how for loops work in Python",
        },
        {
          type: "drawRectangle",
          points: [
            [100, 120],
            [600, 120],
            [600, 180],
            [100, 180],
          ],
          narration: "This is the for loop header that sets up iteration",
        },
        {
          type: "drawText",
          text: "for i in range(5):",
          position: [120, 135],
          narration: "We're looping through numbers 0 to 4",
        },
        {
          type: "drawArrow",
          from: [350, 180],
          to: [350, 220],
          narration: "The flow moves into the loop body",
        },
        {
          type: "drawRectangle",
          points: [
            [150, 220],
            [550, 220],
            [550, 280],
            [150, 280],
          ],
          narration: "This is the code that runs each iteration",
        },
        {
          type: "drawText",
          text: "    print(i)  # Loop body",
          position: [170, 235],
          narration: "Each time, we print the current value of i",
        },
        {
          type: "drawArrow",
          from: [150, 250],
          to: [80, 250],
          narration: "After each iteration, we check if there are more items",
        },
        {
          type: "drawArrow",
          from: [80, 250],
          to: [80, 150],
          narration: "If yes, we loop back to the top",
        },
        {
          type: "drawArrow",
          from: [80, 150],
          to: [100, 150],
          narration: "The loop continues until all items are processed",
        },
        {
          type: "drawText",
          text: "↻ Repeat",
          position: [20, 190],
          narration: "This shows the repetitive nature of loops",
        },
        {
          type: "drawArrow",
          from: [350, 280],
          to: [350, 320],
          narration: "Once done, we exit the loop",
        },
        {
          type: "drawText",
          text: "Output: 0, 1, 2, 3, 4",
          position: [260, 330],
          narration: "The final output shows all the numbers printed",
        },
      ],
    };
  }

  // Water cycle example
  if (topic.includes("water cycle") || topic.includes("water")) {
    return {
      narration:
        "The water cycle is the continuous movement of water through evaporation, condensation, and precipitation.",
      instructions: [
        {
          type: "drawText",
          text: "WATER CYCLE",
          position: [300, 30],
          narration: "Let's explore how water moves through nature",
        },
        {
          type: "drawCircle",
          points: [
            [100, 80],
            [180, 80],
            [180, 160],
            [100, 160],
          ],
          narration: "Clouds form when water vapor condenses",
        },
        {
          type: "drawText",
          text: "☁️ Cloud",
          position: [110, 105],
          narration: "Water vapor becomes tiny water droplets",
        },
        {
          type: "drawArrow",
          from: [140, 160],
          to: [200, 220],
          narration: "Water falls from clouds as precipitation",
        },
        {
          type: "drawText",
          text: "Rain ⬇️",
          position: [145, 180],
          narration: "Rain, snow, or hail falls to Earth",
        },
        {
          type: "drawRectangle",
          points: [
            [150, 220],
            [400, 220],
            [400, 280],
            [150, 280],
          ],
          narration: "Water collects in oceans, lakes, and rivers",
        },
        {
          type: "drawText",
          text: "🌊 Ocean/Lake",
          position: [230, 240],
          narration: "Most of Earth's water is in the oceans",
        },
        {
          type: "drawArrow",
          from: [275, 220],
          to: [275, 160],
          narration: "The sun heats the water, causing evaporation",
        },
        {
          type: "drawText",
          text: "⬆️ Evaporation",
          position: [280, 180],
          narration: "Liquid water becomes water vapor (gas)",
        },
        {
          type: "drawCircle",
          points: [
            [450, 80],
            [530, 80],
            [530, 160],
            [450, 160],
          ],
          narration: "The sun provides energy for the water cycle",
        },
        {
          type: "drawText",
          text: "☀️ Sun",
          position: [470, 105],
          narration: "Solar energy drives evaporation and weather",
        },
      ],
    };
  }

  // Default generic example
  return {
    narration:
      "This is a sample diagram. Configure your Gemini API key to get AI-powered educational visualizations!",
    instructions: [
      {
        type: "drawText",
        text: topic.toUpperCase(),
        position: [250, 50],
        narration: "This is the title of our diagram",
      },
      {
        type: "drawText",
        text: "🤖 AI is thinking...",
        position: [200, 150],
        narration: "The AI will create custom visualizations for any topic",
      },
      {
        type: "drawRectangle",
        points: [
          [150, 200],
          [550, 200],
          [550, 300],
          [150, 300],
        ],
        narration: "This is a placeholder container",
      },
      {
        type: "drawText",
        text: "This is a placeholder diagram.",
        position: [200, 220],
        narration: "Configure your Gemini API key in .env.local",
      },
      {
        type: "drawText",
        text: "Replace /api/draw with OpenAI integration",
        position: [170, 250],
        narration: "The API endpoint can use any AI service",
      },
      {
        type: "drawText",
        text: "for intelligent visualizations!",
        position: [200, 270],
        narration: "AI will generate diagrams based on your topic",
      },
      {
        type: "drawCircle",
        points: [
          [50, 350],
          [150, 350],
          [150, 450],
          [50, 450],
        ],
        narration: "Here's a circle shape example",
      },
      {
        type: "drawArrow",
        from: [150, 400],
        to: [250, 400],
        narration: "Arrows show relationships between elements",
      },
      {
        type: "drawTriangle",
        points: [
          [250, 370],
          [350, 370],
          [300, 430],
        ],
        narration: "Triangles can represent hierarchies or decisions",
      },
    ],
  };
}
