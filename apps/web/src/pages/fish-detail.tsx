import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ArrowLeft, ArrowSquareOut } from "@phosphor-icons/react";

const API_URL = import.meta.env.VITE_API_URL || "";

interface FishDetail {
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
  const [fish, setFish] = useState<FishDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
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
      <div className="container py-20 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error || !fish) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Image not found</h1>
        <p className="text-muted-foreground">{error || "The requested image does not exist."}</p>
        <Button asChild variant="outline">
          <Link to="/explore">
            <ArrowLeft size={16} className="mr-2" />
            Back to explore
          </Link>
        </Button>
      </div>
    );
  }

  const copyUrls = [
    { label: "400x300", url: `/fish/id/${fish.id}/400/300` },
    { label: "800x600", url: `/fish/id/${fish.id}/800/600` },
    { label: "1200x900", url: `/fish/id/${fish.id}/1200/900` },
    { label: "JSON", url: `/fish/id/${fish.id}.json` },
  ];

  return (
    <div className="container py-12 md:py-16 space-y-8">
      <Button asChild variant="ghost" size="sm">
        <Link to="/explore">
          <ArrowLeft size={16} className="mr-2" />
          Back to explore
        </Link>
      </Button>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Image */}
        <div className="lg:col-span-3">
          <div className="rounded-xl overflow-hidden bg-muted border">
            <img
              src={`${API_URL}/fish/id/${fish.id}/1200/900`}
              alt={fish.scientificName}
              className="w-full h-auto object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23eaeaea' width='800' height='600'/%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold italic tracking-tight">{fish.scientificName}</h1>
            {fish.commonName && (
              <p className="text-lg text-muted-foreground mt-1">
                {fish.commonName}
              </p>
            )}
          </div>

          {/* Metadata */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {fish.author && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Author</span>
                  <span className="font-medium">{fish.author}</span>
                </div>
              )}
              {fish.locality && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Locality</span>
                  <span className="font-medium">{fish.locality}</span>
                </div>
              )}
              {fish.license && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">License</span>
                  <Badge variant="secondary" className="text-xs rounded-full">
                    {fish.license}
                  </Badge>
                </div>
              )}
              {fish.speciesId && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Species ID</span>
                  <span className="font-medium font-mono text-xs">
                    {fish.speciesId}
                  </span>
                </div>
              )}
              {(fish.width ?? fish.height) && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original size</span>
                  <span className="font-medium">
                    {fish.width} x {fish.height}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Image ID</span>
                <span className="font-medium font-mono text-xs">{fish.id}</span>
              </div>
            </CardContent>
          </Card>

          {fish.sourcePageUrl && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Source</p>
              <a
                href={fish.sourcePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                {fish.sourcePageUrl}
                <ArrowSquareOut size={12} />
              </a>
            </div>
          )}

          {/* Copy URLs */}
          <div>
            <p className="text-sm font-medium mb-2">Copy URL</p>
            <div className="space-y-2">
              {copyUrls.map(({ label, url }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
                >
                  <Badge variant="outline" className="text-xs font-mono shrink-0 rounded-full">
                    {label}
                  </Badge>
                  <code className="flex-1 text-xs font-mono truncate">
                    {url}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => copyText(`${API_URL}${url}`, label)}
                    aria-label={`Copy ${label}`}
                  >
                    {copiedField === label ? (
                      <Check size={12} className="text-green-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Species link */}
          <Button asChild variant="outline" size="sm">
            <Link to={`/explore?species=${fish.slug}`}>
              <ArrowSquareOut size={14} className="mr-2" />
              View all {fish.scientificName} images
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
