export const maxDuration = 60;

interface GenerateRequest {
  prompt: string;
  model?: string;
  referenceImage?: string;
}

interface ChatMessage {
  role: string;
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  images?: Array<{
    type: string;
    image_url: { url: string };
  }>;
}

interface ChatResponse {
  choices: Array<{ message: ChatMessage }>;
  error?: { message: string };
}

export async function POST(request: Request) {
  try {
    // API Key authentication
    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");
    const expectedKey = process.env.IMAGE_API_KEY;

    if (!expectedKey) {
      return Response.json({ error: "IMAGE_API_KEY not configured" }, { status: 500 });
    }

    if (apiKey !== expectedKey) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();

    if (!body.prompt) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    const { prompt, model = "google/gemini-3-pro-image", referenceImage } = body;

    const gatewayKey = process.env.AI_GATEWAY_API_KEY;
    const baseURL = process.env.AI_GATEWAY_BASE_URL || "https://ai-gateway.vercel.sh/v1";

    let content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;

    if (referenceImage) {
      content = [
        {
          type: "image_url",
          image_url: {
            url: referenceImage.startsWith("data:")
              ? referenceImage
              : `data:image/png;base64,${referenceImage}`,
          },
        },
        {
          type: "text",
          text: `Using the provided image as reference, generate a new image: ${prompt}`,
        },
      ];
    } else {
      content = `Generate an image: ${prompt}`;
    }

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${gatewayKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    const images: Array<{ base64: string; mediaType: string }> = [];

    if (data.choices?.[0]?.message?.images) {
      for (const img of data.choices[0].message.images) {
        if (img.image_url?.url) {
          const match = img.image_url.url.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            images.push({ base64: match[2], mediaType: match[1] });
          }
        }
      }
    }

    if (images.length === 0) {
      throw new Error("No images generated");
    }

    return Response.json({ images });
  } catch (error) {
    console.error("Image generation error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
