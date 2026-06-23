import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  Check,
  ArrowSquareOut,
  BookOpenText,
  Shuffle,
  Lock,
  Image,
  Code,
  Question,
} from "@phosphor-icons/react";
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
      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
        colors[method] || colors["GET"]
      }`}
    >
      {method}
    </span>
  );
}

type BadgeVariant = "random" | "cache" | "json" | "image";

function getBadgeClassName(variant: BadgeVariant): string {
  if (variant === "random") {
    return "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-500/20";
  }
  if (variant === "cache") {
    return "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border-sky-500/20";
  }
  if (variant === "json") {
    return "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 border-violet-500/20";
  }
  return "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/20";
}

const badgeIcon: Record<BadgeVariant, React.ReactNode> = {
  random: <Shuffle size={10} weight="bold" />,
  cache: <Lock size={10} weight="bold" />,
  json: <Code size={10} weight="bold" />,
  image: <Image size={10} weight="bold" />,
};

const badgeLabel: Record<BadgeVariant, string> = {
  random: "Random",
  cache: "Cache Friendly",
  json: "JSON",
  image: "Image",
};

function TypeBadge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeClassName(variant)}`}
    >
      {badgeIcon[variant]}
      {label}
    </span>
  );
}

type EndpointDesc = {
  method: string;
  path: string;
  desc: string;
  example: string;
  code: string;
  response: string;
  cacheType: "random" | "deterministic";
  typeBadges: BadgeVariant[];
  responseHeaders: Record<string, string>;
};

const endpoints: EndpointDesc[] = [
  {
    method: "GET",
    path: "/fish/:width/:height",
    desc: "Returns a random fish image resized to the specified width and height. Each request may return a different image.",
    example: `${API_URL}/fish/800/600`,
    code: `curl -o fish.jpg "${API_URL}/fish/800/600"`,
    response: "Image/jpeg binary",
    cacheType: "random",
    typeBadges: ["random", "image"],
    responseHeaders: {
      "Content-Type": "image/jpeg",
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "X-IkanHub-Cache": "no-cache",
    },
  },
  {
    method: "GET",
    path: "/fish/:size",
    desc: "Returns a random square fish image. Each request may return a different image.",
    example: `${API_URL}/fish/400`,
    code: `<img src="${API_URL}/fish/400" alt="Fish photo" width="400" height="400" />`,
    response: "Image/jpeg binary",
    cacheType: "random",
    typeBadges: ["random", "image"],
    responseHeaders: {
      "Content-Type": "image/jpeg",
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "X-IkanHub-Cache": "no-cache",
    },
  },
  {
    method: "GET",
    path: "/fish/random.json",
    desc: "Returns JSON metadata for a random fish image. Each request may return a different result.",
    example: `${API_URL}/fish/random.json`,
    code: `curl "${API_URL}/fish/random.json" | jq`,
    response: JSON.stringify(
      {
        id: 42,
        scientificName: "Pteragogus turdus",
        commonName: "Thrush wrasse",
        slug: "pteragogus-turdus",
        author: "John E. Randall",
        locality: "Philippines",
        license: "CC BY-NC 3.0",
        url: "/fish/id/42/800/600",
        metadataUrl: "/fish/id/42.json",
      },
      null,
      2
    ),
    cacheType: "random",
    typeBadges: ["random", "json"],
    responseHeaders: {
      "Content-Type": "application/json",
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "X-IkanHub-Cache": "no-cache",
    },
  },
  {
    method: "GET",
    path: "/fish/id/:id/:width/:height",
    desc: "Returns a specific fish image by ID, resized to the requested dimensions. The same URL always returns the same image.",
    example: `${API_URL}/fish/id/12/800/600`,
    code: `fetch("${API_URL}/fish/id/12/800/600")`,
    response: "Image/jpeg binary",
    cacheType: "deterministic",
    typeBadges: ["cache", "image"],
    responseHeaders: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-IkanHub-Cache": "long-cache",
    },
  },
  {
    method: "GET",
    path: "/fish/id/:id.json",
    desc: "Returns JSON metadata for a specific fish image by ID.",
    example: `${API_URL}/fish/id/12.json`,
    code: `fetch("${API_URL}/fish/id/12.json").then(r => r.json())`,
    response: JSON.stringify(
      {
        id: 12,
        scientificName: "Amphiprion ocellaris",
        commonName: "Clownfish",
        slug: "amphiprion-ocellaris",
        author: "John E. Randall",
        locality: "Indonesia",
        license: "CC BY-NC 3.0",
        url: "/fish/id/12/800/600",
        metadataUrl: "/fish/id/12.json",
      },
      null,
      2
    ),
    cacheType: "deterministic",
    typeBadges: ["cache", "json"],
    responseHeaders: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-IkanHub-Cache": "long-cache",
    },
  },
  {
    method: "GET",
    path: "/fish/species/:slug/:width/:height",
    desc: "Returns a random image from a specific species. Although the image selection is random, the species is fixed and the response is cacheable.",
    example: `${API_URL}/fish/species/amphiprion-ocellaris/800/600`,
    code: `<img src="${API_URL}/fish/species/amphiprion-ocellaris/800/600" alt="Clownfish" />`,
    response: "Image/jpeg binary",
    cacheType: "deterministic",
    typeBadges: ["cache", "image"],
    responseHeaders: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-IkanHub-Cache": "long-cache",
    },
  },
  {
    method: "GET",
    path: "/api/search?q=:query",
    desc: "Search images by scientific name, common name, locality, or author. Results are deterministic for the same query.",
    example: `${API_URL}/api/search?q=wrasse`,
    code: `curl "${API_URL}/api/search?q=clownfish" | jq`,
    response: JSON.stringify(
      {
        query: "clownfish",
        count: 5,
        results: [
          { id: 12, scientificName: "Amphiprion ocellaris" },
        ],
      },
      null,
      2
    ),
    cacheType: "deterministic",
    typeBadges: ["json"],
    responseHeaders: {
      "Content-Type": "application/json",
    },
  },
  {
    method: "GET",
    path: "/api/stats",
    desc: "Returns service statistics including total image count, species count, and available endpoints.",
    example: `${API_URL}/api/stats`,
    code: `fetch("${API_URL}/api/stats").then(r => r.json())`,
    response: JSON.stringify(
      {
        totalImages: 455,
        totalSpecies: 333,
        totalSources: 1,
        endpoints: ["GET /fish/:width/:height"],
      },
      null,
      2
    ),
    cacheType: "deterministic",
    typeBadges: ["json"],
    responseHeaders: {
      "Content-Type": "application/json",
    },
  },
];

