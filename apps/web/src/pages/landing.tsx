import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shuffle,
  ArrowsOut,
  Tag,
  Code,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  ArrowRight,
  Image,
} from "@phosphor-icons/react";
import { formatNumber } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Landing() {
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("600");
  const [copied, setCopied] = useState(false);
  const [liveImgKey, setLiveImgKey] = useState(0);
  const [stats, setStats] = useState({
    totalImages: 0,
    totalSpecies: 0,
    totalSources: 0,
    endpoints: [] as string[],
  });

  useEffect(() => {
    fetch(`${API_URL}/api/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const generatedUrl =
    width && height ? `/fish/${width}/${height}` : "/fish/800/600";

  const fullUrl = `${API_URL}${generatedUrl}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const refreshPreview = () => setLiveImgKey((k) => k + 1);

  const features = [
    {
      icon: Shuffle,
      title: "Random fish images",
      desc: "Get a random fish image at any size with a single URL. No registration required.",
    },
    {
      icon: ArrowsOut,
      title: "Resize and crop on demand",
      desc: "Specify any width and height up to 3000px. Images are center-cropped and served as JPEG.",
    },
    {
      icon: Tag,
      title: "Species-based URLs",
      desc: "Request images by species slug for consistent results from the same scientific group.",
    },
    {
      icon: Code,
      title: "Metadata endpoint",
      desc: "Returns JSON metadata including scientific name, author, locality, and license.",
    },
    {
      icon: ShieldCheck,
      title: "Attribution-ready",
      desc: "License information is preserved. Credit authors properly in your projects.",
    },
  ];

  const codeExamples = [
    {
      label: "HTML",
      code: `<img src="${fullUrl}" alt="Fish photo" width="${width || 800}" height="${height || 600}" />`,
    },
    {
      label: "CSS",
      code: `.hero {
  background: url("${fullUrl}");
  background-size: cover;
}`,
    },
    {
      label: "curl",
      code: `curl -o fish.jpg "${fullUrl}"`,
    },
    {
      label: "JavaScript",
      code: `const data = await fetch("${API_URL}/fish/random.json")
  .then(r => r.json());
console.log(data.scientificName);`,
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="container pt-24 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-xs px-4 py-1.5 rounded-full font-mono tracking-wider uppercase">
              Free fish placeholder image API
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none text-balance">
              Beautiful fish placeholder images for{" "}
              <span className="text-primary">developers</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Generate random fish images by size, species, or ID.
              Simple URLs, fast responses, and metadata included.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/docs">
                  Try the API
                  <ArrowRight size={16} weight="bold" className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/explore">
                  <Image size={16} className="mr-2" />
                  Explore Images
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="container -mt-8 relative z-10">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Try it now</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                      Width
                    </label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      min="1"
                      max="3000"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                      Height
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      min="1"
                      max="3000"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    Generated URL
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm font-mono truncate">
                      {fullUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(fullUrl)}
                      aria-label="Copy URL"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={refreshPreview}>
                  <Shuffle size={14} weight="bold" className="mr-2" />
                  Randomize
                </Button>
              </div>
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <img
                  key={liveImgKey}
                  src={`${fullUrl}?t=${Date.now()}`}
                  alt="Fish placeholder preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23eaeaea' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%23999' font-size='14' font-family='monospace'%3Eno image loaded%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats */}
      <section className="container py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Images", value: formatNumber(stats.totalImages), icon: Image },
            { label: "Species", value: formatNumber(stats.totalSpecies), icon: Tag },
            { label: "Source Datasets", value: formatNumber(stats.totalSources || 1), icon: ShieldCheck },
            { label: "API Endpoints", value: String(stats.endpoints.length || 8), icon: Terminal },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="p-6">
                <stat.icon size={20} weight="bold" className="mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold font-mono">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features - Asymmetric Bento Grid */}
      <section className="container pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            A simple API that does exactly what you expect. No bloat, no surprises.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Large cell */}
          <Card className="md:col-span-2 md:row-span-2">
            <CardContent className="p-8 h-full flex flex-col justify-between">
              <div>
                <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
                  <Shuffle size={20} weight="bold" className="text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Random fish images</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  Get a random fish image at any size with a single URL.
                  No registration, no API keys, no authentication. Just a URL
                  that returns a JPEG.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t text-sm text-muted-foreground font-mono">
                GET /fish/800/600
              </div>
            </CardContent>
          </Card>
          {/* Small cells */}
          <Card>
            <CardContent className="p-6">
              <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                <ArrowsOut size={18} weight="bold" className="text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Resize on demand</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Specify any width and height up to 3000px. Center-cropped JPEG output at quality 85.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                <Tag size={18} weight="bold" className="text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Species-based URLs</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Consistent results from the same species using slugs in the URL path.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                <Code size={18} weight="bold" className="text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Metadata endpoint</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Full JSON metadata: scientific name, author, locality, and license.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                <ShieldCheck size={18} weight="bold" className="text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Attribution-ready</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                License and author information preserved. Credit properly.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Code Examples */}
      <section className="border-t py-20">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Simple integration</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Use ikanhub images in your projects with nothing more than a URL.
            </p>
          </div>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6">
              <Tabs defaultValue="HTML">
                <TabsList className="mb-4">
                  {codeExamples.map((ex) => (
                    <TabsTrigger key={ex.label} value={ex.label}>
                      {ex.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {codeExamples.map((ex) => (
                  <TabsContent key={ex.label} value={ex.label}>
                    <div className="relative group">
                      <pre className="rounded-lg bg-muted p-4 overflow-x-auto text-sm font-mono">
                        <code>{ex.code}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(ex.code)}
                        aria-label="Copy code"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Developer Examples - Horizontal row with borders */}
      <section className="container py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Developer-friendly by design</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Simple, predictable URLs for every use case.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x max-w-4xl mx-auto border rounded-xl">
          {[
            {
              title: "Random image by size",
              code: "GET /fish/800/600",
              desc: "Returns a random fish image resized to the specified dimensions.",
            },
            {
              title: "Specific image by ID",
              code: "GET /fish/id/12/800/600",
              desc: "Returns a specific image by ID, resized to the requested dimensions.",
            },
            {
              title: "Random metadata",
              code: "GET /fish/random.json",
              desc: "Returns JSON metadata for a random image, including all attribution fields.",
            },
          ].map((ex, i) => (
            <div key={ex.title} className="p-6 space-y-3">
              <h3 className="font-semibold">{ex.title}</h3>
              <pre className="rounded-lg bg-muted px-3 py-2 text-sm font-mono">
                <code>{ex.code}</code>
              </pre>
              <p className="text-sm text-muted-foreground">{ex.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="container py-20">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Start using ikanhub today</h2>
              <p className="text-primary-foreground/80 max-w-lg mx-auto leading-relaxed">
                No registration required. Just use the URLs directly in your HTML,
                CSS, or applications.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button asChild variant="secondary" size="lg">
                  <Link to="/docs">Read the docs</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link to="/explore">Browse images</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
