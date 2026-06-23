import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, MagnifyingGlass, ArrowSquareOut, Image, Fish, SlidersHorizontal } from "@phosphor-icons/react";

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
    <div className="relative">
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-ocean-pattern pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />
        <div className="container relative z-10 pt-28 pb-28 md:pt-32 md:pb-32">
          <div className="max-w-3xl">
            <p className="section-kicker mb-3">Explore</p>
            <h1 className="display-title text-5xl md:text-7xl">Unsplash-style discovery for fish.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Browse photographic fish records, inspect attribution, and copy image or metadata endpoints from the collection.
            </p>
          </div>
        </div>
      </section>

      {/* Floating search + filter toolbar */}
      <div className="relative z-20">
        <div className="container">
          <div className="-mt-14 md:-mt-16 mb-10 md:mb-14 rounded-[2rem] border border-border/50 bg-card/85 shadow-card-glow backdrop-blur-xl p-5 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <MagnifyingGlass
                  size={20}
                  weight="bold"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search species, common name, locality..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-12 rounded-2xl border-border/60 bg-background/70 pl-12 text-base shadow-none"
                />
              </div>
              <Button onClick={handleSearch} className="h-12 rounded-2xl px-6 shrink-0">
                Search
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <SlidersHorizontal size={14} weight="bold" className="text-primary shrink-0" />
              <span className="text-xs text-muted-foreground">
                {selectedSpecies
                  ? `Filtered by ${selectedSpecies}`
                  : "Showing the full image collection"}
              </span>
            </div>

            {/* Species chips */}
            {species.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/40">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={!selectedSpecies ? "default" : "outline"}
                    className="cursor-pointer rounded-xl px-3.5 py-2 text-xs font-medium transition-all hover:-translate-y-0.5"
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
                      className="cursor-pointer rounded-xl px-3.5 py-2 text-xs font-medium transition-all hover:-translate-y-0.5 hover:border-primary/50"
                      onClick={() => {
                        setSelectedSpecies(s.scientificName);
                        setSearch(s.scientificName);
                        setPage(1);
                      }}
                    >
                      {s.commonName || s.scientificName}
                      <span className="ml-1.5 opacity-60">({s.imageCount})</span>
                    </Badge>
                  ))}
                  {species.length > 12 && (
                    <Badge
                      variant="outline"
                      className="cursor-pointer rounded-xl px-3.5 py-2 text-xs font-medium"
                      onClick={() => setSpeciesExpanded(!speciesExpanded)}
                    >
                      {speciesExpanded ? "Show less" : `+${species.length - 12} more`}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container pb-10 md:pb-14 space-y-10">

      {/* Grid */}
      {loading ? (
        <div className="masonry-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <div
                className="rounded-3xl skeleton-shimmer"
                style={{
                  height: `${[260, 360, 300, 430, 280, 390, 330, 470][i]}px`,
                }}
              />
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="glass-panel mx-auto max-w-xl rounded-3xl py-20 text-center space-y-4">
          <Fish size={42} className="mx-auto text-primary/50" weight="light" />
          <p className="text-xl font-semibold">No images found</p>
          <p className="text-sm text-muted-foreground/60">
            Try a different search or species filter.
          </p>
        </div>
      ) : (
        <div className="masonry-grid">
          {images.map((img) => {
            const aspectRatio = img.width && img.height ? img.width / img.height : 1.33;
            return (
              <article key={img.id} className="masonry-item group">
                <div className="overflow-hidden rounded-3xl bg-card shadow-card-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(6,40,61,0.18)]">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/12 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 translate-y-3 p-4 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="text-sm font-semibold leading-tight">
                        <em>{img.scientificName}</em>
                      </p>
                      <p className="mt-1 text-xs text-white/70">{img.locality || img.commonName || "Metadata available"}</p>
                    </div>
                  </Link>
                  <div className="p-4 space-y-3">
                    <Link
                      to={`/fish/${img.id}`}
                      className="block font-semibold text-sm hover:text-primary transition-colors"
                    >
                      <em>{img.scientificName}</em>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {img.commonName && <span>{img.commonName}</span>}
                      {img.license && <span className="rounded-md bg-muted px-2 py-1 font-mono">{img.license}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs gap-1.5 rounded-xl"
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
                        className="h-8 text-xs gap-1.5 rounded-xl"
                        onClick={() => copyUrl(img.metadataUrl, -img.id)}
                      >
                        <Copy size={11} />
                        JSON
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-xl ml-auto"
                        asChild
                      >
                        <Link to={`/fish/${img.id}`}>
                          <ArrowSquareOut size={12} />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
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
    </div>
  );
}