const faqs = [
  {
    q: "Why do I sometimes receive the same image?",
    a: (
      <div className="space-y-3">
        <p>
          Your browser, CDN, reverse proxy, or hosting platform (such as aaPanel,
          Cloudflare, or Nginx) may cache image responses. This is normal behavior
          for intermediate proxies — they assume the same URL always returns the
          same content.
        </p>
        <p>
          Because IkanHub random endpoints serve a different image on each request,
          caching layers can interfere with freshness.
        </p>
        <p className="font-semibold">How to fix it:</p>
        <p>
          Append a unique query parameter to each request to bypass the cache.
          For example, use the current timestamp:
        </p>
        <CodeBlock
          code={`<!-- Fresh random image every time -->
<img src="${API_URL}/fish/800/600?v=1712345678901" />`}
        />
        <CodeBlock
          code={`// JavaScript
const img = new Image();
img.src = "${API_URL}/fish/800/600?v=" + Date.now();`}
        />
      </div>
    ),
  },
  {
    q: "What headers control caching?",
    a: (
      <div className="space-y-3">
        <p>Random endpoints return:</p>
        <CodeBlock
          code={`Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
Pragma: no-cache
Expires: 0
Surrogate-Control: no-store
X-IkanHub-Cache: no-cache`}
        />
        <p>Deterministic endpoints return:</p>
        <CodeBlock
          code={`Cache-Control: public, max-age=31536000, immutable
X-IkanHub-Cache: long-cache`}
        />
      </div>
    ),
  },
  {
    q: "Can I use these images in production?",
    a: (
      <p>
        Yes. All images include metadata about the author and license. Check the{" "}
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
          license
        </code>{" "}
        field — most are{" "}
        <strong>CC BY-NC 3.0</strong> or similar. Always verify before commercial use.
      </p>
    ),
  },
  {
    q: "Do I need an API key?",
    a: <p>No. IkanHub is open and does not require authentication.</p>,
  },
];

