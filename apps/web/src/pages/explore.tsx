import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, MagnifyingGlass, Spinner, ArrowSquareOut, Code } from "@phosphor-icons/react";

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
  const [images, setImages] = useState<FishImage[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  const copyUrl = async (url: string, id: number) => {
    await navigator.clipboard.writeText(`${API_URL}${url}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearch = () => {
    if (!search.trim()) {
      setSelectedSpecies("");
      return;
    }
    setSelectedSpecies(search);
    setPage(1);
  };

  return (
    <div className="container py-12 md:py-16 space-y-8">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Explore Images</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Browse the collection of fish images. Click on any image for details and copy options.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search by species, name, or locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <MagnifyingGlass size={16} className="mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Species chips */}
      {species.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={!selectedSpecies ? "default" : "outline"}
            className="cursor-pointer rounded-full"
            onClick={() => {
              setSelectedSpecies("");
              setSearch("");
              setPage(1);
            }}
          >
            All
          </Badge>
          {species.slice(0, 20).map((s) => (
            <Badge
              key={s.slug}
              variant={selectedSpecies === s.scientificName ? "default" : "outline"}
              className="cursor-pointer rounded-full"
              onClick={() => {
                setSelectedSpecies(s.scientificName);
                setSearch(s.scientificName);
                setPage(1);
              }}
            >
              {s.commonName || s.scientificName}
              <span className="ml-1 text-xs opacity-60">({s.imageCount})</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size={24} className="animate-spin text-primary" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No images found. Try a different search.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <Card key={img.id} className="group overflow-hidden">
              <CardContent className="p-0">
                <Link to={`/fish/${img.id}`} className="block aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={`${API_URL}${img.url}`}
                    alt={img.scientificName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23eaeaea' width='400' height='300'/%3E%3C/svg%3E";
                    }}
                  />
                </Link>
                <div className="p-3 space-y-1.5">
                  <Link
                    to={`/fish/${img.id}`}
                    className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                  >
                    <em>{img.scientificName}</em>
                  </Link>
                  {img.commonName && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {img.commonName}
                    </p>
                  )}
                  <div className="flex gap-1.5 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyUrl(img.url, img.id)}
                    >
                      {copiedId === img.id ? (
                        <Check size={12} className="text-green-600" />
                      ) : (
                        <Copy size={12} />
                      )}
                      Image
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyUrl(img.metadataUrl, -img.id)}
                    >
                      <Code size={12} />
                      JSON
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" asChild>
                      <Link to={`/fish/${img.id}`}>
                        <ArrowSquareOut size={12} />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
