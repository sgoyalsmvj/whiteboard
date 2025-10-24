# AI-Driven Whiteboard

An intelligent whiteboard application built with Next.js, TypeScript, TailwindCSS, and tldraw that generates visual diagrams based on text prompts.

## Features

✨ **Interactive Whiteboard**: Powered by tldraw for smooth drawing experience  
🤖 **AI-Driven Visualizations**: Enter a topic and watch it come to life  
📝 **Multiple Shape Types**: Text, arrows, circles, rectangles, triangles, lines  
🖼️ **Image Support**: Display images on the canvas  
⚡ **Real-time Drawing**: Instant visualization with loading indicators  
🎨 **TailwindCSS Styling**: Clean, responsive UI design  
🔄 **Clear Board**: One-click canvas reset

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **TailwindCSS** - Utility-first CSS framework
- **tldraw** - Infinite canvas whiteboard library
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

1. **Enter a Topic**: Type any concept in the input field (e.g., "Photosynthesis", "For Loop in Python", "Water Cycle")
2. **Click Draw**: The AI will generate a visual diagram
3. **Interact**: Use tldraw's built-in tools to modify or annotate
4. **Clear**: Reset the canvas to start fresh

### Example Topics

- `Photosynthesis` - Shows the process with sun, leaf, and outputs
- `For Loop in Python` - Visualizes loop structure and flow
- `Water Cycle` - Displays evaporation, clouds, and rain

## Project Structure

```
WhiteBoard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── draw/
│   │   │       └── route.ts          # API endpoint for drawing instructions
│   │   ├── page.tsx                  # Main page component
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   └── components/
│       └── AIDrivenWhiteboard.tsx    # Main whiteboard component
├── public/                            # Static assets
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
      "type": "drawText",
      "text": "PHOTOSYNTHESIS",
      "position": [300, 50]
    },
    {
      "type": "drawArrow",
      "from": [200, 200],
      "to": [300, 200]
    },
    {
      "type": "drawCircle",
      "points": [[100, 150], [200, 150], [200, 250], [100, 250]]
    },
    {
      "type": "showImage",
      "url": "https://example.com/image.png",
      "position": [100, 100],
      "size": [200, 200]
    }
  ]
}
```

### Instruction Types

- **drawText**: `{ type, text, position: [x, y] }`
- **drawArrow**: `{ type, from: [x, y], to: [x, y] }`
- **drawCircle**: `{ type, points: [[x, y], ...] }`
- **drawRectangle**: `{ type, points: [[x, y], ...] }`
- **drawTriangle**: `{ type, points: [[x, y], [x, y], [x, y]] }`
- **drawLine**: `{ type, points: [[x, y], [x, y]] }`
- **showImage**: `{ type, url, position: [x, y], size: [w, h] }`

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
