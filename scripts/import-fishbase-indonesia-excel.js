/**
 * import-fishbase-indonesia-excel.js
 *
 * Imports a FishBase Indonesia species checklist from an Excel file.
 * Downloads images, parses remarks for location data, generates
 * metadata.json, failed.json, and localities.json.
 *
 * Usage:
 *   node scripts/import-fishbase-indonesia-excel.js ./data/fishbase-indonesia.xlsx
 *
 * Options:
 *   --sheet=Sheet1       Worksheet name (default: first sheet)
 *   --skip-images        Skip image downloads entirely
 *   --delay=1500         Delay between downloads in ms (default: 1200)
 *   --limit=100          Max species to process
 *   --output=path        Output directory (default: storage/fishbase-indonesia)
 *   --resume             Resume from existing metadata.json
 */

import XLSX from "xlsx";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUTPUT = path.resolve(PROJECT_ROOT, "storage", "fishbase-indonesia");

const FISHBASE_SE = "https://www.fishbase.se";
const FETCH_TIMEOUT = 30000;

// ── CLI Parsing ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag, fallback) {
  const found = args.find((a) => a.startsWith(`${flag}=`));
  if (found) return found.split("=").slice(1).join("=");
  return fallback;
}

function hasFlag(flag) {
  return args.includes(flag);
}

const excelPath = args.find((a) => !a.startsWith("--"));
if (!excelPath) {
  console.error("❌ Usage: node import-fishbase-indonesia-excel.js <excel-file> [options]");
  console.error("   --sheet=Sheet1       Worksheet name (default: first sheet)");
  console.error("   --skip-images        Skip image downloads");
  console.error("   --delay=1500         Delay between downloads in ms");
  console.error("   --limit=100          Max species to process");
  console.error("   --output=path        Output directory");
  console.error("   --resume             Resume from existing metadata.json");
  process.exit(1);
}

const SHEET_NAME = getArg("--sheet", null);
const SKIP_IMAGES = hasFlag("--skip-images");
const DOWNLOAD_DELAY = Math.max(500, parseInt(getArg("--delay", "1200"), 10));
const LIMIT = getArg("--limit", null) ? parseInt(getArg("--limit", null), 10) : null;
const OUTPUT_DIR = path.resolve(getArg("--output", DEFAULT_OUTPUT));
const SHOULD_RESUME = hasFlag("--resume");

const IMAGES_DIR = path.join(OUTPUT_DIR, "images");
const METADATA_FILE = path.join(OUTPUT_DIR, "metadata.json");
const FAILED_FILE = path.join(OUTPUT_DIR, "failed.json");
const LOCALITIES_FILE = path.join(OUTPUT_DIR, "localities.json");

// ── Normalization Helpers ──────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function safeName(text) {
  return text.replace(/[/\\?%*:|"<>]/g, "_").trim();
}

function normalizeScientificName(text) {
  if (!text) return "";
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/["']/g, "");
}

// ── Common Names Parsing ───────────────────────────────────────────────────

function parseCommonNames(text) {
  if (!text || text.trim() === "") return { commonName: "", commonNames: [] };

  const entries = [];
  // Split by comma, handling "(Language)" suffixes
  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const langMatch = part.match(/^(.+?)\s*\(([^)]*)\)\s*$/);
    if (langMatch) {
      entries.push({
        name: langMatch[1].trim(),
        language: langMatch[2].trim(),
      });
    } else {
      entries.push({
        name: part,
        language: "",
      });
    }
  }

  // First English name as commonName, or first entry
  const english = entries.find((e) => e.language.toLowerCase() === "english");
  const first = english || entries[0];

  return {
    commonName: first ? first.name : "",
    commonNames: entries,
  };
}

// ── Remark Parsing ─────────────────────────────────────────────────────────

function extractReferences(remark) {
  if (!remark) return [];
  const refs = [];
  // Match (Ref. 12345) or Ref. 12345 or Also Ref. 12345
  const regex = /(?:Ref\.?\s*)(\d+)/gi;
  let match;
  while ((match = regex.exec(remark)) !== null) {
    if (!refs.includes(match[1])) {
      refs.push(match[1]);
    }
  }
  return refs;
}

