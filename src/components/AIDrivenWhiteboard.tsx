"use client";

import React, { useState, useCallback } from "react";
import { Tldraw, Editor, createShapeId, toRichText } from "tldraw";
import "tldraw/tldraw.css";

// Define types for API response instructions
interface BaseInstruction {
  id?: string;
  step?: number;
  color?: string;
  opacity?: number;
  layer?: string;
  duration?: number;
  visible?: boolean;
  narration?: string; // Narration for this specific step
}

interface DrawTextInstruction extends BaseInstruction {
  type: "drawText";
  text: string;
  position: [number, number];
}

interface DrawArrowInstruction extends BaseInstruction {
  type: "drawArrow";
  from: [number, number];
  to: [number, number];
}

interface DrawShapeInstruction extends BaseInstruction {
  type: "drawTriangle" | "drawCircle" | "drawRectangle";
  points?: [number, number][];
  position?: [number, number];
  size?: [number, number];
}

interface DrawLineInstruction extends BaseInstruction {
  type: "drawLine" | "drawPath";
  from?: [number, number];
  to?: [number, number];
  points?: [number, number][];
}

interface DrawHighlightInstruction extends BaseInstruction {
  type: "drawHighlight";
  points: [number, number][];
}

interface ShowImageInstruction extends BaseInstruction {
  type: "showImage";
  url: string;
  position: [number, number];
  size: [number, number];
}

interface DrawCodeBlockInstruction extends BaseInstruction {
  type: "drawCodeBlock";
  text: string;
  position: [number, number];
  size?: [number, number];
}

interface DrawSpeechBubbleInstruction extends BaseInstruction {
  type: "drawSpeechBubble";
  text: string;
  position: [number, number];
}

type DrawInstruction =
  | DrawTextInstruction
  | DrawArrowInstruction
  | DrawShapeInstruction
  | DrawLineInstruction
  | DrawHighlightInstruction
  | ShowImageInstruction
  | DrawCodeBlockInstruction
  | DrawSpeechBubbleInstruction;

interface ApiResponse {
  narration?: string;
  instructions: DrawInstruction[];
}

