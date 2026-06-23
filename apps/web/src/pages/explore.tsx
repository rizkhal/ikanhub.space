import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, MagnifyingGlass, Spinner, ArrowSquareOut, Image, Fish } from "@phosphor-icons/react";

const API_URL = import.meta.env.VITE_API_URL || "";

interface FishImage {
  id: number;
  scientificName: string;
  commonName: string | null;
  slug: string;
  author: string | null;
  locality: string | null;
  license: string | null;
  width: number | null;
  height: number | null;
  url: string;
  metadataUrl: string;
}

interface Species {
  slug: string;
  scientificName: string;
  commonName: string | null;
  imageCount: number;
  url: string;
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [images, setImages] = useState<FishImage[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("species") || "");
  const [selectedSpecies, setSelectedSpecies] = useState(searchParams.get("species") || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [speciesExpanded, setSpeciesExpanded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/species`)
      .then((r) => r.json())
      .then((data) => setSpecies(data.species || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "24" });
    if (selectedSpecies) {
      fetch(`${API_URL}/api/search?q=${encodeURIComponent(selectedSpecies)}`)
        .then((r) => r.json())
        .then((data) => {
          setImages(data.results || []);
          setTotalPages(1);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetch(`${API_URL}/api/images?${params}`)
        .then((r) => r.json())
        .then((data) => {
          setImages(data.images || []);
          setTotalPages(data.totalPages || 1);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [page, selectedSpecies]);

  // Sync species from URL param
  useEffect(() => {
    const speciesParam = searchParams.get("species");
    if (speciesParam) {
      setSelectedSpecies(speciesParam);
      setSearch(speciesParam);
    }
  }, [searchParams]);

  const copyUrl = useCallback(async (url: string, id: number) => {
    await navigator.clipboard.writeText(`${API_URL}${url}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleSearch = () => {
    if (!search.trim()) {
      setSelectedSpecies("");
      setSearchParams({});
      return;
    }
    setSelectedSpecies(search);
    setPage(1);
  };

  const displayedSpecies = speciesExpanded ? species : species.slice(0, 12);

  return (
    <div className="container py-12 md:py-16 space-y-10">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Explore images
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Browse the collection of fish images. Click on any image for details and copy options.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search by species, name, or locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 rounded-xl h-11"
            />
          </div>
          <Button onClick={handleSearch} className="rounded-xl h-11 px-5">
            Search
          </Button>
        </div>

        {/* Species chips */}
        {species.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={!selectedSpecies ? "default" : "outline"}
              className="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium"
              onClick={() => {
                setSelectedSpecies("");
                setSearch("");
                setPage(1);
                setSearchParams({});
              }}
            >
              All species
            </Badge>
            {displayedSpecies.map((s) => (
              <Badge
                key={s.slug}
                variant={selectedSpecies === s.scientificName ? "default" : "outline"}
                className="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-all hover:border-primary/50"
                onClick={() => {
                  setSelectedSpecies(s.scientificName);
                  setSearch(s.scientificName);
                  setPage(1);
                }}
              >
                {s.commonName || s.scientificName}
                <span className="ml-1 opacity-60">({s.imageCount})</span>
              </Badge>
            ))}
            {species.length > 12 && (
              <Badge
                variant="outline"
                className="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium"
                onClick={() => setSpeciesExpanded(!speciesExpanded)}
              >
                {speciesExpanded ? "Show less" : `+${species.length - 12} more`}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="masonry-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <div
                className="rounded-2xl skeleton-shimmer"
                style={{
                  height: `${150 + Math.random() * 200}px`,
                }}
              />
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <Fish size={40} className="mx-auto text-muted-foreground/40" weight="light" />
          <p className="text-lg text-muted-foreground">No images found</p>
          <p className="text-sm text-muted-foreground/60">
            Try a different search or species filter.
          </p>
        </div>
      ) : (
        <div className="masonry-grid">
          {images.map((img) => {
            const aspectRatio = img.width && img.height ? img.width / img.height : 1.33;
            return (
              <div key={img.id} className="masonry-item group">
                <div className="rounded-2xl overflow-hidden bg-muted border border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <Link
                    to={`/fish/${img.id}`}
                    className="block overflow-hidden relative"
                  >
                    <img
                      src={`${API_URL}${img.url}`}
                      alt={img.scientificName}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ aspectRatio: `${aspectRatio}` }}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                  <div className="p-4 space-y-2">
                    <Link
                      to={`/fish/${img.id}`}
                      className="block font-medium text-sm hover:text-primary transition-colors"
                    >
                      <em>{img.scientificName}</em>
                    </Link>
                    {img.commonName && (
                      <p className="text-xs text-muted-foreground">
                        {img.commonName}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs gap-1.5 rounded-lg"
                        onClick={() => copyUrl(img.url, img.id)}
                      >
                        {copiedId === img.id ? (
                          <Check size={11} className="text-green-600" />
                        ) : (
                          <Image size={11} />
                        )}
                        Image URL
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1.5 rounded-lg"
                        onClick={() => copyUrl(img.metadataUrl, -img.id)}
                      >
                        <Copy size={11} />
                        JSON
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-lg ml-auto"
                        asChild
                      >
                        <Link to={`/fish/${img.id}`}>
                          <ArrowSquareOut size={12} />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "ghost"}
                  size="sm"
                  className="min-w-9 h-9 p-0 rounded-lg text-xs"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
