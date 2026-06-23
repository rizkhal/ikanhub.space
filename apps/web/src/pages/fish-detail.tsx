import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  Check,
  Copy,
  Database,
  Fish,
  IdentificationBadge,
  ImageSquare,
  MapPin,
  ShieldCheck,
  User,
} from "@phosphor-icons/react";

const API_URL = import.meta.env.VITE_API_URL || "";

interface FishDetailData {
  id: number;
  scientificName: string;
  commonName: string | null;
  slug: string;
  speciesId: string | null;
  author: string | null;
  locality: string | null;
  license: string | null;
  sourcePageUrl: string | null;
  originalUrl: string | null;
  width: number | null;
  height: number | null;
  url: string;
  metadataUrl: string;
}

export default function FishDetail() {
  const { id } = useParams();
  const [fish, setFish] = useState<FishDetailData | null>(null);
  const [related, setRelated] = useState<FishDetailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    window.scrollTo(0, 0);
    fetch(`${API_URL}/fish/id/${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("Image not found");
        return r.json();
      })
      .then((data) => {
        setFish(data);
        setLoading(false);
        return fetch(`${API_URL}/api/search?q=${encodeURIComponent(data.scientificName)}`);
      })
      .then((r) => r?.json())
      .then((data) => {
        setRelated((data?.results || []).filter((item: FishDetailData) => String(item.id) !== id).slice(0, 4));
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  const copyText = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  if (loading) {
    return (
      <div className="container py-20">
        <div className="space-y-6">
          <div className="h-8 w-36 rounded-xl skeleton-shimmer" />
          <div className="aspect-[16/9] rounded-[2rem] skeleton-shimmer" />
          <div className="grid gap-5 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-3xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !fish) {
    return (
      <div className="container py-24">
        <div className="glass-panel mx-auto max-w-lg rounded-3xl p-10 text-center">
          <Fish size={48} className="mx-auto text-primary/50" weight="light" />
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Image not found</h1>
          <p className="mt-2 text-muted-foreground">{error || "The requested image does not exist."}</p>
          <Button asChild variant="outline" className="mt-6 rounded-xl">
            <Link to="/explore">
              <ArrowLeft size={16} className="mr-2" />
              Back to explore
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const copyUrls = [
    { label: "400 x 300", url: `/fish/id/${fish.id}/400/300` },
    { label: "800 x 600", url: `/fish/id/${fish.id}/800/600` },
    { label: "1200 x 900", url: `/fish/id/${fish.id}/1200/900` },
    { label: "JSON metadata", url: `/fish/id/${fish.id}.json` },
  ];

  const facts = [
    { label: "Author", value: fish.author, icon: User },
    { label: "Locality", value: fish.locality, icon: MapPin },
    { label: "License", value: fish.license, icon: ShieldCheck },
    {
      label: "Original size",
      value: fish.width || fish.height ? `${fish.width || "?"} x ${fish.height || "?"} px` : null,
      icon: ImageSquare,
    },
  ].filter((fact) => fact.value);

  return (
    <div>
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-ocean-pattern pointer-events-none" />
        <div className="container relative z-10 pt-28 pb-8 md:pt-32 md:pb-12">
          <Link
            to="/explore"
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} weight="bold" />
            Back to explore
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="section-kicker mb-3">Species record</p>
              <h1 className="display-title text-5xl italic md:text-7xl">{fish.scientificName}</h1>
              {fish.commonName && <p className="mt-5 text-xl text-muted-foreground">{fish.commonName}</p>}
            </div>
            <div className="glass-panel rounded-3xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <IdentificationBadge size={22} weight="bold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Image ID</p>
                  <p className="font-mono text-lg font-semibold">#{fish.id}</p>
                </div>
                {fish.speciesId && (
                  <Badge variant="secondary" className="ml-auto rounded-md font-mono">
                    {fish.speciesId}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[2rem] bg-muted shadow-card-glow">
            <img
              src={`${API_URL}/fish/id/${fish.id}/1600/1000`}
              alt={fish.scientificName}
              className="h-auto max-h-[76vh] w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect fill='%2306283D' width='1200' height='800'/%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <main className="space-y-10">
            <div className="grid gap-4 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="glass-panel rounded-3xl p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <fact.icon size={19} weight="bold" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{fact.label}</p>
                  <p className="mt-2 text-base font-semibold">{fact.value}</p>
                </div>
              ))}
            </div>

            <article className="max-w-3xl space-y-5">
              <p className="section-kicker">Editorial context</p>
              <h2 className="display-title text-4xl md:text-5xl">A photograph with useful data attached.</h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Use this image in mockups, scientific interfaces, education tools, or content systems, then pull the metadata endpoint when your product needs attribution and species context.
              </p>
              {fish.sourcePageUrl && (
                <a
                  href={fish.sourcePageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-foreground"
                >
                  View original source
                  <ArrowSquareOut size={14} weight="bold" />
                </a>
              )}
            </article>

            {related.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="section-kicker mb-2">Related</p>
                    <h2 className="text-2xl font-semibold tracking-tight">More from this species</h2>
                  </div>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link to={`/explore?species=${encodeURIComponent(fish.scientificName)}`}>
                      View all
                      <ArrowRight size={14} weight="bold" className="ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((item) => (
                    <Link key={item.id} to={`/fish/${item.id}`} className="group overflow-hidden rounded-3xl bg-muted shadow-card-glow">
                      <img src={`${API_URL}${item.url}`} alt={item.scientificName} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="glass-panel rounded-3xl p-5">
              <div className="mb-4 flex items-center gap-2 font-semibold">
                <Database size={18} weight="bold" className="text-primary" />
                API endpoints
              </div>
              <div className="space-y-2">
                {copyUrls.map(({ label, url }) => (
                  <div key={label} className="group rounded-2xl border border-border/50 bg-background/55 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Badge variant="outline" className="rounded-md bg-background font-mono text-[11px]">
                        {label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg opacity-80 transition-opacity group-hover:opacity-100"
                        onClick={() => copyText(`${API_URL}${url}`, label)}
                        aria-label={`Copy ${label}`}
                      >
                        {copiedField === label ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </Button>
                    </div>
                    <code className="block truncate font-mono text-xs text-muted-foreground">{url}</code>
                  </div>
                ))}
              </div>
            </div>

            <pre className="premium-code overflow-x-auto rounded-3xl border p-5 text-xs leading-6">{`{
  "id": ${fish.id},
  "scientificName": "${fish.scientificName}",
  "commonName": ${fish.commonName ? `"${fish.commonName}"` : "null"},
  "license": ${fish.license ? `"${fish.license}"` : "null"},
  "metadataUrl": "${fish.metadataUrl}"
}`}</pre>

            <Button asChild className="w-full rounded-xl">
              <Link to={`/explore?species=${encodeURIComponent(fish.scientificName)}`}>
                Explore this species
                <ArrowRight size={15} weight="bold" className="ml-2" />
              </Link>
            </Button>
          </aside>
        </div>
      </section>
    </div>
  );
}