function cleanDistributionText(remark) {
  if (!remark) return "";

  let text = remark;

  // Remove reference markers: (Ref. 12345) → empty
  text = text.replace(/\(Ref\.\s*\d+\)/g, "");

  // Remove bare Ref. markers: "Ref. 12345" or "Also Ref. 12345"
  text = text.replace(/(?:Also\s+)?Ref\.?\s*\d+/g, "");

  // Remove trailing/leading conjoined "and" or "also"
  text = text.replace(/\s+(and|also)\s*$/i, "");

  // Clean up double spaces
  text = text.replace(/\s{2,}/g, " ").trim();

  // Clean trailing punctuation
  text = text.replace(/[,;]+$/, "");

  return text;
}

const LOCATION_KEYWORDS = [
  "island", "islands", "bay", "sea", "strait", "pulau", "kepulauan",
  "raja ampat", "bali", "komodo", "manado", "mentawai", "maumere",
  "togean", "banggai", "sangalakki", "weh", "flores", "papua",
  "sumatra", "java", "sulawesi", "maluku", "timor", "jakarta",
  "west papua", "kalimantan", "lombok", "sumbawa", "sumba",
  "yapen", "biak", "seram", "ambon", "ternate", "tidore",
  "halmahera", "buru", "bacans", "gorontalo", "makassar",
  "cenderawasih", "bintan", "batam", "belitung", "bangka",
  "karimunjawa", "seribu", "spermonde", "lembata", "pantai",
  "wakatobi", "taka bonerate", "teluk", "sangihe", "talaud",
  "aniyapu", "anjam", "dili", "siapa",
];

function extractLocationsFromRemark(remark) {
  if (!remark) return [];

  const found = new Set();

  // First, remove references to clean text
  let text = remark;
  text = text.replace(/\(Ref\.\s*\d+\)/g, " ");
  text = text.replace(/(?:Also\s+)?Ref\.?\s*\d+/g, " ");

  // Split by common delimiters
  const segments = text.split(/[.;]+/).map((s) => s.trim()).filter(Boolean);

  for (const segment of segments) {
    // Skip known non-location segments
    const lower = segment.toLowerCase();
    if (
      lower.includes("known from") ||
      lower.includes("also recorded") ||
      lower.includes("occurs in") ||
      lower.includes("distribution") ||
      lower.includes("with an indonesian") ||
      lower.includes("recorded from")
    ) {
      // Try to extract location from "from X" patterns
      const fromMatch = segment.match(/from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
      if (fromMatch) {
        for (const fm of fromMatch) {
          const loc = fm.replace(/^from\s+/i, "").trim();
          if (loc && isLikelyLocation(loc)) {
            found.add(loc);
          }
        }
      }
      // Try to extract "X Islands" pattern
      const islandsMatch = segment.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Islands?/g);
      if (islandsMatch) {
        for (const im of islandsMatch) {
          found.add(im.trim());
        }
      }
      // Try to extract "X Bay", "X Sea", "X Strait"
      const geoMatch = segment.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Bay|Sea|Strait|Sound|Reef|Atoll|Estuary)/g);
      if (geoMatch) {
        for (const gm of geoMatch) {
          found.add(gm.trim());
        }
      }
      // Try named locations after indicators
      const afterFrom = segment.split(/from\s+/i);
      for (let i = 1; i < afterFrom.length; i++) {
        const parts = afterFrom[i].split(/[.,;]/)[0].trim();
        if (parts && isLikelyLocation(parts)) {
          found.add(parts);
        }
      }
    }

    // Check for direct keyword matches
    if (isLikelyLocation(segment)) {
      found.add(segment);
    }

    // Check for "Pulau X" pattern
    const pulauMatch = segment.match(/Pulau\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
    if (pulauMatch) {
      for (const pm of pulauMatch) {
        found.add(pm.trim());
      }
    }

    // Check for "Kepulauan X" pattern
    const kepulauanMatch = segment.match(/Kepulauan\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
    if (kepulauanMatch) {
      for (const km of kepulauanMatch) {
        found.add(km.trim());
      }
    }
  }

  // Clean individual location entries
  const cleaned = [];
  for (const loc of found) {
    const clean = loc
      .replace(/^(known from|also recorded|recorded from|occurs in|found in|including)\s+/i, "")
      .replace(/\s+and\s+$/, "")
      .trim();
    if (clean && clean.length > 2 && isLikelyLocation(clean)) {
      cleaned.push(clean);
    }
  }

  // Deduplicate (case-insensitive)
  const seen = new Set();
  const unique = [];
  for (const loc of cleaned) {
    const key = loc.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(loc);
    }
  }

  return unique;
}

