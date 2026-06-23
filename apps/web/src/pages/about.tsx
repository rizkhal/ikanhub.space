import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowsOut,
  BookOpenText,
  Code,
  Database,
  Fish,
  Globe,
  Image,
  ShieldCheck,
} from "@phosphor-icons/react";

const API_URL = import.meta.env.VITE_API_URL || "";

const workflow = [
  {
    label: "01",
    title: "Curated photography",
    desc: "FishBase Best Photos gives the platform a real biological foundation instead of anonymous stock imagery.",
  },
  {
    label: "02",
    title: "Clean image URLs",
    desc: "Every image can be requested by size, species, or ID with predictable REST paths.",
  },
  {
    label: "03",
    title: "Metadata beside the image",
    desc: "Scientific name, author, locality, source URL, and license are exposed as JSON.",
  },
];

const uses = [
  {
    icon: Image,
    title: "Prototype with real marine photography",
    desc: "Use actual fish photographs where generic placeholders make the product feel empty.",
  },
  {
    icon: Code,
    title: "Build visual developer tools",
    desc: "Drop URLs into HTML, CSS, React, or backend jobs without an API key.",
  },
  {
    icon: BookOpenText,
    title: "Support education and editorial work",
    desc: "Create biodiversity references with visible species context and attribution.",
  },
  {
    icon: Globe,
    title: "Connect images to records",
    desc: "Pair display images with source data, license fields, and species names.",
  },
];

const specs = [
  { icon: ArrowsOut, title: "Image processing", desc: "Sharp resizes images on demand and returns JPEG output at quality 85." },
  { icon: Database, title: "Caching", desc: "Generated sizes are cached on disk for faster repeat requests." },
  { icon: ShieldCheck, title: "Validation", desc: "Width and height are validated server-side from 1 to 3000 pixels." },
  { icon: Globe, title: "Privacy", desc: "The service only uses anonymous request data for basic analytics." },
];

