/**
 * Metadata Service
 *
 * Loads fish image metadata from a JSON file at startup
 * and provides in-memory query functions.
 *
 * Environment variables:
 *   METADATA_PATH  — path to metadata.json (default: ../../storage/metadata.json)
 *   STORAGE_DIR    — path to storage directory (default: ../../storage)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── Types ──────────────────────────────────────────────────────────────────

export type FishImage = {
  id: number;
  speciesId?: string;
  scientificName: string;
  commonName?: string;
  slug: string;
  filename: string;
  localPath: string;
  originalUrl?: string;
  imageUrl?: string;
  sourcePageUrl?: string;
  photoPageUrl?: string;
  author?: string;
  locality?: string;
  license?: string;
  country?: string;
  region?: string;
  localityNormalized?: string;
  contentType?: string;
  fileSize?: number;
};

// ── Path resolution ────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.resolve(__dirname, "..", "..", "..", "..", "storage");

const METADATA_PATH = process.env.METADATA_PATH
  ? path.resolve(process.env.METADATA_PATH)
  : path.join(STORAGE_DIR, "metadata.json");

// ── Locality normalization ─────────────────────────────────────────────────

const KNOWN_COUNTRIES = new Set([
  "indonesia",
  "philippines",
  "australia",
  "japan",
  "thailand",
  "malaysia",
  "vietnam",
  "china",
  "taiwan",
  "india",
  "sri lanka",
  "bangladesh",
  "myanmar",
  "cambodia",
  "laos",
  "singapore",
  "brunei",
  "timor-leste",
  "papua new guinea",
  "new zealand",
  "fiji",
  "solomon islands",
  "vanuatu",
  "new caledonia",
  "french polynesia",
  "hawaii",
  "united states",
  "mexico",
  "brazil",
  "colombia",
  "ecuador",
  "peru",
  "chile",
  "argentina",
  "venezuela",
  "panama",
  "costa rica",
  "nicaragua",
  "honduras",
  "guatemala",
  "belize",
  "cuba",
  "bahamas",
  "jamaica",
  "puerto rico",
  "dominican republic",
  "south africa",
  "mozambique",
  "madagascar",
  "tanzania",
  "kenya",
  "seychelles",
  "mauritius",
  "egypt",
  "sudan",
  "djibouti",
  "eritrea",
  "oman",
  "yemen",
  "saudi arabia",
  "iran",
  "pakistan",
  "maldives",
  "micronesia",
  "palau",
  "marshall islands",
  "kiribati",
  "tuvalu",
  "samoa",
  "tonga",
  "cook islands",
  "niue",
  "pitcairn islands",
  "easter island",
  "galapagos",
  "socotra",
  "europe",
  "spain",
  "portugal",
  "france",
  "italy",
  "greece",
  "turkey",
  "croatia",
  "montenegro",
  "albania",
  "tunisia",
  "morocco",
  "algeria",
  "libya",
  "israel",
  "lebanon",
  "syria",
  "cyprus",
  "malta",
]);

function normalizeLocality(locality: string | undefined | null): {
  country?: string;
  region?: string;
  localityNormalized?: string;
} {
  if (!locality || locality.trim() === "") return {};

  const parts = locality.split(",").map((p) => p.trim()).filter(Boolean);

  let country: string | undefined;
  let region: string | undefined;
  let localityNormalized: string | undefined;

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (KNOWN_COUNTRIES.has(lower)) {
      // Capitalize properly
      country = part.charAt(0).toUpperCase() + part.slice(1);
      break;
    }
  }

  if (parts.length >= 2) {
    // Region is the last meaningful segment before country
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (KNOWN_COUNTRIES.has(lastPart)) {
      // The second-to-last is likely the region
      if (parts.length >= 3) {
        region = parts[parts.length - 2].trim();
      }
    } else {
      region = parts[parts.length - 1].trim();
    }
  }

  // Locality normalized is the first meaningful part
  if (parts.length > 0) {
    localityNormalized = parts[0].trim();
  }

  return { country, region, localityNormalized };
}

// ── Slug generation ────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Load metadata ──────────────────────────────────────────────────────────

type RawMetadataEntry = {
  speciesId?: string;
  scientificName?: string;
  commonName?: string;
  filename?: string;
  author?: string;
  locality?: string;
  license?: string;
  photoPageUrl?: string;
  imageUrl?: string;
  localPath?: string;
  contentType?: string;
  fileSize?: number;
  [key: string]: unknown;
};

let images: FishImage[] = [];
let loaded = false;

export function loadMetadata(): FishImage[] {
  if (loaded) return images;

  console.log(`📂 Loading metadata from: ${METADATA_PATH}`);

  if (!fs.existsSync(METADATA_PATH)) {
    console.error(`❌ Metadata file not found: ${METADATA_PATH}`);
    images = [];
    loaded = true;
    return images;
  }

  const raw = fs.readFileSync(METADATA_PATH, "utf-8");
  const data: RawMetadataEntry[] = JSON.parse(raw);

  images = data.map((entry, index) => {
    const scientificName = entry.scientificName || "Unknown";
    const slug = slugify(scientificName);
    const localityResult = normalizeLocality(entry.locality);
    const localPath = entry.localPath || "";

    return {
      id: index + 1,
      speciesId: entry.speciesId,
      scientificName,
      commonName: entry.commonName || undefined,
      slug,
      filename: entry.filename || `img_${index + 1}`,
      localPath,
      originalUrl: entry.photoPageUrl || entry.imageUrl || undefined,
      imageUrl: entry.imageUrl || undefined,
      sourcePageUrl: entry.photoPageUrl || undefined,
      photoPageUrl: entry.photoPageUrl || undefined,
      author: entry.author || undefined,
      locality: entry.locality || undefined,
      license: entry.license || undefined,
      contentType: entry.contentType || undefined,
      fileSize: entry.fileSize || undefined,
      ...localityResult,
    };
  });

  console.log(`✅ Loaded ${images.length} fish image records`);
  loaded = true;
  return images;
}

// ── Ensure loaded (call at module import) ───────────────────────────────────
loadMetadata();

// ── Path resolution helper ─────────────────────────────────────────────────

/**
 * Resolve a fish image record's localPath to an absolute filesystem path.
 * Handles both relative paths (e.g. "fishbase-images/...") and absolute paths.
 */