function isLikelyLocation(text) {
  if (!text || text.length < 3) return false;
  const lower = text.toLowerCase();

  // Must start with uppercase letter to be a proper noun
  if (!/^[A-Z]/.test(text)) return false;

  // Contains a location keyword
  for (const kw of LOCATION_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) return true;
  }

  // Common Indonesian location patterns
  if (/^(Pulau|Kepulauan|Teluk|Tanjung|Selat)\s/i.test(text)) return true;

  // Ends with known suffix
  if (/( Islands?| Bay| Sea| Strait| River| Lake| Reef| Atoll)$/i.test(text)) return true;

  // Known Indonesian locations (expanded list)
  const knownLocations = [
    "mentawai", "bali", "maumere", "togean", "banggai", "sangalakki",
    "flores", "papua", "sumatra", "java", "sulawesi", "maluku",
    "timor", "komodo", "manado", "raja ampat", "cenderawasih",
    "yapen", "biak", "seram", "ambon", "ternate", "tidore",
    "halmahera", "buru", "gorontalo", "makassar", "bintan",
    "batam", "belitung", "bangka", "karimunjawa", "lembata",
    "wakatobi", "sangihe", "talaud", "spermonde", "sunda",
    "alor", "pantar", "wetar", "kisar", "romang", "damer",
    "babar", "tanimbar", "keibesar", "aru", "kai", "sapeken",
    "sapudi", "kangean", "masalembu", "bawean", "natuna",
    "anambas", "lingga", "simpang", "sabang", "dili",
  ];

  for (const k of knownLocations) {
    if (lower.includes(k)) return true;
  }

  return false;
}

// ── Excel Hyperlink Extraction ────────────────────────────────────────────

function parseHyperlinkFormula(text) {
  // Handles =HYPERLINK("url", "text") from CSV files
  // Also handles =HYPERLINK("url")
  if (!text) return "";
  const trimmed = text.trim();
  // Match =HYPERLINK("...", "...") or =HYPERLINK('...', '...')
  const match = trimmed.match(/^\s*=\s*HYPERLINK\s*\(\s*["']([^"']+)["'](?:\s*,.*)?\)\s*$/i);
  if (match) return match[1];
  // Also handle HYPERLINK("...") without leading =
  const noEq = trimmed.match(/^\s*HYPERLINK\s*\(\s*["']([^"']+)["'](?:\s*,.*)?\)\s*$/i);
  if (noEq) return noEq[1];
  return "";
}

function extractHyperlinkFromCell(cell) {
  if (!cell) return "";
  // Case 1: Excel native hyperlink (.xlsx)
  if (cell.l && cell.l.Target) {
    return cell.l.Target;
  }
  // Case 2: Direct URL in cell value
  const v = String(cell.v || cell.w || "").trim();
  if (/^https?:\/\//i.test(v)) {
    return v;
  }
  // Case 3: =HYPERLINK() formula (.csv from Excel)
  const formulaUrl = parseHyperlinkFormula(cell.w || cell.v || cell.z || "");
  if (formulaUrl) return formulaUrl;
  // Case 4: Raw cell value might be the formula if w/v/z is "Open image"
  // but cell.f (formula) is set
  if (cell.f) {
    const rawFormulaUrl = parseHyperlinkFormula(cell.f);
    if (rawFormulaUrl) return rawFormulaUrl;
  }
  return "";
}

