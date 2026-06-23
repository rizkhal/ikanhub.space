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
  Terminal,
  Copy,
  Check,
  ArrowRight,
  Image,
  Fish,
  Clock,
  Database,
  Globe,
  FishSimple,
  Waveform,
} from "@phosphor-icons/react";

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
  const [randomFish, setRandomFish] = useState<{
    scientificName: string;
    commonName: string | null;
    url: string;
  } | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/fish/random.json`)
      .then((r) => r.json())
      .then(setRandomFish)
      .catch(() => {});
  }, [liveImgKey]);

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
      <section className="relative overflow-hidden bg-hero-gradient">
        {/* Subtle ocean pattern */}
        <div className="absolute inset-0 bg-ocean-pattern pointer-events-none" />
        <div className="container pt-20 pb-24 md:pt-24 md:pb-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="space-y-8">
              <Badge
                variant="secondary"
                className="text-xs px-4 py-1.5 rounded-full font-mono tracking-wider inline-flex"
              >
                <Waveform size={12} className="mr-1.5" weight="fill" />
                Free fish placeholder image API
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.1] text-balance">
                Beautiful fish placeholder images for{" "}
                <span className="text-primary">developers</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Generate random fish images by size, species, or ID.
                Simple URLs, fast responses, and metadata included.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="rounded-xl h-12 px-6">
                  <Link to="/docs">
                    Try the API
                    <ArrowRight size={16} weight="bold" className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl h-12 px-6">
                  <Link to="/explore">
                    <Image size={16} className="mr-2" />
                    Explore Images
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Interactive preview */}
            <div className="relative">
              <Card className="overflow-hidden shadow-glow-lg border-border/50">
                <CardContent className="p-4 md:p-6 space-y-4">
                  {/* Image preview */}
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted relative group">
                    <img
                      key={liveImgKey}
                      src={`${fullUrl}?t=${Date.now()}`}
                      alt="Fish placeholder preview"
                      className="w-full h-full object-cover transition-opacity duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23222' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%23666' font-size='14' font-family='monospace'%3Eno image loaded%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    {randomFish && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs font-medium">
                          <em>{randomFish.scientificName}</em>
                        </p>
                        {randomFish.commonName && (
                          <p className="text-white/70 text-xs">{randomFish.commonName}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                        Width
                      </label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        min="1"
                        max="3000"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                        Height
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        min="1"
                        max="3000"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      />
                    </div>
                  </div>

                  {/* URL display */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                      Generated URL
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm font-mono truncate border border-border/30">
                        {fullUrl}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(fullUrl)}
                        aria-label="Copy URL"
                        className="shrink-0 rounded-lg"
                      >
                        {copied ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={refreshPreview}
                      className="rounded-lg"
                    >
                      <Shuffle size={14} weight="bold" className="mr-2" />
                      Randomize
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(fullUrl)}
                      className="rounded-lg"
                    >
                      <Copy size={14} className="mr-2" />
                      Copy URL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative -mt-8 z-20">
        <div className="container">
          <Card className="shadow-card-glow border-border/50">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-border/50">
                {[
                  { label: "Total Images", value: stats.totalImages, icon: Image },
                  { label: "Species", value: stats.totalSpecies, icon: Fish },
                  {
                    label: "Source Datasets",
                    value: stats.totalSources || 1,
                    icon: Database,
                  },
                  {
                    label: "API Endpoints",
                    value: stats.endpoints.length || 8,
                    icon: Terminal,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="text-center px-2 first:pl-0 last:pr-0">
                    <stat.icon
                      size={16}
                      weight="bold"
                      className="mx-auto mb-1.5 text-primary"
                    />
                    <div className="text-2xl md:text-3xl font-bold font-mono tracking-tight">
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features - Asymmetric Bento Grid */}
      <section className="container py-20 md:py-28">
        <div className="max-w-3xl mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            A simple API that does exactly what you expect. No bloat, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {/* Large feature card with image */}
          <Card className="md:col-span-2 md:row-span-2 overflow-hidden group card-elevate">
            <div className="relative h-48 md:h-56 overflow-hidden bg-muted">
              <img
                src={`${API_URL}/fish/1200/500?t=features`}
                alt="Random fish showcase"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
            <CardContent className="p-6 md:p-8 space-y-4">
              <div className="rounded-xl bg-primary/10 w-11 h-11 flex items-center justify-center">
                <Shuffle size={22} weight="bold" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Random fish images</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get a random fish image at any size with a single URL.
                  No registration, no API keys, no authentication.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-2 text-sm">
                <code className="rounded-lg bg-muted px-3 py-1.5 text-sm font-mono border border-border/30">
                  GET /fish/800/600
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={() => copyToClipboard(`${API_URL}/fish/800/600`)}
                  aria-label="Copy example URL"
                >
                  <Copy size={12} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resize on demand */}
          <Card className="card-elevate">
            <CardContent className="p-6 space-y-4">
              <div className="rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center">
                <ArrowsOut size={18} weight="bold" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Resize on demand</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Any width and height up to 3000px. Center-cropped JPEG at quality 85.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Species URLs */}
          <Card className="card-elevate">
            <CardContent className="p-6 space-y-4">
              <div className="rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center">
                <FishSimple size={18} weight="bold" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Species-based URLs</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Consistent results from the same species using slugs.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="card-elevate">
            <CardContent className="p-6 space-y-4">
              <div className="rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center">
                <Code size={18} weight="bold" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Metadata endpoint</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Full JSON with scientific name, author, locality, and license.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Attribution */}
          <Card className="card-elevate">
            <CardContent className="p-6 space-y-4">
              <div className="rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center">
                <Globe size={18} weight="bold" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Attribution-ready</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  License and author information preserved. Credit properly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fast */}
          <Card className="card-elevate">
            <CardContent className="p-6 space-y-4">
              <div className="rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center">
                <Clock size={18} weight="bold" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Fast responses</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Resized images cached for 24 hours. Near-instant repeats.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Species Showcase */}
      <section className="border-t border-border/50 bg-surface-subtle">
        <div className="container py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Explore species
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Browse {stats.totalSpecies.toLocaleString()} species from our curated collection.
            </p>
          </div>
          <ShowcaseGrid />
        </div>
      </section>

      {/* Code Examples - Interactive playground */}
      <section className="container py-20 md:py-28">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Simple integration
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Use ikanhub images in your projects with nothing more than a URL.
              Drop it in HTML, CSS, or your favorite programming language.
            </p>
            <div className="flex gap-3 pt-2">
              <Button asChild>
                <Link to="/docs">
                  View all endpoints
                  <ArrowRight size={16} weight="bold" className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card className="overflow-hidden shadow-glow-lg border-border/50">
              <CardContent className="p-6">
                <Tabs defaultValue="HTML">
                  <TabsList className="mb-4 gap-0 bg-muted p-1 rounded-xl">
                    {codeExamples.map((ex) => (
                      <TabsTrigger
                        key={ex.label}
                        value={ex.label}
                        className="rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        {ex.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {codeExamples.map((ex) => (
                    <TabsContent key={ex.label} value={ex.label}>
                      <div className="relative group">
                        <pre className="rounded-xl bg-muted p-4 md:p-5 overflow-x-auto text-sm font-mono leading-relaxed border border-border/30">
                          <code>{ex.code}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
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
        </div>
      </section>

      {/* Developer Examples */}
      <section className="border-t border-border/50 bg-surface-subtle">
        <div className="container py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Developer-friendly by design
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Simple, predictable URLs for every use case.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                title: "Random image by size",
                code: "GET /fish/800/600",
                desc: "Returns a random fish image resized to the specified dimensions.",
                img: `${API_URL}/fish/800/400?t=dev1`,
              },
              {
                title: "Specific image by ID",
                code: "GET /fish/id/12/800/600",
                desc: "Returns a specific image by ID, resized to the requested dimensions.",
                img: `${API_URL}/fish/id/1/800/400?t=dev2`,
              },
              {
                title: "Random metadata",
                code: "GET /fish/random.json",
                desc: "Returns JSON metadata for a random image, including all attribution fields.",
                img: null,
                response: `{
  "id": 42,
  "scientificName": "Pteragogus turdus",
  "commonName": "Thrush wrasse",
  "author": "John E. Randall",
  "locality": "Philippines",
  "license": "CC BY-NC 3.0"
}`,
              },
            ].map((ex) => (
              <Card key={ex.title} className="overflow-hidden card-elevate border-border/50">
                {ex.img && (
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <img
                      src={ex.img}
                      alt={ex.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold">{ex.title}</h3>
                  <div className="rounded-lg bg-muted px-3 py-2.5 border border-border/20">
                    <code className="text-sm font-mono">{ex.code}</code>
                  </div>
                  {ex.response ? (
                    <pre className="text-xs font-mono text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3 border border-border/20 overflow-x-auto">
                      <code>{ex.response}</code>
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">{ex.desc}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 md:py-28">
        <Card className="relative overflow-hidden border-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
          <div className="relative z-10 p-10 md:p-14 lg:p-16 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Start using ikanhub today
            </h2>
            <p className="text-white/80 max-w-lg mx-auto leading-relaxed text-lg">
              No registration required. Just use the URLs directly in your HTML,
              CSS, or applications.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="rounded-xl h-12 px-6 bg-white text-primary hover:bg-white/90"
              >
                <Link to="/docs">
                  Read the docs
                  <ArrowRight size={16} weight="bold" className="ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl h-12 px-6 border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link to="/explore">
                  <Image size={16} className="mr-2" />
                  Browse images
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function ShowcaseGrid() {
  const [species, setSpecies] = useState<
    { slug: string; scientificName: string; commonName: string | null; imageCount: number }[]
  >([]);
  const [speciesImages, setSpeciesImages] = useState<Record<string, string>>({});
  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetch(`${API_URL}/api/species`)
      .then((r) => r.json())
      .then((data) => {
        const list = (data.species || []).slice(0, 6);
        setSpecies(list);
        list.forEach((s: { slug: string }) => {
          fetch(`${API_URL}/api/search?q=${encodeURIComponent(s.slug)}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.results?.length > 0) {
                setSpeciesImages((prev) => ({
                  ...prev,
                  [s.slug]: d.results[0].url,
                }));
              }
            })
            .catch(() => {});
        });
      })
      .catch(() => {});
  }, []);

  if (species.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {species.map((s, i) => (
        <Link
          key={s.slug}
          to={`/explore?species=${s.scientificName}`}
          className={`group relative overflow-hidden rounded-2xl bg-muted block card-elevate ${
            i === 0 ? "md:col-span-2 md:row-span-2 md:min-h-[400px]" : "md:min-h-[200px]"
          }`}
        >
          <div className="absolute inset-0 bg-muted">
            {speciesImages[s.slug] && (
              <img
                src={`${API_URL}${speciesImages[s.slug]}`}
                alt={s.scientificName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative z-10 p-6 flex flex-col justify-end h-full min-h-[200px] md:min-h-[inherit]">
            <div className="space-y-1">
              <h3 className="text-white font-semibold text-lg leading-tight">
                <em>{s.scientificName}</em>
              </h3>
              {s.commonName && (
                <p className="text-white/70 text-sm">{s.commonName}</p>
              )}
              <p className="text-white/50 text-xs font-mono">
                {s.imageCount} image{s.imageCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
