import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, ArrowSquareOut, BookOpenText } from "@phosphor-icons/react";
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
        <div className="text-xs font-mono text-muted-foreground mb-1.5">{label}</div>
      )}
      <pre className="premium-code rounded-xl border p-4 pr-12 overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
        onClick={copy}
        aria-label="Copy code"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      </Button>
    </div>
  );
}

function EndpointBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  };
  return (
    <span
      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${colors[method] || colors["GET"]}`}
    >
      {method}
    </span>
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
    { "id": 12, "scientificName": "Amphiprion ocellaris" }
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
  "totalImages": 455,
  "totalSpecies": 333,
  "totalSources": 1,
  "endpoints": [
    "GET /fish/:width/:height"
  ]
}`,
    headers: {},
  },
];

export default function Docs() {
  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-ocean-pattern pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />
        <div className="container relative z-10 pt-28 pb-14 md:pt-32 md:pb-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpenText size={20} weight="bold" className="text-primary" />
              <span className="section-kicker">Documentation</span>
            </div>
            <h1 className="display-title text-5xl md:text-7xl">
              API documentation for visual fish data.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-8">
              IkanHub provides a simple REST API for fish images and metadata. No authentication required.
            </p>
          </div>
        </div>
      </section>

      <div className="container relative z-20 -mt-8 pb-12 md:-mt-10 md:pb-16 space-y-12">

      {/* Base URL */}
      <Card className="glass-panel rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock code={API_URL || "http://localhost:3001"} label="API Base URL" />
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            All URLs below are relative to this base URL. Replace with your deployment URL in production.
          </p>
        </CardContent>
      </Card>

      {/* Validation */}
      <Card className="glass-panel rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Validation Rules</CardTitle>
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
        <div className="divide-y divide-border/50 overflow-hidden rounded-3xl border border-border/50 bg-background/45 backdrop-blur">
          {endpoints.map((ep) => (
            <div key={ep.path} id={ep.path} className="scroll-mt-20 p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <EndpointBadge method={ep.method} />
                <h3 className="font-mono text-base md:text-lg font-semibold tracking-tight">
                  {ep.path}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{ep.desc}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1.5">Example</div>
                  <CodeBlock code={ep.example} />
                </div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1.5">Usage</div>
                  <CodeBlock code={ep.code} />
                </div>
              </div>

              {ep.response && (
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1.5">Response</div>
                  <CodeBlock code={ep.response} />
                </div>
              )}

              {ep.response === "Image/jpeg binary" && (
                <div className="rounded-xl bg-surface-subtle border border-border/30 p-4">
                  <div className="text-xs font-mono text-muted-foreground mb-2">Response headers</div>
                  <div className="space-y-1 text-xs font-mono text-muted-foreground">
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
            </div>
          ))}
        </div>
      </div>

      {/* Usage Guides */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">Usage Examples</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="glass-panel rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">HTML Image Tag</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`<img src="${API_URL}/fish/800/600" alt="Fish photo" />`}
              />
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">CSS Background</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`.element {
  background: url("${API_URL}/fish/800/600");
  background-size: cover;
}`}
              />
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">curl</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock code={`curl -o fish.jpg "${API_URL}/fish/800/600"`} />
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">JavaScript / fetch</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`const data = await fetch("${API_URL}/fish/random.json").then(r => r.json());
console.log(data.scientificName);`}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attribution */}
      <Card className="glass-panel rounded-3xl border-primary/20 bg-primary/5">
        <CardContent className="p-6 md:p-8 space-y-3 text-sm leading-relaxed">
          <h3 className="font-semibold text-base">Attribution</h3>
          <p className="text-muted-foreground">
            All images include metadata about the author and license. When using
            images from ikanhub, check the license metadata and provide
            appropriate attribution.
          </p>
          <p className="text-muted-foreground">
            Most images from FishBase are licensed under{" "}
            <strong>CC BY-NC 3.0</strong> or similar Creative Commons licenses.
            Always verify the license field in the metadata before commercial use.
          </p>
          <p className="pt-1">
            <Link to="/about" className="text-primary hover:underline inline-flex items-center gap-1">
              Learn more about our data sources
              <ArrowSquareOut size={12} weight="bold" />
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
