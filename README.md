# AI-Driven Whiteboard

An intelligent whiteboard application built with Next.js, TypeScript, TailwindCSS, and tldraw that generates visual diagrams based on text prompts.

## Features

✨ **Interactive Whiteboard**: Powered by tldraw for smooth drawing experience  
🤖 **AI-Driven Visualizations**: Enter a topic and watch it come to life with sequential animation  
📝 **Rich Shape Support**: Text, arrows, circles, rectangles, triangles, lines, paths, highlights  
🎨 **Code & Speech Bubbles**: Special formatting for code blocks and explanations  
🖼️ **Image Support**: Display images on the canvas  
⚡ **Animated Drawing**: Step-by-step visualization with 500ms delays between elements  
� **Smart Color Mapping**: Automatically converts hex colors to tldraw's palette  
🔄 **Auto-Zoom**: Automatically fits all content in view after drawing  
🧹 **Clear Board**: One-click canvas reset  
💾 **Fallback Mode**: Works without API key using mock data

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **TailwindCSS** - Utility-first CSS framework
- **tldraw 2.x** - Infinite canvas whiteboard library
- **Google Gemini AI** - AI-powered diagram generation (gemini-pro model)
- **React** - UI component library

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd WhiteBoard
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Enter a Topic**: Type any concept in the input field (e.g., "Area of a Sector", "Photosynthesis", "Binary Search Tree")
2. **Click Draw**: The AI will generate an intelligent visual diagram with step-by-step animation
3. **Watch Animation**: Each element appears sequentially with 500ms delays for better understanding
4. **Interact**: Use tldraw's built-in tools to modify, annotate, or extend the diagram
5. **Clear**: Reset the canvas to start fresh

### Example Topics

Try these topics to see the AI in action:

- **Mathematics**: `"Area of a Sector"`, `"Pythagorean Theorem"`, `"Quadratic Formula"`
- **Programming**: `"For Loop in Python"`, `"Binary Search Tree"`, `"Recursion"`
- **Science**: `"Photosynthesis"`, `"Water Cycle"`, `"Cell Structure"`
- **Concepts**: `"Machine Learning Pipeline"`, `"HTTP Request Flow"`, `"Git Workflow"`

### Advanced Features

- **Sequential Animation**: Elements appear one by one (500ms intervals)
- **Smart Layout**: AI positions elements logically with proper spacing
- **Color Coding**: Different colors for different concept types
- **Text Formatting**: Regular text, code blocks, and speech bubbles
- **Visual Aids**: Highlights, arrows, and shapes for emphasis

## Project Structure

```
WhiteBoard/
├── .github/
│   └── copilot-instructions.md       # GitHub Copilot configuration
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── draw/
│   │   │       └── route.ts          # Gemini AI integration & mock data
│   │   ├── page.tsx                  # Main page component
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   └── AIDrivenWhiteboard.tsx    # Main whiteboard with animation
│   └── types/
│       └── tldraw.d.ts               # TypeScript declarations for tldraw
├── public/                            # Static assets
├── .env.local.example                 # Environment variables template
├── SETUP_GEMINI.md                    # Gemini setup guide
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── tailwind.config.ts                 # TailwindCSS configuration
└── next.config.ts                     # Next.js configuration
```

## API Reference

### POST /api/draw

Generates drawing instructions for a given topic.

**Request Body:**
```json
{
  "topic": "Photosynthesis"
}
```

**Response:**
```json
{
  "instructions": [
    {
      "id": "title",
      "type": "drawText",
      "text": "Area of a Sector 📐",
      "position": [300, 50],
      "color": "#2C3E50",
      "step": 1
    },
    {
      "id": "circle1",
      "type": "drawCircle",
      "position": [200, 350],
      "size": [200, 200],
      "color": "#D4EEFF",
      "step": 2
    },
    {
      "id": "arrow1",
      "type": "drawArrow",
      "from": [300, 350],
      "to": [400, 350],
      "color": "#E74C3C",
      "step": 3
    },
    {
      "id": "formula",
      "type": "drawCodeBlock",
      "text": "A = (θ / 360°) × πr²",
      "position": [500, 400],
      "size": [250, 70],
      "step": 4
    },
    {
      "id": "speech",
      "type": "drawSpeechBubble",
      "text": "A sector is a fraction of the circle!",
      "position": [550, 200],
      "step": 5
    }
  ]
}
```

### Instruction Types

**Basic Shapes:**
- **drawText**: `{ type, text, position: [x, y], color?, step? }`
- **drawArrow**: `{ type, from: [x, y], to: [x, y], color?, step? }`
- **drawCircle**: `{ type, position?: [x, y], size?: [w, h], points?: [[x,y],...], color?, step? }`
- **drawRectangle**: `{ type, position?: [x, y], size?: [w, h], points?: [[x,y],...], color?, step? }`
- **drawTriangle**: `{ type, points: [[x, y], [x, y], [x, y]], color?, step? }`
- **drawLine**: `{ type, from?: [x, y], to?: [x, y], points?: [[x,y],...], color?, step? }`
- **drawPath**: `{ type, points: [[x, y], ...], color?, step? }`

**Special Elements:**
- **drawHighlight**: `{ type, points: [[x, y], ...], step? }` - Yellow filled area
- **drawCodeBlock**: `{ type, text, position: [x, y], size?: [w, h], step? }` - Grey text for code/formulas
- **drawSpeechBubble**: `{ type, text, position: [x, y], step? }` - Light blue text for explanations
- **showImage**: `{ type, url, position: [x, y], size: [w, h], step? }`

**Color Support:**
- Accepts hex codes (e.g., `#FF4500`) - automatically mapped to tldraw colors
- Accepts tldraw color names: `black`, `grey`, `violet`, `blue`, `yellow`, `orange`, `green`, `red`, `white`
- Color variants: `light-violet`, `light-blue`, `light-green`, `light-red`

## Development

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Google Gemini AI Integration

This project uses **Google Gemini** for AI-powered diagram generation. The integration is already implemented!

#### Setup Instructions

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Get API Key" or "Create API Key"
   - Copy your API key

2. **Configure Environment Variable**:
   ```bash
   # Create .env.local file in the project root
   cp .env.local.example .env.local
   ```

3. **Add your API key to `.env.local`**:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Restart the dev server**:
   ```bash
   npm run dev
   ```

#### How It Works

- The API automatically uses Gemini when `GEMINI_API_KEY` is configured
- If no API key is found, it falls back to mock data
- Gemini generates intelligent, context-aware diagrams for any topic
- Uses `gemini-1.5-flash` model for fast, cost-effective generation

#### Features

✨ **Smart Diagram Generation** - Gemini understands your topic and creates relevant visualizations  
🎯 **Context-Aware** - Generates appropriate shapes, arrows, and labels  
📊 **Educational Focus** - Optimized for learning and explanation  
💰 **Cost-Effective** - Uses Gemini Flash model for efficient API usage  
🔄 **Automatic Fallback** - Works offline with mock data if API is unavailable

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tldraw Documentation](https://tldraw.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
