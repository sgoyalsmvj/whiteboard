"use client";

import React, { useState, useCallback } from "react";
import { Tldraw, Editor, createShapeId, toRichText } from "tldraw";
import "tldraw/tldraw.css";

// Define types for API response instructions
interface DrawTextInstruction {
  type: "drawText";
  text: string;
  position: [number, number];
}

interface DrawArrowInstruction {
  type: "drawArrow";
  from: [number, number];
  to: [number, number];
}

interface DrawShapeInstruction {
  type: "drawTriangle" | "drawLine" | "drawCircle" | "drawRectangle";
  points: [number, number][];
}

interface ShowImageInstruction {
  type: "showImage";
  url: string;
  position: [number, number];
  size: [number, number];
}

type DrawInstruction =
  | DrawTextInstruction
  | DrawArrowInstruction
  | DrawShapeInstruction
  | ShowImageInstruction;

interface ApiResponse {
  instructions: DrawInstruction[];
}

export default function AIDrivenWhiteboard() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, [editor]);

  // Execute a single drawing instruction on the canvas
  const executeInstruction = useCallback(
    (instruction: DrawInstruction, index: number) => {
      if (!editor) return;

      try {
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
                color: "blue",
              },
            });
            break;
          }

          case "drawTriangle":
          case "drawLine": {
            // Create a draw shape (freehand-style) using provided points
            if (instruction.points.length < 2) break;

            const drawId = createShapeId();
            const segments: any[] = [];

            // Convert points array into draw segments
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

            // Close the shape for triangles
            if (instruction.type === "drawTriangle") {
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
            }

            editor.createShape({
              id: drawId,
              type: "draw",
              x: 0,
              y: 0,
              props: {
                segments,
                color: "violet",
                size: "m",
                isClosed: instruction.type === "drawTriangle",
              },
            });
            break;
          }

          case "drawCircle": {
            // Create a geo shape (ellipse) at the center of provided points
            if (instruction.points.length === 0) break;

            // Calculate bounding box for the circle
            const xs = instruction.points.map((p) => p[0]);
            const ys = instruction.points.map((p) => p[1]);
            const minX = Math.min(...xs);
            const minY = Math.min(...ys);
            const maxX = Math.max(...xs);
            const maxY = Math.max(...ys);

            const circleId = createShapeId();
            editor.createShape({
              id: circleId,
              type: "geo",
              x: minX,
              y: minY,
              props: {
                geo: "ellipse",
                w: maxX - minX,
                h: maxY - minY,
                color: "green",
              },
            });
            break;
          }

          case "drawRectangle": {
            // Create a rectangular geo shape
            if (instruction.points.length < 2) break;

            const xs = instruction.points.map((p) => p[0]);
            const ys = instruction.points.map((p) => p[1]);
            const minX = Math.min(...xs);
            const minY = Math.min(...ys);
            const maxX = Math.max(...xs);
            const maxY = Math.max(...ys);

            const rectId = createShapeId();
            editor.createShape({
              id: rectId,
              type: "geo",
              x: minX,
              y: minY,
              props: {
                geo: "rectangle",
                w: maxX - minX,
                h: maxY - minY,
                color: "orange",
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

      // Execute drawing instructions one by one with animation
      if (data.instructions && data.instructions.length > 0) {
        // Execute each instruction with a delay for animation effect
        for (let i = 0; i < data.instructions.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay between each step
          executeInstruction(data.instructions[i], i);
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
              disabled={loading}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>

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