// ── FishBase Image URL Resolution ─────────────────────────────────────────

function resolveFishBaseImageUrl(inputUrl) {
  if (!inputUrl || inputUrl.trim() === "") {
    return { originalUrl: "", imageUrl: "", filename: "", imageQuality: "" };
  }

  const url = inputUrl.trim();

  // CASE 1: Thumbnail URL — /images/thumbnails/jpg/tn_<filename>
  const thumbMatch = url.match(/\/images\/thumbnails\/.*?\/(tn_(?:.+\.(?:jpe?g|png|gif|webp)))/i);
  if (thumbMatch) {
    const fullFilename = thumbMatch[1];
    const actualFilename = fullFilename.startsWith("tn_") ? fullFilename.slice(3) : fullFilename;
    const imageUrl = `${FISHBASE_SE}/images/species/${actualFilename}`;
    return {
      originalUrl: url,
      imageUrl,
      filename: actualFilename,
      imageQuality: "full",
    };
  }

  // CASE 2: Direct species image URL
  const directSpecies = url.match(/\/images\/species\/(.+\.(?:jpe?g|png|gif|webp))/i);
  if (directSpecies) {
    return {
      originalUrl: url,
      imageUrl: url,
      filename: directSpecies[1],
      imageQuality: "full",
    };
  }

  // CASE 3: Any direct image URL
  if (/\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(url)) {
    const basename = url.split("/").pop().split("?")[0];
    return {
      originalUrl: url,
      imageUrl: url,
      filename: basename || "",
      imageQuality: "full",
    };
  }

  // CASE 4: FishBase photo page URL (PicturesSummary.php)
  if (/PicturesSummary\.php/i.test(url)) {
    const picParam = extractFilenameFromFishbasePageUrl(url);
    if (picParam) {
      const imageUrl = `${FISHBASE_SE}/images/species/${picParam}`;
      return {
        originalUrl: url,
        imageUrl,
        filename: picParam,
        imageQuality: "full",
      };
    }
  }

  // CASE 5: Unknown format — try as direct image anyway
  if (/^https?:\/\//i.test(url)) {
    const basename = url.split("/").pop().split("?")[0];
    if (basename) {
      return {
        originalUrl: url,
        imageUrl: url,
        filename: basename,
        imageQuality: "full",
      };
    }
  }

  return { originalUrl: "", imageUrl: "", filename: "", imageQuality: "" };
}

function extractFilenameFromFishbasePageUrl(url) {
  try {
    const parsed = new URL(url);
    const pic = parsed.searchParams.get("pic");
    if (pic) return pic;
  } catch {
    // ignore
  }
  const match = url.match(/[?&]pic=([^&]+)/);
  if (match) return match[1];
  return null;
}

async function resolveFishBasePhotoPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IkanhubBot/1.0; +https://ikanhub.space)",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);
    const picInput = $('input[name="pic"]').val();
    if (picInput) return String(picInput);
    const imgSrc = $("img[src*='species']").first().attr("src");
    if (imgSrc) {
      return imgSrc.split("/").pop();
    }
    return null;
  } catch {
    return null;
  }
}

// ── Picture URL Resolution from Cell ──────────────────────────────────────

function resolvePictureUrl(cellValue, hyperlink) {
  // Priority 1: Resolved hyperlink (from hyperlink map or Excel native)
  if (hyperlink && /^https?:\/\//i.test(hyperlink.trim())) {
    return hyperlink.trim();
  }
  // Priority 2: Cell value is a direct URL
  if (cellValue && /^https?:\/\//i.test(cellValue.trim())) {
    return cellValue.trim();
  }
  // Priority 3: Cell value contains =HYPERLINK() formula (.csv from Excel)
  if (cellValue) {
    const formulaUrl = parseHyperlinkFormula(cellValue);
    if (formulaUrl) return formulaUrl;
  }
  return "";
}