export default function About() {
  return (
    <div>
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-ocean-pattern pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />
        <div className="container relative z-10 pt-28 pb-14 md:pt-32 md:pb-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <Fish size={20} weight="bold" className="text-primary" />
              <span className="section-kicker">About</span>
            </div>
            <h1 className="display-title text-5xl md:text-7xl">
              The home of fish images and metadata.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-8">
              IkanHub combines ocean photography, biological metadata, and developer-friendly endpoints for products that need more than generic placeholders.
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-20 -mt-10 pb-16">
        <section className="container">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="pt-12 md:pt-16 lg:pt-20">
              <p className="section-kicker mb-5">Why it exists</p>
              <p className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                Fish imagery should not feel like filler. It should carry the same specificity as the species behind it.
              </p>
              <div className="mt-8 max-w-2xl space-y-5 text-base leading-8 text-muted-foreground md:text-lg">
                <p>
                  IkanHub keeps the simplicity of placeholder image URLs, then adds the context that visual products actually need: scientific names, attribution, locality, source pages, and licenses.
                </p>
                <p>
                  The name combines "Ikan" with "hub": a central place for fish photography and API-ready metadata.
                </p>
              </div>
            </div>

            <div className="relative min-h-[560px]">
              <div className="absolute left-0 top-8 h-[56%] w-[68%] rounded-[2.4rem] border border-border/50 bg-background/65 p-2 shadow-card-glow backdrop-blur">
                <div className="h-full overflow-hidden rounded-[1.9rem] bg-muted ring-1 ring-white/50 dark:ring-white/10">
                <img
                  src={`${API_URL}/fish/1200/760?t=about-mosaic-a-wide`}
                  alt="Fish photograph from the IkanHub API"
                  className="h-full w-full object-cover object-center"
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                </div>
              </div>
              <div className="absolute right-0 top-0 h-[42%] w-[44%] rounded-[1.9rem] border border-border/50 bg-background/65 p-2 shadow-card-glow backdrop-blur">
                <div className="h-full overflow-hidden rounded-[1.35rem] bg-muted ring-1 ring-white/50 dark:ring-white/10">
                <img
                  src={`${API_URL}/fish/900/620?t=about-mosaic-b-wide`}
                  alt="Fish photograph from the IkanHub collection"
                  className="h-full w-full object-cover object-center"
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                </div>
              </div>
              <div className="absolute bottom-0 right-8 w-[62%] overflow-hidden rounded-[2rem] border border-white/10 bg-[#06283D] p-5 text-white shadow-card-glow">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/48">
                  GET /fish/random.json
                </p>
                <pre className="mt-4 overflow-x-auto font-mono text-xs leading-6 text-white/78">{`{
  "scientificName": "Acanthurus coeruleus",
  "commonName": "Blue tang",
  "license": "CC BY-NC 3.0"
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 max-w-3xl">
              <p className="section-kicker mb-3">From archive to API</p>
              <h2 className="display-title text-4xl md:text-6xl">
                The product is the bridge between photography and structured data.
              </h2>
            </div>

            <div className="relative">
              <div className="space-y-12">
                {workflow.map((item, i) => (
                  <div key={item.label} className="relative grid gap-6 md:grid-cols-[48px_1fr] md:items-center">
                                      {/* Connector line segment: from circle center through gap to next item */}
                                      {i < workflow.length - 1 ? (
                                                                              <div className="absolute left-[19px] top-5 h-[calc(100%+48px)] w-px bg-border/60 md:left-[21px] md:top-1/2" />
                                                                            ) : (
                                                                              <div className="absolute left-[19px] top-5 h-[calc(100%-20px)] w-px bg-border/60 md:hidden" />
                                                                            )}
                    {/* Circle marker */}
                    <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-border/60 bg-background md:h-11 md:w-11">
                                          <span className="font-mono text-sm font-bold leading-none text-primary">
                                              {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-background/55 p-6 shadow-card-glow backdrop-blur transition hover:-translate-y-0.5 md:p-8">
                      <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden">
          <div className="h-20 bg-[linear-gradient(180deg,transparent_0%,hsl(var(--surface-subtle)/0.55)_72%,hsl(var(--surface-subtle))_100%)] md:h-28" />
          <div className="bg-surface-subtle py-16 md:py-20">
            <div className="container">
              <div className="mb-14 max-w-3xl">
                <p className="section-kicker mb-3">Data source</p>
                <h2 className="display-title text-4xl md:text-6xl">
                  Curated from FishBase Best Photos.
                </h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                {/* Left: main content card */}
                <div className="rounded-[2rem] border border-border/50 bg-background/64 p-7 shadow-card-glow backdrop-blur md:p-9">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Database size={24} weight="bold" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Source
                      </p>
                      <p className="text-xl font-semibold tracking-tight">FishBase</p>
                    </div>
                  </div>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                    The collection draws from FishBase Best Photos, a scientific database curated by biologists and ichthyologists worldwide. Each image is tied to a species record with verifiable metadata.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-6">
                    {[
                      { label: "Output format", value: "JPEG + JSON" },
                      { label: "License context", value: "Always included" },
                      { label: "Attribution", value: "Preserved per record" },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-3">
                        <div className="h-8 w-px bg-border/60" />
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="text-sm font-semibold">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: image card */}
                <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-muted">
                  <img
                    src={`${API_URL}/fish/800/800?t=about-data-source`}
                    alt="Fish from the collection"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-xs font-medium text-white/70">
                      IkanHub preserves attribution and license metadata so builders can make informed usage decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-20 bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,hsl(var(--surface-subtle)/0.55)_28%,transparent_100%)] md:h-28" />
        </section>

        <section className="container py-20 md:py-28">
          <div className="mb-12 max-w-3xl">
              <p className="section-kicker mb-3">Use cases</p>
              <h2 className="display-title max-w-xl text-4xl md:text-5xl">
                Built for teams that care how their interfaces feel.
              </h2>
          </div>
            <div className="grid gap-5 md:grid-cols-2">
              {uses.map((item) => (
                <article key={item.title} className="group rounded-[1.6rem] border border-border/50 bg-background/55 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-card-glow md:p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:-translate-y-0.5">
                    <item.icon size={21} weight="bold" />
                  </div>
                    <h3 className="mt-6 text-xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{item.desc}</p>
                </article>
              ))}
            </div>
        </section>

        <section className="container">
          <div className="grid overflow-hidden rounded-[2rem] bg-[#06283D] text-white lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[420px]">
              <img
                src={`${API_URL}/fish/900/900?t=about-license`}
                alt="Fish photograph behind attribution section"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06283D]/80 via-transparent to-transparent" />
            </div>
            <div className="p-10 md:p-14 lg:p-16">
              <ShieldCheck size={28} weight="bold" className="text-[#8DE3C5]" />
              <h2 className="display-title mt-6 text-4xl md:text-5xl">
                Attribution is not an afterthought.
              </h2>
              <div className="mt-7 space-y-5 leading-8 text-white/74">
                <p>
                  Images may be licensed under Creative Commons or other open terms. Always check the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">license</code> field before usage.
                </p>
                <p>
                  Most FishBase records use CC BY-NC 3.0 or similar terms. Credit the original author and verify each record when usage matters.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-20 md:py-28">
          <div className="mb-12 max-w-3xl">
              <p className="section-kicker mb-3">Technical details</p>
              <h2 className="display-title text-4xl md:text-5xl">
                Small API surface. Useful defaults.
              </h2>
          </div>
            <div className="grid gap-5 md:grid-cols-2">
              {specs.map((item) => (
                <div key={item.title} className="rounded-[1.6rem] border border-border/50 bg-surface-subtle/70 p-6 md:p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon size={21} weight="bold" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
        </section>

        <section className="container pb-20 md:pb-24">
          <div className="grid gap-8 border-t border-border/60 pt-12 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="section-kicker mb-3">Start</p>
              <h2 className="display-title max-w-3xl text-4xl md:text-5xl">
                Browse the collection or copy your first endpoint.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Button asChild className="rounded-xl">
                <Link to="/docs">
                  View API docs
                  <ArrowRight size={16} weight="bold" className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl bg-background/60">
                <Link to="/explore">Browse images</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
