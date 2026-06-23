import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, ArrowSquareOut } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      {label && (
        <div className="text-sm font-mono text-muted-foreground mb-1">{label}</div>
      )}
      <pre className="rounded-lg bg-muted p-4 pr-12 overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copy}
        aria-label="Copy code"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      </Button>
    </div>
  );
}

const endpoints = [
  {
    method: "GET",
    path: "/fish/:width/:height",
    desc: "Returns a random fish image resized to the specified width and height.",
    example: `${API_URL}/fish/800/600`,
    code: `curl -o fish.jpg "${API_URL}/fish/800/600"`,
    response: "Image/jpeg binary",
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
      "X-Ikanhub-Image-Id": "42",
      "X-Ikanhub-Species": "pteragogus-turdus",
    },
  },
  {
    method: "GET",
    path: "/fish/:size",
    desc: "Returns a random square fish image.",
    example: `${API_URL}/fish/400`,
    code: `<img src="${API_URL}/fish/400" alt="Fish photo" width="400" height="400" />`,
    response: "Image/jpeg binary",
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  },
  {
    method: "GET",
    path: "/fish/id/:id/:width/:height",
    desc: "Returns a specific fish image by ID, resized.",
    example: `${API_URL}/fish/id/12/800/600`,
    code: `fetch("${API_URL}/fish/id/12/800/600")`,
    response: "Image/jpeg binary",
    headers: {},
  },
  {
    method: "GET",
    path: "/fish/random.json",
    desc: "Returns JSON metadata for a random fish image.",
    example: `${API_URL}/fish/random.json`,
    code: `curl "${API_URL}/fish/random.json" | jq`,
    response: `{
  "id": 42,
  "scientificName": "Pteragogus turdus",
  "commonName": "Thrush wrasse",
  "slug": "pteragogus-turdus",
  "author": "John E. Randall",
  "locality": "Philippines",
  "license": "CC BY-NC 3.0",
  "width": 1200,
  "height": 800,
  "url": "/fish/id/42/800/600",
  "metadataUrl": "/fish/id/42.json"
}`,
    headers: {},
  },
  {
    method: "GET",
    path: "/fish/id/:id.json",
    desc: "Returns JSON metadata for a specific fish image.",
    example: `${API_URL}/fish/id/12.json`,
    code: `fetch("${API_URL}/fish/id/12.json").then(r => r.json())`,
    response: `{
  "id": 12,
  "scientificName": "Amphiprion ocellaris",
  "commonName": "Clownfish",
  "slug": "amphiprion-ocellaris",
  "author": "John E. Randall",
  "locality": "Indonesia",
  "license": "CC BY-NC 3.0",
  "width": 1600,
  "height": 1200,
  "url": "/fish/id/12/800/600",
  "metadataUrl": "/fish/id/12.json"
}`,
    headers: {},
  },
  {
    method: "GET",
    path: "/fish/species/:slug/:width/:height",
    desc: "Returns a random image from a specific species.",
    example: `${API_URL}/fish/species/amphiprion-ocellaris/800/600`,
    code: `<img src="${API_URL}/fish/species/amphiprion-ocellaris/800/600" alt="Clownfish" />`,
    response: "Image/jpeg binary",
    headers: {},
  },
  {
    method: "GET",
    path: "/api/search?q=:query",
    desc: "Search images by scientific name, common name, locality, or author.",
    example: `${API_URL}/api/search?q=wrasse`,
    code: `curl "${API_URL}/api/search?q=clownfish" | jq`,
    response: `{
  "query": "clownfish",
  "count": 5,
  "results": [
    { "id": 12, "scientificName": "Amphiprion ocellaris", ... }
  ]
}`,
    headers: {},
  },
  {
    method: "GET",
    path: "/api/stats",
    desc: "Returns service statistics.",
    example: `${API_URL}/api/stats`,
    code: `fetch("${API_URL}/api/stats").then(r => r.json())`,
    response: `{
  "totalImages": 500,
  "totalSpecies": 120,
  "totalSources": 1,
  "endpoints": [
    "GET /fish/:width/:height",
    "GET /fish/:size"
  ]
}`,
    headers: {},
  },
];

export default function Docs() {
  return (
    <div className="container py-12 md:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">API Documentation</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Ikanhub provides a simple REST API for fish placeholder images. No
          authentication required. All endpoints are free and open.
        </p>
      </div>

      {/* Base URL */}
      <Card>
        <CardHeader>
          <CardTitle>Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock code={API_URL || "http://localhost:3001"} label="API Base URL" />
          <p className="text-sm text-muted-foreground mt-2">
            All URLs below are relative to this base URL.
          </p>
        </CardContent>
      </Card>

      {/* Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            Width and height must be integers between{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">1</code>{" "}
            and{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">3000</code>.
          </p>
          <p>
            Invalid dimensions return a{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">400</code>{" "}
            JSON error.
          </p>
          <p>
            Non-existent IDs or species return a{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">404</code>{" "}
            JSON error.
          </p>
          <p>
            Missing image files on disk are skipped automatically.
          </p>
          <CodeBlock
            code={`{
  "error": "Width must be between 1 and 3000"
}`}
          />
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">Endpoints</h2>
        {endpoints.map((ep) => (
          <Card key={ep.path} id={ep.path} className="scroll-mt-20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-primary/10 text-primary">
                  {ep.method}
                </span>
                <CardTitle className="font-mono text-lg">{ep.path}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{ep.desc}</p>

              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1">Example</div>
                <CodeBlock code={ep.example} />
              </div>

              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1">Usage</div>
                <CodeBlock code={ep.code} />
              </div>

              {ep.response && (
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1">Response</div>
                  <CodeBlock code={ep.response} />
                </div>
              )}

              {ep.response === "Image/jpeg binary" && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-xs font-mono text-muted-foreground mb-2">Headers</div>
                  <div className="space-y-1 text-xs font-mono">
                    <div>Content-Type: image/jpeg</div>
                    <div>Cache-Control: public, max-age=86400</div>
                    {Object.entries(ep.headers).map(([key, value]) => (
                      <div key={key}>
                        {key}: {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Guides */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">Usage Examples</h2>

        <Card>
          <CardHeader>
            <CardTitle>HTML Image Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`<img src="${API_URL}/fish/800/600" alt="Fish photo" />`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSS Background</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`.element {
  background: url("${API_URL}/fish/800/600");
  background-size: cover;
  background-position: center;
}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>curl</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock code={`curl -o fish.jpg "${API_URL}/fish/800/600"`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JavaScript / fetch</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`const data = await fetch("${API_URL}/fish/random.json").then(r => r.json());
console.log(data.scientificName);`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Attribution */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Attribution</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <p>
            All images include metadata about the author and license. When using
            images from ikanhub, check the license metadata and provide
            appropriate attribution.
          </p>
          <p>
            Most images from FishBase are licensed under{" "}
            <strong>CC BY-NC 3.0</strong> or similar Creative Commons licenses.
            Always verify the license field in the metadata before commercial use.
          </p>
          <p>
            <Link to="/about" className="text-primary hover:underline inline-flex items-center gap-1">
              Learn more about our data sources
              <ArrowSquareOut size={12} />
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