// ── Image Download ─────────────────────────────────────────────────────────

async function downloadImage(url, outputPath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; IkanhubBot/1.0; +https://ikanhub.space)",
      Accept: "image/webp,image/avif,image/jpeg,image/png,*/*",
    },
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Not an image: ${contentType}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length < 2048) {
    throw new Error(`Image too small: ${buffer.length} bytes`);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);

  return { buffer, contentType, fileSize: buffer.length };
}

// ── Geo Placeholder Builder ────────────────────────────────────────────────

function buildGeoPlaceholder() {
  return {
    country: "Indonesia",
    province: "",
    city: "",
    regency: "",
    district: "",
    region: "",
    locality: "",
    wpp: "",
    latitude: null,
    longitude: null,
  };
}

// ── Locality Generation ────────────────────────────────────────────────────

function generateLocalities(metadata) {
  const groups = {};

  // Always create Indonesia grouping
  groups["indonesia"] = {
    slug: "indonesia",
    name: "Indonesia",
    country: "Indonesia",
    province: "",
    city: "",
    regency: "",
    district: "",
    region: "",
    wpp: "",
    locality: "",
    latitude: null,
    longitude: null,
    imageCount: 0,
    speciesCount: new Set(),
    sampleImage: "",
  };

  // Collect all unique locations from locationsMentioned across metadata
  for (const item of metadata) {
    // Indonesia group
    if (item.hasImage) groups["indonesia"].imageCount++;
    groups["indonesia"].speciesCount.add(item.scientificName);
    if (!groups["indonesia"].sampleImage && item.localPath && item.hasImage) {
      groups["indonesia"].sampleImage = item.localPath;
    }

    // Location-specific groups
    const locations = item.locationsMentioned || [];
    for (const loc of locations) {
      const locSlug = slugify(loc);
      if (!groups[locSlug]) {
        groups[locSlug] = {
          slug: locSlug,
          name: loc,
          country: "Indonesia",
          province: "",
          city: "",
          regency: "",
          district: "",
          region: "",
          wpp: "",
          locality: "",
          latitude: null,
          longitude: null,
          imageCount: 0,
          speciesCount: new Set(),
          sampleImage: "",
        };
      }
      if (item.hasImage) groups[locSlug].imageCount++;
      groups[locSlug].speciesCount.add(item.scientificName);
      if (!groups[locSlug].sampleImage && item.localPath && item.hasImage) {
        groups[locSlug].sampleImage = item.localPath;
      }
    }
  }

  // Convert to array
  return Object.values(groups).map((g) => ({
    slug: g.slug,
    name: g.name,
    country: g.country,
    province: g.province,
    city: g.city,
    regency: g.regency,
    district: g.district,
    region: g.region,
    wpp: g.wpp,
    latitude: g.latitude,
    longitude: g.longitude,
    imageCount: g.imageCount,
    speciesCount: g.speciesCount.size,
    sampleImage: g.sampleImage || "",
  }));
}

// ── JSON Save Helper ──────────────────────────────────────────────────────

async function saveJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Column Detection (flexible header matching) ────────────────────────────