function EndpointCard({ ep }: { ep: EndpointDesc }) {
  const [showImage, setShowImage] = useState(false);
  const cacheBuster = Date.now();

  return (
    <div id={ep.path} className="scroll-mt-20 p-6 md:p-8 space-y-5">
      {/* Heading */}
      <div className="flex flex-wrap items-center gap-2.5">
        <EndpointBadge method={ep.method} />
        <h3 className="font-mono text-base md:text-lg font-semibold tracking-tight">
          {ep.path}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 ml-auto md:ml-0">
          {ep.typeBadges.map((v) => (
            <TypeBadge key={v} label={badgeLabel[v]} variant={v} />
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{ep.desc}</p>

      {/* Cache type note */}
      {ep.cacheType === "random" && (
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
          <strong>Responses may vary between requests.</strong>{" "}
          For maximum freshness behind proxies, append{" "}
          <code className="font-mono text-[11px] bg-amber-500/10 px-1.5 py-0.5 rounded">
            ?v=timestamp
          </code>{" "}
          to the URL.
        </div>
      )}
      {ep.cacheType === "deterministic" && (
        <div className="rounded-xl border border-sky-500/15 bg-sky-500/5 px-4 py-3 text-xs text-sky-800 dark:text-sky-200 leading-relaxed">
          <strong>Same URL always returns the same resource.</strong>{" "}
          Safe to cache in browsers, CDNs, and reverse proxies.
        </div>
      )}

      {/* Random endpoint: preview image with cache busting */}
      {ep.cacheType === "random" && ep.response === "Image/jpeg binary" && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-xs font-mono text-muted-foreground">Preview</div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] gap-1 rounded-lg"
              onClick={() => setShowImage((s) => !s)}
            >
              {showImage ? "Hide" : "Show"} preview
            </Button>
          </div>
          {showImage && (
            <div className="overflow-hidden rounded-xl bg-muted border border-border/40">
              <img
                src={`${ep.example}?v=${cacheBuster}`}
                alt="Fish preview"
                className="w-full h-56 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='300'%3E%3Crect fill='%2306283D' width='800' height='300'/%3E%3C/svg%3E";
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Code examples */}
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

      {/* Response */}
      {ep.response && (
        <div>
          <div className="text-xs font-mono text-muted-foreground mb-1.5">Response</div>
          <CodeBlock code={ep.response} />
        </div>
      )}

      {/* Response headers */}
      {Object.keys(ep.responseHeaders).length > 0 && (
        <div className="rounded-xl bg-surface-subtle border border-border/30 p-4">
          <div className="text-xs font-mono text-muted-foreground mb-2">Response headers</div>
          <div className="space-y-1 text-xs font-mono text-muted-foreground">
            {Object.entries(ep.responseHeaders).map(([key, value]) => (
              <div key={key}>
                {key}: {value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
            <p>Missing image files on disk are skipped automatically.</p>
            <CodeBlock
              code={`{
  "error": "Width must be between 1 and 3000"
}`}
            />
          </CardContent>
        </Card>

        {/* Caching section */}
        <Card className="glass-panel rounded-3xl border-amber-500/15">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Shuffle size={20} weight="bold" />
            </div>
            <div>
              <CardTitle className="text-lg">Caching and Random Images</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Some hosting providers, browsers, and reverse proxies may cache image
              responses. Because of this, requests to random endpoints may
              occasionally return the same image.
            </p>
            <p className="font-semibold">
              For guaranteed randomness, append a unique query parameter:
            </p>
            <CodeBlock code={`${API_URL}/fish/800/600?v=1712345678901`} />
            <div className="rounded-xl border border-border/40 bg-muted/40 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick reference
              </p>
              <div className="grid gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <TypeBadge label="Random" variant="random" />
                  <span className="text-muted-foreground">
                    Responses may vary between requests. Cache busting recommended.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TypeBadge label="Cache Friendly" variant="cache" />
                  <span className="text-muted-foreground">
                    Same URL always returns the same resource. Safe to cache.
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight">Endpoints</h2>
          <div className="divide-y divide-border/50 overflow-hidden rounded-3xl border border-border/50 bg-background/45 backdrop-blur">
            {endpoints.map((ep) => (
              <EndpointCard key={ep.path} ep={ep} />
            ))}
          </div>
        </div>

        {/* Fresh random image examples */}
        <Card className="glass-panel rounded-3xl border-amber-500/15">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Shuffle size={20} weight="bold" />
            </div>
            <div>
              <CardTitle className="text-lg">Fresh Random Image Examples</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              For production use behind proxies or CDNs, append a cache-busting
              query parameter to guarantee a fresh random image on every request.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1.5">Basic random image</div>
                <CodeBlock
                  code={`<img src="${API_URL}/fish/800/600" alt="Fish photo" />`}
                />
              </div>
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1.5">Fresh random image</div>
                <CodeBlock
                  code={`<img src="${API_URL}/fish/800/600?v=1712345678901" alt="Fish photo" />`}
                />
              </div>
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1.5">JavaScript</div>
                <CodeBlock
                  code={`const imageUrl = "${API_URL}/fish/800/600?v=" + Date.now();`}
                />
              </div>
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1.5">curl (bypass proxy cache)</div>
                <CodeBlock
                  code={`curl -o fish.jpg "${API_URL}/fish/800/600?v=$(date +%s)"`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* FAQ */}
        <div className="space-y-8" id="faq">
          <div className="flex items-center gap-2">
            <Question size={20} weight="bold" className="text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="divide-y divide-border/50 overflow-hidden rounded-3xl border border-border/50 bg-background/45 backdrop-blur">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-6 md:p-8 space-y-3">
                <h3 className="font-semibold text-base">{faq.q}</h3>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </div>
            ))}
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
              <Link
                to="/about"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
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
