import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Code,
  Check,
  Image,
  Waves,
  Shuffle,
  Database,
  ArrowsOut,
  Lightning,
  FishSimple,
  ArrowRight,
  TerminalWindow,
} from "@phosphor-icons/react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Landing() {
  const [width, setWidth] = useState("1200");
  const [height, setHeight] = useState("760");
  const [copied, setCopied] = useState("");
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

  const generatedUrl = width && height ? `/fish/${width}/${height}` : "/fish/1200/760";
  const fullUrl = `${API_URL}${generatedUrl}`;

  const copyToClipboard = async (text: string, key = "url") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1800);
    } catch {}
  };

  const codeExamples = [
    {
      label: "HTML",
      code: `<img src="${fullUrl}" alt="Fish image from IkanHub" />`,
    },
    {
      label: "React",
      code: `export function Cover() {
  return <img src="${fullUrl}" alt="Marine species" />;
}`,
    },
    {
      label: "curl",
      code: `curl -L "${fullUrl}" -o fish.jpg`,
    },
    {
      label: "JSON",
      code: `const fish = await fetch("${API_URL}/fish/random.json")
  .then((response) => response.json());`,
    },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-ocean-pattern pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />
        <div className="container relative z-10 pt-28 pb-28 md:pt-32 md:pb-36">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:items-center">
            <div className="space-y-8 animate-fade-up">
              <Badge className="rounded-md border-primary/15 bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/10">
                <Waves size={14} weight="bold" className="mr-2" />
                The fish image and metadata platform
              </Badge>
              <div className="space-y-6">
                <h1 className="display-title text-5xl md:text-7xl xl:text-8xl">
                  Discover fish.
                  <span className="block text-primary">Build with data.</span>
                </h1>
                <p className="max-w-xl text-lg md:text-xl leading-8 text-muted-foreground">
                  IkanHub brings ocean photography, species metadata, and developer-ready image URLs into one fast API.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="h-12 rounded-xl px-6 shadow-[0_16px_40px_rgba(19,99,223,0.26)]">
                  <Link to="/docs">
                    Try the API
                    <ArrowRight size={16} weight="bold" className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-primary/20 bg-background/50 px-6 backdrop-blur">
                  <Link to="/explore">
                    <Image size={16} weight="bold" className="mr-2" />
                    Explore images
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-lg pt-2">
                {[
                  ["Images", stats.totalImages],
                  ["Species", stats.totalSpecies],
                  ["Endpoints", stats.endpoints.length || 8],
                ].map(([label, value]) => (
                  <div key={label} className="glass-panel rounded-2xl px-4 py-3">
                    <div className="font-mono text-2xl font-semibold tracking-tight">
                      {Number(value).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[580px] animate-fade-up animate-fade-up-delay-2">
              <div className="absolute -right-8 top-4 z-20 hidden w-48 rounded-2xl glass-panel p-4 shadow-card-glow md:block float-card" style={{ "--float-rotate": "3deg" } as CSSProperties}>
                <p className="text-xs text-muted-foreground">Live metadata</p>
                <p className="mt-1 text-sm font-semibold italic">{randomFish?.scientificName || "Chaetodon lunula"}</p>
                <p className="text-xs text-muted-foreground">{randomFish?.commonName || "Blue tang"}</p>
              </div>
              <div className="absolute -left-4 bottom-36 z-20 hidden rounded-2xl premium-code border p-4 text-xs md:block float-card-delay" style={{ "--float-rotate": "-5deg" } as CSSProperties}>
                <div className="mb-2 flex items-center gap-2 text-cyan-200">
                  <TerminalWindow size={14} weight="bold" />
                  <span className="font-mono">GET {generatedUrl}</span>
                </div>
                <pre className="font-mono text-cyan-50/78">{`{
  "width": ${width || 1200},
  "height": ${height || 760},
  "format": "jpeg"
}`}</pre>
              </div>

              <div className="glass-panel relative overflow-hidden rounded-[2rem] p-3 md:p-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.45rem] bg-muted">
                  <img
                    key={liveImgKey}
                    src={`${fullUrl}?t=${liveImgKey}`}
                    alt="Live generated fish image preview"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='680'%3E%3Crect fill='%2306283D' width='900' height='680'/%3E%3Ctext x='450' y='340' text-anchor='middle' fill='%2347B5FF' font-size='22' font-family='monospace'%3Eimage preview%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06283D]/80 via-[#06283D]/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <Button variant="secondary" size="sm" onClick={() => setLiveImgKey((k) => k + 1)} className="rounded-xl bg-white/90 text-[#06283D] hover:bg-white">
                      <Shuffle size={14} weight="bold" className="mr-2" />
                      New image
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 p-2 pt-4 sm:grid-cols-[1fr_1fr_auto]">
                  <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
                    Width
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      min="1"
                      max="3000"
                      className="h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 font-mono text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
                    Height
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      min="1"
                      max="3000"
                      className="h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 font-mono text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <Button onClick={() => copyToClipboard(fullUrl, "hero-url")} className="self-end rounded-xl h-11">
                    {copied === "hero-url" ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
                    <span className="ml-2 hidden sm:inline">Copy endpoint</span>
                  </Button>
                </div>
                <div className="mx-2 mb-2 rounded-xl border border-border/50 bg-muted/70 px-3 py-2 font-mono text-xs text-muted-foreground">
                  {fullUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container relative z-20 -mt-8 pb-20 pt-4 md:-mt-10 md:pb-28">
        <div className="mb-12 max-w-3xl">
          <p className="section-kicker mb-3">Platform</p>
          <h2 className="display-title text-4xl md:text-6xl">Built for visual products and scientific context.</h2>
        </div>
        <div className="grid auto-rows-[minmax(210px,auto)] gap-5 md:grid-cols-4">
          {[
            {
              className: "md:col-span-2 md:row-span-2",
              icon: Shuffle,
              title: "Random, production-ready fish imagery",
              desc: "Generate photographic fish assets at any dimension with one URL.",
              media: `${API_URL}/fish/1200/720?t=feature-a`,
            },
            { icon: ArrowsOut, title: "Resize on demand", desc: "Responsive placeholders up to 3000px, cropped and cached." },
            { icon: FishSimple, title: "Species URLs", desc: "Target a species slug when your UI needs consistent subject matter." },
            { icon: Code, title: "JSON metadata", desc: "Scientific names, attribution, locality, license, and source URLs." },
            { icon: Lightning, title: "Fast repeats", desc: "Generated derivatives are cached for quick subsequent loads." },
          ].map((feature) => (
            <article key={feature.title} className={`group overflow-hidden rounded-3xl glass-panel card-elevate ${feature.className || ""}`}>
              {"media" in feature && feature.media ? (
                <div className="relative h-56 overflow-hidden md:h-72">
                  <img src={feature.media} alt={feature.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </div>
              ) : null}
              <div className="p-6 md:p-7">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <feature.icon size={22} weight="bold" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{feature.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface-subtle/75 py-20 md:py-28">
        <div className="container">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="section-kicker mb-3">Species showcase</p>
              <h2 className="display-title text-4xl md:text-6xl">A living image library, not a spreadsheet.</h2>
            </div>
            <Button asChild variant="outline" className="rounded-xl bg-background/60">
              <Link to="/explore">
                View collection
                <ArrowRight size={15} weight="bold" className="ml-2" />
              </Link>
            </Button>
          </div>
          <ShowcaseGrid />
        </div>
      </section>

      <section className="container pt-20 md:pt-28">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-5">
            <p className="section-kicker">Developer experience</p>
            <h2 className="display-title text-4xl md:text-6xl">Drop in an endpoint. Get the ocean back.</h2>
            <p className="max-w-lg text-lg leading-8 text-muted-foreground">
              Preview images, copy generated URLs, and ship realistic marine biodiversity imagery without account setup.
            </p>
            <Button asChild className="rounded-xl">
              <Link to="/docs">
                Read documentation
                <ArrowRight size={15} weight="bold" className="ml-2" />
              </Link>
            </Button>
          </div>
          <div className="glass-panel overflow-hidden rounded-3xl p-3 sm:p-4">
            <div className="space-y-4">
                <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Endpoint</p>
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
                    <code className="min-w-0 flex-1 truncate font-mono text-sm">{fullUrl}</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => copyToClipboard(fullUrl, "playground")}>
                      {copied === "playground" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </Button>
                  </div>
                </div>
                <Tabs defaultValue="HTML">
                  <TabsList className="mb-3 rounded-xl bg-muted p-1 overflow-x-auto flex-nowrap gap-0">
                    {codeExamples.map((ex) => (
                      <TabsTrigger key={ex.label} value={ex.label} className="rounded-lg text-xs whitespace-nowrap px-2.5">
                        {ex.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {codeExamples.map((ex) => (
                    <TabsContent key={ex.label} value={ex.label}>
                      <pre className="premium-code min-h-[80px] overflow-x-auto rounded-2xl border p-4 text-sm leading-7">
                        <code>{ex.code}</code>
                      </pre>
                    </TabsContent>
                  ))}
                </Tabs>
                <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Database size={16} weight="bold" className="text-primary" />
                    Response example
                  </div>
                  <pre className="overflow-x-auto font-mono text-xs leading-6 text-muted-foreground">{`{
  "scientificName": "${randomFish?.scientificName || "Acanthurus coeruleus"}",
  "commonName": "${randomFish?.commonName || "Blue tang"}",
  "url": "/fish/id/42/800/600"
}`}</pre>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ShowcaseGrid() {
  const [species, setSpecies] = useState<
    { slug: string; scientificName: string; commonName: string | null; imageCount: number; url: string }[]
  >([]);

  useEffect(() => {
    fetch(`${API_URL}/api/species`)
      .then((r) => r.json())
      .then((data) => {
        const list = (data.species || []).slice(0, 7);
        setSpecies(list);
      })
      .catch(() => {});
  }, []);

  if (species.length === 0) {
    return <div className="h-80 rounded-3xl skeleton-shimmer" />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-4 md:auto-rows-[220px]">
      {species.map((s, i) => (
        <Link
          key={s.slug}
          to={`/explore?species=${s.scientificName}`}
          className={`group relative overflow-hidden rounded-3xl bg-muted shadow-card-glow ${
            i === 0 ? "md:col-span-2 md:row-span-2" : i === 3 ? "md:col-span-2" : ""
          }`}
        >
          <img
            src={`${API_URL}/fish/species/${s.slug}/${i === 0 ? "1200/900" : i === 3 ? "900/520" : "700/620"}`}
            alt={s.scientificName}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).src = `${API_URL}${s.url}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/18 to-transparent" />
          <div className="relative flex h-full min-h-[240px] flex-col justify-end p-6">
            <p className="mb-2 w-fit rounded-md bg-white/12 px-2 py-1 font-mono text-xs text-white/70 backdrop-blur">
              {s.imageCount} images
            </p>
            <h3 className="text-xl font-semibold leading-tight text-white">
              <em>{s.scientificName}</em>
            </h3>
            {s.commonName && <p className="mt-1 text-sm text-white/70">{s.commonName}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