function detectColumn(headers, candidates) {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const idx = lower.indexOf(candidate.toLowerCase());
    if (idx !== -1) return headers[idx];
  }
  for (const candidate of candidates) {
    const found = lower.find((h) => h.includes(candidate.toLowerCase()));
    if (found) return headers[lower.indexOf(found)];
  }
  return null;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🐟 IkanHub — FishBase Indonesia Excel Importer");
  console.log("================================================\n");

  // ── Phase 1: Read Excel ─────────────────────────────────────────────────

  console.log(`📖 Reading Excel file: ${excelPath}`);
  const workbook = XLSX.readFile(excelPath);
  const sheetName = SHEET_NAME || workbook.SheetNames[0];
  console.log(`📄 Worksheet: ${sheetName}`);

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] || [];

  console.log(`📊 Rows found: ${rows.length}`);

  if (rows.length === 0) {
    console.error("❌ No data rows found in worksheet.");
    process.exit(1);
  }

  // Detect columns
  const headers = Object.keys(rows[0] || {});
  const colMap = {
    family: detectColumn(headers, ["family"]),
    species: detectColumn(headers, ["species"]),
    author: detectColumn(headers, ["author"]),
    information: detectColumn(headers, ["information"]),
    occurrence: detectColumn(headers, ["occurrence"]),
    commonNames: detectColumn(headers, ["common names", "common_names", "common name", "commonname"]),
    abundance: detectColumn(headers, ["abundance"]),
    maxLength: detectColumn(headers, ["max. length", "max length", "maxlength"]),
    maturity: detectColumn(headers, ["maturity"]),
    remark: detectColumn(headers, ["remark", "remarks"]),
    picture: detectColumn(headers, ["picture", "photo", "image", "pic"]),
  };

  console.log("\n📋 Column mapping:");
  let hasAll = true;
  for (const [key, val] of Object.entries(colMap)) {
    const status = val ? `"${val}"` : "❌ not found";
    if (!val) hasAll = false;
    console.log(`   ${key}: ${status}`);
  }

  if (!colMap.species) {
    console.error('\n❌ Required column "Species" not found.');
    console.error("   Available columns:", headers.join(", "));
    process.exit(1);
  }

  // ── Phase 2: Load existing metadata (resume) ───────────────────────────

  let metadata = [];
  let existingSpecies = new Map();
  let failed = [];

  if (SHOULD_RESUME) {
    try {
      const existingRaw = await fs.readFile(METADATA_FILE, "utf-8");
      metadata = JSON.parse(existingRaw);
      for (const item of metadata) {
        existingSpecies.set(item.scientificName.toLowerCase(), item);
      }
      console.log(`\n🔄 Resume mode: Loaded ${metadata.length} existing records`);
    } catch {
      console.log("\n🔄 Resume mode: No existing metadata.json found, starting fresh");
    }
    try {
      const failedRaw = await fs.readFile(FAILED_FILE, "utf-8");
      failed = JSON.parse(failedRaw);
    } catch {
      failed = [];
    }
  }

  // ── Phase 3: Build hyperlink map ───────────────────────────────────────

  const hyperlinkMap = new Map();
  const pictureColKey = colMap.picture;

  for (let r = 0; r < rows.length; r++) {
    const rowHyperlinks = {};
    const excelRow = r + 2; // +2 because row 0 is header + 0-index

    if (pictureColKey) {
      const colIdx = headerRow.findIndex(
        (h) => String(h).toLowerCase().trim() === pictureColKey.toLowerCase().trim()
      );
      if (colIdx !== -1) {
        const cellRef = XLSX.utils.encode_cell({ r: excelRow, c: colIdx });
        const cell = sheet[cellRef];
        if (cell) {
          const href = extractHyperlinkFromCell(cell);
          if (href) {
            rowHyperlinks[pictureColKey] = href;
          }
        }
      }
    }
    hyperlinkMap.set(r, rowHyperlinks);
  }

  // ── Phase 4: Process rows ──────────────────────────────────────────────

  let imported = 0;
  let imagesDownloaded = 0;
  let fullImages = 0;
  let thumbnailImages = 0;
  let noImage = 0;
  let skipped = 0;
  let failedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowHyperlinks = hyperlinkMap.get(i) || {};
    const rowNumber = i + 2;

    const rawScientificName = normalizeScientificName(String(row[colMap.species] || ""));
    if (!rawScientificName) {
      skipped++;
      continue;
    }

    const scientificName = rawScientificName;
    const slug = slugify(scientificName);

    // ── Deduplication ──
    const existingKey = scientificName.toLowerCase();
    if (existingSpecies.has(existingKey)) {
      const existing = existingSpecies.get(existingKey);

      // Check if this duplicate has an image we're missing
      const pictureCell = colMap.picture ? String(row[colMap.picture] || "").trim() : "";
      const pictureHyperlink = rowHyperlinks[pictureColKey] || "";
      const pictureUrl = resolvePictureUrl(pictureCell, pictureHyperlink);

      if (pictureUrl && !existing.hasImage) {
        console.log(`   🔄 Updating image for: ${scientificName}`);
      } else {
        skipped++;
        if (imported % 50 === 0 && imported > 0) process.stdout.write(".");
        continue;
      }
    }

    // ── Limit check ──
    if (LIMIT !== null && imported >= LIMIT) {
      console.log(`\n⏸️  Reached limit of ${LIMIT} species, stopping.`);
      break;
    }

    // ── Picture resolution ──
    const pictureCell = colMap.picture ? String(row[colMap.picture] || "").trim() : "";
    const pictureHyperlink = rowHyperlinks[pictureColKey] || "";
    const pictureUrl = resolvePictureUrl(pictureCell, pictureHyperlink);

    const resolved = pictureUrl ? resolveFishBaseImageUrl(pictureUrl) : null;
    const filename = resolved ? resolved.filename : "";
    const imageUrl = resolved ? resolved.imageUrl : "";
    const originalUrl = resolved ? resolved.originalUrl : "";

    const speciesDirName = scientificName.replace(/\s+/g, "_");
    const localPath = filename
      ? path.posix.join("storage", "fishbase-indonesia", "images", speciesDirName, filename)
      : "";
    const imageLocalPath = filename
      ? path.join(IMAGES_DIR, speciesDirName, filename)
      : "";

    let hasImage = false;
    let imageQuality = "";
    let imageDownloadError = null;

    // ── Download image ──
    if (!SKIP_IMAGES && imageUrl && filename) {
      try {
        if (resolved.imageQuality === "full") {
          try {
            await downloadImage(imageUrl, imageLocalPath);
            hasImage = true;
            imageQuality = "full";
            fullImages++;
            imagesDownloaded++;
          } catch (err) {
            // Fallback to thumbnail if available
            if (resolved.originalUrl && resolved.originalUrl !== resolved.imageUrl) {
              try {
                await downloadImage(resolved.originalUrl, imageLocalPath);
                hasImage = true;
                imageQuality = "thumbnail";
                thumbnailImages++;
                imagesDownloaded++;
              } catch (thumbErr) {
                imageDownloadError = `Full: ${err.message}; Thumb: ${thumbErr.message}`;
              }
            } else {
              imageDownloadError = err.message;
            }
          }
        } else {
          try {
            await downloadImage(imageUrl, imageLocalPath);
            hasImage = true;
            imageQuality = "full";
            fullImages++;
            imagesDownloaded++;
          } catch (err) {
            imageDownloadError = err.message;
          }
        }
        await sleep(DOWNLOAD_DELAY);
      } catch (err) {
        imageDownloadError = err.message;
      }
    }

    // ── Parse fields ──

    const family = colMap.family ? String(row[colMap.family] || "").trim() : "";
    const author = colMap.author ? String(row[colMap.author] || "").trim() : "";
    const information = colMap.information ? String(row[colMap.information] || "").trim() : "";
    const occurrence = colMap.occurrence ? String(row[colMap.occurrence] || "").trim() : "";
    const abundance = colMap.abundance ? String(row[colMap.abundance] || "").trim() : "";
    const maxLength = colMap.maxLength ? String(row[colMap.maxLength] || "").trim() : "";
    const maturity = colMap.maturity ? String(row[colMap.maturity] || "").trim() : "";
    const rawRemark = colMap.remark ? String(row[colMap.remark] || "").trim() : "";
    const rawCommonNames = colMap.commonNames ? String(row[colMap.commonNames] || "").trim() : "";

    // Parse common names
    const { commonName, commonNames } = parseCommonNames(rawCommonNames);

    // Parse remark
    const references = extractReferences(rawRemark);
    const distributionText = cleanDistributionText(rawRemark);
    const locationsMentioned = extractLocationsFromRemark(rawRemark);

    const geo = buildGeoPlaceholder();

    // ── Build metadata item ──

    let item;
    const existingItem = existingSpecies.get(existingKey);

    if (existingItem && hasImage && !existingItem.hasImage) {
      existingItem.hasImage = true;
      existingItem.filename = filename;
      existingItem.localPath = localPath;
      existingItem.imageUrl = imageUrl;
      existingItem.originalUrl = originalUrl;
      existingItem.imageQuality = imageQuality;
      existingItem.photoPageUrl = pictureCell.startsWith("http") ? pictureCell : "";
      item = existingItem;
    } else {
      item = {
        id: existingItem ? existingItem.id : metadata.length + 1,
        speciesId: "",
        order: "",
        family,
        scientificName,
        author,
        commonName,
        commonNames,
        slug,
        information,
        occurrence,
        abundance,
        maxLength,
        maturity,
        remark: rawRemark,
        country: "Indonesia",
        province: "",
        city: "",
        regency: "",
        district: "",
        region: "",
        locality: "",
        localityNormalized: "",
        wpp: "",
        locationsMentioned,
        distributionText,
        references,
        geo,
        filename,
        localPath,
        originalUrl: originalUrl || "",
        imageUrl,
        sourcePageUrl: "",
        photoPageUrl: pictureCell.startsWith("http") ? pictureCell : "",
        author: "",
        license: "",
        source: "FishBase Indonesia Excel Checklist",
        imageQuality,
        hasImage,
      };

      if (!existingItem) {
        metadata.push(item);
        existingSpecies.set(existingKey, item);
      }
    }

    // ── Save failure ──
    if (!hasImage && imageDownloadError) {
      failed.push({
        rowNumber,
        scientificName,
        picture: pictureCell,
        hyperlink: pictureHyperlink || "",
        resolvedImageUrl: imageUrl || "",
        error: imageDownloadError,
      });
      failedCount++;
      noImage++;
    } else if (!hasImage && !pictureCell) {
      noImage++;
    }

    imported++;

    // ── Progress ──
    if (imported % 20 === 0 || imported === 1) {
      console.log(
        `   ✅ ${imported} processed | 📷 ${imagesDownloaded} images | 🗺️ ${locationsMentioned.length} locations | ❌ ${failedCount} failed`
      );
    }

    // ── Save after every row for resume safety ──
    try {
      await saveJson(METADATA_FILE, metadata);
      if (failed.length > 0) await saveJson(FAILED_FILE, failed);
      const localities = generateLocalities(metadata);
      await saveJson(LOCALITIES_FILE, localities);
    } catch (err) {
      console.error(`   ⚠️  Failed to save state: ${err.message}`);
    }
  }

  // ── Phase 5: Final save & summary ──────────────────────────────────────

  metadata.forEach((item, idx) => {
    item.id = idx + 1;
  });

  const localities = generateLocalities(metadata);

  await saveJson(METADATA_FILE, metadata);
  await saveJson(LOCALITIES_FILE, localities);
  if (failed.length > 0) await saveJson(FAILED_FILE, failed);

  console.log("\n\n==============================================");
  console.log("📊 IMPORT SUMMARY");
  console.log("==============================================");
  console.log(`   📄 Rows read:           ${rows.length}`);
  console.log(`   🐟 Species imported:    ${imported}`);
  console.log(`   📷 Images downloaded:   ${imagesDownloaded}`);
  console.log(`      ├ Full quality:      ${fullImages}`);
  console.log(`      └ Thumbnail only:    ${thumbnailImages}`);
  console.log(`   🚫 Species w/o image:   ${noImage}`);
  console.log(`   ❌ Failed:              ${failedCount}`);
  console.log(`   ⏭️  Skipped (duplicate): ${skipped}`);
  console.log(`   🗺️  Localities found:    ${localities.length}`);
  console.log("");
  console.log(`   📁 Metadata:    ${METADATA_FILE}`);
  console.log(`   📁 Localities:  ${LOCALITIES_FILE}`);
  console.log(`   📁 Failed:      ${FAILED_FILE}`);
  console.log(`   📁 Images:      ${IMAGES_DIR}`);
  console.log("==============================================\n");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err);
  process.exit(1);
});