export function resolveImagePath(item: FishImage): string {
  // Get the directory where the metadata file lives
  const metaDir = path.dirname(METADATA_PATH);

  // Try resolving relative to STORAGE_DIR first
  const fromStorage = path.resolve(STORAGE_DIR, item.localPath);
  if (fs.existsSync(fromStorage)) return fromStorage;

  // Try resolving relative to metadata.json location
  const fromMeta = path.resolve(metaDir, item.localPath);
  if (fs.existsSync(fromMeta)) return fromMeta;

  // If it's already absolute (starts with /), use as-is
  if (item.localPath.startsWith("/")) {
    if (fs.existsSync(item.localPath)) return item.localPath;
  }

  // Fall back to STORAGE_DIR resolution even if file doesn't exist yet
  return fromStorage;
}

// ── Query functions ────────────────────────────────────────────────────────

export function getAllImages(): FishImage[] {
  return images;
}

export function getRandomImage(): FishImage | null {
  if (images.length === 0) return null;
  return images[Math.floor(Math.random() * images.length)];
}

export function getImageById(id: number): FishImage | undefined {
  return images.find((img) => img.id === id);
}

export function getImagesBySpeciesSlug(slug: string): FishImage[] {
  return images.filter((img) => img.slug === slug);
}

export function getImagesByLocalitySlug(slug: string): FishImage[] {
  const normalized = slug.replace(/-/g, " ").toLowerCase();
  return images.filter((img) => {
    const loc = (img.locality || "").toLowerCase();
    const country = (img.country || "").toLowerCase();
    const region = (img.region || "").toLowerCase();
    const locNorm = (img.localityNormalized || "").toLowerCase();
    return (
      loc.includes(normalized) ||
      country.includes(normalized) ||
      region.includes(normalized) ||
      locNorm.includes(normalized)
    );
  });
}

export function searchImages(query: string): FishImage[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return images.filter((img) => {
    return (
      img.scientificName.toLowerCase().includes(q) ||
      (img.commonName || "").toLowerCase().includes(q) ||
      (img.author || "").toLowerCase().includes(q) ||
      (img.locality || "").toLowerCase().includes(q) ||
      (img.country || "").toLowerCase().includes(q) ||
      (img.region || "").toLowerCase().includes(q) ||
      (img.localityNormalized || "").toLowerCase().includes(q) ||
      img.filename.toLowerCase().includes(q)
    );
  }).slice(0, 50);
}

export function getStats() {
  const uniqueSlugs = new Set(images.map((img) => img.slug));
  const uniqueSources = new Set(images.map((img) => img.sourcePageUrl).filter(Boolean));

  return {
    totalImages: images.length,
    totalSpecies: uniqueSlugs.size,
    totalSources: uniqueSources.size,
    endpoints: [
      "GET /fish/:width/:height",
      "GET /fish/:size",
      "GET /fish/id/:id/:width/:height",
      "GET /fish/random.json",
      "GET /fish/id/:id.json",
      "GET /fish/species/:slug/:width/:height",
      "GET /api/search?q=...",
      "GET /api/stats",
    ],
  };
}

export function getSpecies(): Array<{
  slug: string;
  scientificName: string;
  commonName?: string;
  imageCount: number;
}> {
  const map = new Map<string, { slug: string; scientificName: string; commonName?: string; imageCount: number }>();

  for (const img of images) {
    if (!map.has(img.slug)) {
      map.set(img.slug, {
        slug: img.slug,
        scientificName: img.scientificName,
        commonName: img.commonName,
        imageCount: 0,
      });
    }
    map.get(img.slug)!.imageCount++;
  }

  return Array.from(map.values()).sort((a, b) => b.imageCount - a.imageCount);
}

export function getLocalities(): Array<{
  slug: string;
  name: string;
  imageCount: number;
}> {
  const map = new Map<string, { slug: string; name: string; imageCount: number }>();

  for (const img of images) {
    if (!img.locality) continue;
    const slug = slugify(img.locality);
    if (!map.has(slug)) {
      map.set(slug, { slug, name: img.locality, imageCount: 0 });
    }
    map.get(slug)!.imageCount++;
  }

  return Array.from(map.values()).sort((a, b) => b.imageCount - a.imageCount);
}

export function getImagesPaginated(page: number, limit: number) {
  const total = images.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paginated = images.slice(start, start + limit);

  return {
    page,
    limit,
    total,
    totalPages,
    images: paginated,
  };
}
