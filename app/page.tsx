"use client";

import { useState, useEffect } from "react";

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Image Generation API",
    version: "1.0.0",
    description: "Generate images using Nano Banana Pro (Gemini 3 Pro Image)",
  },
  servers: [{ url: "/" }],
  paths: {
    "/api/generate": {
      post: {
        summary: "Generate an image",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["prompt"],
                properties: {
                  prompt: {
                    type: "string",
                    description: "Image generation prompt",
                  },
                  model: {
                    type: "string",
                    default: "google/gemini-3-pro-image",
                  },
                  referenceImage: {
                    type: "string",
                    description: "Base64 encoded reference image",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Generated image",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    images: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          base64: { type: "string" },
                          mediaType: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "400": { description: "Bad request" },
          "500": { description: "Server error" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" },
    },
  },
};

export default function Home() {
  const [expanded, setExpanded] = useState<string | null>("post-/api/generate");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{openApiSpec.info.title}</h1>
          <p className="text-gray-400 mt-2">{openApiSpec.info.description}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-gray-800 rounded text-sm">
            v{openApiSpec.info.version}
          </span>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          <div className="bg-gray-900 rounded-lg p-4">
            <code className="text-green-400">
              Authorization: Bearer &lt;API_KEY&gt;
            </code>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Endpoints</h2>

          {Object.entries(openApiSpec.paths).map(([path, methods]) =>
            Object.entries(methods).map(([method, spec]: [string, any]) => {
              const id = `${method}-${path}`;
              const isOpen = expanded === id;

              return (
                <div
                  key={id}
                  className="bg-gray-900 rounded-lg mb-4 overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-800"
                  >
                    <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded uppercase">
                      {method}
                    </span>
                    <span className="font-mono text-lg">{path}</span>
                    <span className="text-gray-400 ml-auto">
                      {spec.summary}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-800 p-4 space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Request Body</h4>
                        <pre className="bg-gray-950 p-4 rounded overflow-x-auto text-sm">
                          {`{
  "prompt": "A sunset over mountains",
  "model": "google/gemini-3-pro-image",
  "referenceImage": "<base64>" // optional
}`}
                        </pre>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Parameters</h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-400">
                              <th className="pb-2">Name</th>
                              <th className="pb-2">Type</th>
                              <th className="pb-2">Required</th>
                              <th className="pb-2">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t border-gray-800">
                              <td className="py-2 font-mono text-blue-400">
                                prompt
                              </td>
                              <td className="py-2">string</td>
                              <td className="py-2">✓</td>
                              <td className="py-2 text-gray-400">
                                Image generation prompt
                              </td>
                            </tr>
                            <tr className="border-t border-gray-800">
                              <td className="py-2 font-mono text-blue-400">
                                model
                              </td>
                              <td className="py-2">string</td>
                              <td className="py-2"></td>
                              <td className="py-2 text-gray-400">
                                Default: google/gemini-3-pro-image
                              </td>
                            </tr>
                            <tr className="border-t border-gray-800">
                              <td className="py-2 font-mono text-blue-400">
                                referenceImage
                              </td>
                              <td className="py-2">string</td>
                              <td className="py-2"></td>
                              <td className="py-2 text-gray-400">
                                Base64 encoded reference image
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Response (200)</h4>
                        <pre className="bg-gray-950 p-4 rounded overflow-x-auto text-sm">
                          {`{
  "images": [
    {
      "base64": "<image_data>",
      "mediaType": "image/png"
    }
  ]
}`}
                        </pre>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">cURL Example</h4>
                        <pre className="bg-gray-950 p-4 rounded overflow-x-auto text-sm text-green-400">
                          {`curl -s -X POST ${baseUrl || "<URL>"}/api/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -d '{"prompt": "A sunset over mountains"}' \\
  | jq -r '.images[0].base64' | base64 -d > output.png`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
