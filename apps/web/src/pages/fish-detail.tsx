import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ArrowLeft, ArrowSquareOut, Fish, MapPin, User, ShieldCheck, ImageSquare, IdentificationBadge } from "@phosphor-icons/react";

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
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  const copyText = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="container py-20">
        <div className="space-y-4 max-w-5xl mx-auto">
          <div className="h-6 w-24 skeleton-shimmer rounded-lg" />
          <div className="aspect-[16/9] skeleton-shimmer rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="h-32 skeleton-shimmer rounded-xl" />
            <div className="h-32 skeleton-shimmer rounded-xl" />
            <div className="h-32 skeleton-shimmer rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !fish) {
    return (
      <div className="container py-20">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <Fish size={48} className="mx-auto text-muted-foreground/30" weight="light" />
          <h1 className="text-2xl font-bold tracking-tight">Image not found</h1>
          <p className="text-muted-foreground">{error || "The requested image does not exist."}</p>
          <Button asChild variant="outline" className="rounded-xl">
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

  return (
    <div className="container py-10 md:py-14">
      {/* Back link */}
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to explore
      </Link>

      {/* Hero image */}
      <div className="relative rounded-2xl overflow-hidden bg-muted border border-border/50 mb-10">
        <img
          src={`${API_URL}/fish/id/${fish.id}/1400/900`}
          alt={fish.scientificName}
          className="w-full h-auto max-h-[70vh] object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23222' width='800' height='600'/%3E%3C/svg%3E";
          }}
        />
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight italic leading-tight">
              {fish.scientificName}
            </h1>
            {fish.commonName && (
              <p className="text-xl text-muted-foreground">
                {fish.commonName}
              </p>
            )}
          </div>

          {/* Quick facts */}
          <div className="grid sm:grid-cols-2 gap-3">
            {fish.author && (
              <div className="flex items-center gap-3 rounded-xl bg-surface-subtle border border-border/50 p-4">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <User size={16} weight="bold" className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Author</p>
                  <p className="text-sm font-medium truncate">{fish.author}</p>
                </div>
              </div>
            )}
            {fish.locality && (
              <div className="flex items-center gap-3 rounded-xl bg-surface-subtle border border-border/50 p-4">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <MapPin size={16} weight="bold" className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Locality</p>
                  <p className="text-sm font-medium truncate">{fish.locality}</p>
                </div>
              </div>
            )}
            {fish.license && (
              <div className="flex items-center gap-3 rounded-xl bg-surface-subtle border border-border/50 p-4">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <ShieldCheck size={16} weight="bold" className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">License</p>
                  <Badge variant="secondary" className="text-xs rounded-full mt-0.5">
                    {fish.license}
                  </Badge>
                </div>
              </div>
            )}
            {(fish.width ?? fish.height) && (
              <div className="flex items-center gap-3 rounded-xl bg-surface-subtle border border-border/50 p-4">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <ImageSquare size={16} weight="bold" className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Original size</p>
                  <p className="text-sm font-medium">
                    {fish.width} x {fish.height} px
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Source link */}
          {fish.sourcePageUrl && (
            <div className="rounded-xl border border-border/50 bg-surface-subtle p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Source
              </p>
              <a
                href={fish.sourcePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"
              >
                {fish.sourcePageUrl}
                <ArrowSquareOut size={12} weight="bold" />
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image ID card */}
          <Card className="border-border/50 shadow-card-glow">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <IdentificationBadge size={16} weight="bold" className="text-primary" />
                <span className="text-sm font-medium">Image ID</span>
                <span className="ml-auto text-sm font-mono text-muted-foreground">
                  #{fish.id}
                </span>
              </div>
              {fish.speciesId && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                  <Fish size={16} weight="bold" className="text-primary" />
                  <span className="text-sm font-medium">Species ID</span>
                  <span className="ml-auto text-sm font-mono text-muted-foreground">
                    {fish.speciesId}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Copy URLs */}
          <Card className="border-border/50 shadow-card-glow">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-medium">API URLs</h3>
              <div className="space-y-2">
                {copyUrls.map(({ label, url }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-xl bg-muted border border-border/30 px-3 py-2.5 group"
                  >
                    <Badge
                      variant="outline"
                      className="text-xs font-mono shrink-0 rounded-md bg-background"
                    >
                      {label}
                    </Badge>
                    <code className="flex-1 text-xs font-mono truncate text-muted-foreground">
                      {url}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      onClick={() => copyText(`${API_URL}${url}`, label)}
                      aria-label={`Copy ${label}`}
                    >
                      {copiedField === label ? (
                        <Check size={11} className="text-green-600" />
                      ) : (
                        <Copy size={11} />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Species link */}
          <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
            <Link to={`/explore?species=${encodeURIComponent(fish.scientificName)}`}>
              <ArrowSquareOut size={14} weight="bold" className="mr-2" />
              View all {fish.scientificName} images
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