export default function AIDrivenWhiteboard() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentNarration, setCurrentNarration] = useState<string>("");

  // Initialize speech synthesis
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  // Handle editor mount - store editor instance for programmatic control
  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
  }, []);

  // Clear the whiteboard - remove all shapes
  const clearBoard = useCallback(() => {
    if (editor) {
      const shapes = editor.getCurrentPageShapes();
      editor.deleteShapes(shapes.map((s) => s.id));
      setError(null);
      setCurrentNarration("");
      // Stop any ongoing speech
      if (synth) {
        synth.cancel();
      }
      setIsSpeaking(false);
    }
  }, [editor, synth]);

  // Speak text using Web Speech API
  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!synth) {
          console.warn("Speech synthesis not supported");
          resolve();
          return;
        }

        // Cancel any ongoing speech
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setCurrentNarration(text);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setCurrentNarration("");
          resolve();
        };

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          setIsSpeaking(false);
          setCurrentNarration("");
          resolve();
        };

        synth.speak(utterance);
      });
    },
    [synth]
  );

  // Execute a single drawing instruction on the canvas
  const executeInstruction = useCallback(
    (instruction: DrawInstruction, index: number) => {
      if (!editor) return;

      // Helper function to map hex/named colors to tldraw's predefined colors
      const mapToTldrawColor = (colorInput: string | undefined): string => {
        if (!colorInput) return "black";

        const colorLower = colorInput.toLowerCase();

        // Map hex codes and common names to tldraw colors
        const colorMap: { [key: string]: string } = {
          // Hex codes
          "#000000": "black",
          "#808080": "grey",
          "#d4d4ff": "light-violet",
          "#9747ff": "violet",
          "#0000ff": "blue",
          "#4dabf7": "light-blue",
          "#ffff00": "yellow",
          "#ffa500": "orange",
          "#ff4500": "orange", // orangered -> orange
          "#008000": "green",
          "#90ee90": "light-green",
          "#ff0000": "red",
          "#ffa07a": "light-red",
          "#ffffff": "white",
          // Named colors
          black: "black",
          grey: "grey",
          gray: "grey",
          violet: "violet",
          purple: "violet",
          blue: "blue",
          lightblue: "light-blue",
          "light-blue": "light-blue",
          yellow: "yellow",
          orange: "orange",
          orangered: "orange",
          green: "green",
          lightgreen: "light-green",
          "light-green": "light-green",
          red: "red",
          lightred: "light-red",
          "light-red": "light-red",
          white: "white",
        };

        return colorMap[colorLower] || "black";
      };

      try {
        const color = mapToTldrawColor(instruction.color);

        switch (instruction.type) {
          case "drawText": {
            // Create a text shape with richText content
            const textId = createShapeId();
            editor.createShape({
              id: textId,
              type: "text",
              x: instruction.position[0],
              y: instruction.position[1],
              props: {
                richText: toRichText(instruction.text),
                color: color as any,
              },
            });
            break;
          }

          case "drawArrow": {
            // Create an arrow from point A to point B
            const arrowId = createShapeId();
            editor.createShape({
              id: arrowId,
              type: "arrow",
              x: instruction.from[0],
              y: instruction.from[1],
              props: {
                start: { x: 0, y: 0 },
                end: {
                  x: instruction.to[0] - instruction.from[0],
                  y: instruction.to[1] - instruction.from[1],
                },
                color: color as any,
              },
            });
            break;
          }

          case "drawLine":
          case "drawPath": {
            // Draw line or path using draw shape
            const points =
              instruction.points ||
              (instruction.from && instruction.to
                ? [instruction.from, instruction.to]
                : []);
            if (points.length < 2) break;

            const drawId = createShapeId();
            const segments: any[] = [];

            for (let i = 0; i < points.length - 1; i++) {
              segments.push({
                type: "straight",
                points: [
                  { x: points[i][0], y: points[i][1] },
                  { x: points[i + 1][0], y: points[i + 1][1] },
                ],
              });
            }

            editor.createShape({
              id: drawId,
              type: "draw",
              x: 0,
              y: 0,
              props: {
                segments,
                color: color as any,
                size: "m",
              },
            });
            break;
          }

          case "drawTriangle": {
            // Create a triangle using draw shape
            const points = instruction.points || [];
            if (points.length < 3) break;

            const drawId = createShapeId();
            const segments: any[] = [];

            // Draw lines between all points
            for (let i = 0; i < points.length - 1; i++) {
              segments.push({
                type: "straight",
                points: [
                  { x: points[i][0], y: points[i][1] },
                  { x: points[i + 1][0], y: points[i + 1][1] },
                ],
              });
            }

            // Close the triangle
            segments.push({
              type: "straight",
              points: [
                {
                  x: points[points.length - 1][0],
                  y: points[points.length - 1][1],
                },
                { x: points[0][0], y: points[0][1] },
              ],
            });

            editor.createShape({
              id: drawId,
              type: "draw",
              x: 0,
              y: 0,
              props: {
                segments,
                color: color as any,
                size: "m",
                isClosed: true,
              },
            });
            break;
          }

          case "drawCircle": {
            // Create a geo shape (ellipse)
            let x, y, w, h;

            if (instruction.position && instruction.size) {
              // Use position and size if provided
              x = instruction.position[0];
              y = instruction.position[1];
              w = instruction.size[0];
              h = instruction.size[1];
            } else if (instruction.points && instruction.points.length > 0) {
              // Calculate from points
              const xs = instruction.points.map((p) => p[0]);
              const ys = instruction.points.map((p) => p[1]);
              x = Math.min(...xs);
              y = Math.min(...ys);
              w = Math.max(...xs) - x;
              h = Math.max(...ys) - y;
            } else {
              break;
            }

            const circleId = createShapeId();
            editor.createShape({
              id: circleId,
              type: "geo",
              x,
              y,
              props: {
                geo: "ellipse",
                w,
                h,
                color: color as any,
              },
            });
            break;
          }

          case "drawRectangle": {
            // Create a rectangular geo shape
            let x, y, w, h;

            if (instruction.position && instruction.size) {
              x = instruction.position[0];
              y = instruction.position[1];
              w = instruction.size[0];
              h = instruction.size[1];
            } else if (instruction.points && instruction.points.length >= 2) {
              const xs = instruction.points.map((p) => p[0]);
              const ys = instruction.points.map((p) => p[1]);
              x = Math.min(...xs);
              y = Math.min(...ys);
              w = Math.max(...xs) - x;
              h = Math.max(...ys) - y;
            } else {
              break;
            }

            const rectId = createShapeId();
            editor.createShape({
              id: rectId,
              type: "geo",
              x,
              y,
              props: {
                geo: "rectangle",
                w,
                h,
                color: color as any,
              },
            });
            break;
          }

          case "drawHighlight": {
            // Draw a highlight using a filled polygon (draw shape)
            if (!instruction.points || instruction.points.length < 3) break;

            const highlightId = createShapeId();
            const segments: any[] = [];

            for (let i = 0; i < instruction.points.length - 1; i++) {
              segments.push({
                type: "straight",
                points: [
                  { x: instruction.points[i][0], y: instruction.points[i][1] },
                  {
                    x: instruction.points[i + 1][0],
                    y: instruction.points[i + 1][1],
                  },
                ],
              });
            }

            // Close the shape
            segments.push({
              type: "straight",
              points: [
                {
                  x: instruction.points[instruction.points.length - 1][0],
                  y: instruction.points[instruction.points.length - 1][1],
                },
                { x: instruction.points[0][0], y: instruction.points[0][1] },
              ],
            });

            editor.createShape({
              id: highlightId,
              type: "draw",
              x: 0,
              y: 0,
              props: {
                segments,
                color: "yellow" as any,
                size: "l",
                isClosed: true,
                fill: "solid",
              },
            });
            break;
          }

          case "drawCodeBlock":
          case "drawSpeechBubble": {
            // Create a text shape for code blocks and speech bubbles (styled differently)
            const textId = createShapeId();

            editor.createShape({
              id: textId,
              type: "text",
              x: instruction.position[0],
              y: instruction.position[1],
              props: {
                richText: toRichText(instruction.text),
                color:
                  instruction.type === "drawCodeBlock"
                    ? ("grey" as any)
                    : ("light-blue" as any),
                size: "m" as any,
              },
            });
            break;
          }

          case "showImage": {
            // Create an image shape at specified position and size
            const imageId = createShapeId();
            editor.createShape({
              id: imageId,
              type: "image",
              x: instruction.position[0],
              y: instruction.position[1],
              props: {
                w: instruction.size[0],
                h: instruction.size[1],
                url: instruction.url,
              },
            });
            break;
          }
        }
      } catch (err) {
        console.error(`Error executing instruction ${index}:`, err);
        setError(`Failed to execute instruction ${index + 1}`);
      }
    },
    [editor]
  );

  // Replay drawing animation with delays between instructions
  const replayDrawing = useCallback(
    async (instructions: DrawInstruction[]) => {
      if (!editor) return;

      clearBoard();

      // Execute each instruction with a 500ms delay for animation effect
      for (let i = 0; i < instructions.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        executeInstruction(instructions[i], i);
      }
    },
    [editor, clearBoard, executeInstruction]
  );

  // Handle form submission - fetch drawing instructions from API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    if (!editor) {
      setError("Whiteboard not ready");
      return;
    }

    setLoading(true);
    setError(null);
    clearBoard();

    try {
      // Call the backend API with the topic
      const response = await fetch("/api/draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // Speak overall narration first
      if (data.narration) {
        await speak(data.narration);
        // Small pause after overall narration
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Execute drawing instructions one by one with animation and narration
      if (data.instructions && data.instructions.length > 0) {
        // Execute each instruction with synchronized speech and drawing
        for (let i = 0; i < data.instructions.length; i++) {
          const instruction = data.instructions[i];

          // Speak the step narration if available
          if (instruction.narration) {
            await speak(instruction.narration);
            // Small pause before drawing
            await new Promise((resolve) => setTimeout(resolve, 300));
          }

          // Execute the drawing instruction
          executeInstruction(instruction, i);

          // Pause between steps (shorter if no narration)
          await new Promise((resolve) =>
            setTimeout(resolve, instruction.narration ? 500 : 300)
          );
        }

        // Zoom to fit all content after all instructions are drawn
        setTimeout(() => {
          editor.zoomToFit({ animation: { duration: 400 } });
        }, 200);
      } else {
        setError("No drawing instructions returned");
      }
    } catch (err) {
      console.error("Error fetching drawing instructions:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch drawing instructions"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with input and controls */}
      <div className="bg-white shadow-md p-4 z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., 'Photosynthesis', 'For Loop in Python')"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Drawing..." : "Draw"}
            </button>
            <button
              type="button"
              onClick={clearBoard}
              disabled={loading || isSpeaking}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Current narration display */}
          {currentNarration && (
            <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl animate-pulse">🎙️</span>
                <div>
                  <p className="text-sm font-semibold text-purple-900 mb-1">
                    AI Tutor is speaking:
                  </p>
                  <p className="text-purple-800 italic">{currentNarration}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error message display */}
          {error && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Loading indicator overlay */}
      {loading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-white px-6 py-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Generating drawing...</span>
          </div>
        </div>
      )}

      {/* Main whiteboard canvas */}
      <div className="flex-1 relative">
        <Tldraw onMount={handleMount} />
      </div>
    </div>
  );
}
