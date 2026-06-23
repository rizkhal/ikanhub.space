import { Hono } from "hono";
import prisma from "../lib/prisma.js";
import { getResizedImage, getImageBuffer } from "../lib/image.js";
import { validateDimensions, handleError } from "../middleware/validation.js";
import crypto from "crypto";

const fishRouter = new Hono();

// Helper: hash IP
function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

// Helper: pick a random image from an array
function randomImage(images: any[]) {
  if (images.length === 0) return null;
  return images[Math.floor(Math.random() * images.length)];
}

// Helper: log request
async function logRequest(
  endpoint: string,
  width: number | null,
  height: number | null,
  fishImageId: number | null,
  ipHash: string | null,
  userAgent: string | null
) {
  try {
    await prisma.apiRequestLog.create({
      data: { endpoint, width, height, fishImageId, ipHash, userAgent },
    });
  } catch {
    // silently fail logging
  }
}

// Helper: get a valid image buffer, skip if missing
async function getValidImage(images: any[], width: number, height: number) {
  // Shuffle for randomness
  const shuffled = [...images].sort(() => Math.random() - 0.5);

  for (const img of shuffled) {
    try {
      const buffer = await getResizedImage(img.localPath, width, height);
      return { buffer, image: img };
    } catch {
      // Image file missing, try next
      continue;
    }
  }
  return null;
}

// ==========================================
// SPECIFIC ROUTES FIRST (before generic params)
// ==========================================

// GET /fish/random.json
fishRouter.get("/random.json", async (c) => {
  const count = await prisma.fishImage.count();
  if (count === 0) return handleError(c, "No images available", 404);

  const skip = Math.floor(Math.random() * count);
  const [image] = await prisma.fishImage.findMany({
    take: 1,
    skip,
  });

  if (!image) return handleError(c, "No images available", 404);

  const ip = c.req.header("x-forwarded-for") || "unknown";
  const ua = c.req.header("user-agent") || null;
  await logRequest(`/fish/random.json`, null, null, image.id, hashIP(ip), ua);

  return c.json({
    id: image.id,
    scientificName: image.scientificName,
    commonName: image.commonName,
    slug: image.slug,
    speciesId: image.speciesId,
    author: image.author,
    locality: image.locality,
    license: image.license,
    sourcePageUrl: image.sourcePageUrl,
    originalUrl: image.originalUrl,
    width: image.width,
    height: image.height,
    url: `/fish/id/${image.id}/800/600`,
    metadataUrl: `/fish/id/${image.id}.json`,
  });
});

// GET /fish/species/:slug/:width/:height
fishRouter.get("/species/:slug/:width/:height", async (c) => {
  const slug = c.req.param("slug");
  const width = parseInt(c.req.param("width"));
  const height = parseInt(c.req.param("height"));

  const error = validateDimensions(width, height);
  if (error) return handleError(c, error);

  const images = await prisma.fishImage.findMany({ where: { slug } });
  if (images.length === 0) return handleError(c, "Species not found", 404);

  const result = await getValidImage(images, width, height);
  if (!result) return handleError(c, "No valid images found for this species", 404);

  const ip = c.req.header("x-forwarded-for") || "unknown";
  const ua = c.req.header("user-agent") || null;
  await logRequest(`/fish/species/:slug/:w/:h`, width, height, result.image.id, hashIP(ip), ua);

  c.header("Content-Type", "image/jpeg");
  c.header("Cache-Control", "public, max-age=86400");
  c.header("X-Ikanhub-Image-Id", String(result.image.id));
  c.header("X-Ikanhub-Species", result.image.slug);
  return c.body(result.buffer);
});

// GET /fish/id/:id (supports /fish/id/:id.json and /fish/id/:id)
fishRouter.get("/id/:id", async (c) => {
  const rawId = c.req.param("id") || "";

  // Check for .json suffix
  if (rawId.endsWith(".json")) {
    const id = parseInt(rawId.replace(".json", ""));
    if (isNaN(id)) return handleError(c, "Invalid ID");

    const image = await prisma.fishImage.findUnique({ where: { id } });
    if (!image) return handleError(c, "Image not found", 404);

    const ip = c.req.header("x-forwarded-for") || "unknown";
    const ua = c.req.header("user-agent") || null;
    await logRequest(`/fish/id/:id.json`, null, null, image.id, hashIP(ip), ua);

    return c.json({
      id: image.id,
      scientificName: image.scientificName,
      commonName: image.commonName,
      slug: image.slug,
      speciesId: image.speciesId,
      author: image.author,
      locality: image.locality,
      license: image.license,
      sourcePageUrl: image.sourcePageUrl,
      originalUrl: image.originalUrl,
      width: image.width,
      height: image.height,
      url: `/fish/id/${image.id}/800/600`,
      metadataUrl: `/fish/id/${image.id}.json`,
    });
  }

  // If no .json suffix, return not found (other routes handle /id/:id/:width/:height)
  return handleError(c, "Use /fish/id/:id.json for metadata or /fish/id/:id/:width/:height for an image", 404);
});

// GET /fish/id/:id/:width/:height
fishRouter.get("/id/:id/:width/:height", async (c) => {
  const id = parseInt(c.req.param("id"));
  const width = parseInt(c.req.param("width"));
  const height = parseInt(c.req.param("height"));

  if (isNaN(id)) return handleError(c, "Invalid ID", 400);
  const error = validateDimensions(width, height);
  if (error) return handleError(c, error);

  const image = await prisma.fishImage.findUnique({ where: { id } });
  if (!image) return handleError(c, "Image not found", 404);

  try {
    const buffer = await getResizedImage(image.localPath, width, height);

    const ip = c.req.header("x-forwarded-for") || "unknown";
    const ua = c.req.header("user-agent") || null;
    await logRequest(`/fish/id/:id/:w/:h`, width, height, id, hashIP(ip), ua);

    c.header("Content-Type", "image/jpeg");
    c.header("Cache-Control", "public, max-age=86400");
    c.header("X-Ikanhub-Image-Id", String(image.id));
    c.header("X-Ikanhub-Species", image.slug);
    return c.body(buffer);
  } catch {
    return handleError(c, "Image file not found on disk", 404);
  }
});

// ==========================================
// GENERIC ROUTES LAST
// ==========================================

// GET /fish/:width/:height
fishRouter.get("/:width/:height", async (c) => {
  const width = parseInt(c.req.param("width"));
  const height = parseInt(c.req.param("height"));

  const error = validateDimensions(width, height);
  if (error) return handleError(c, error);

  const images = await prisma.fishImage.findMany();
  if (images.length === 0) return handleError(c, "No images available", 404);

  const result = await getValidImage(images, width, height);
  if (!result) return handleError(c, "No valid images found", 404);

  const ip = c.req.header("x-forwarded-for") || "unknown";
  const ua = c.req.header("user-agent") || null;
  await logRequest(`/fish/:w/:h`, width, height, result.image.id, hashIP(ip), ua);

  c.header("Content-Type", "image/jpeg");
  c.header("Cache-Control", "public, max-age=86400");
  c.header("X-Ikanhub-Image-Id", String(result.image.id));
  c.header("X-Ikanhub-Species", result.image.slug);
  return c.body(result.buffer);
});

// GET /fish/:size
fishRouter.get("/:size", async (c) => {
  const size = parseInt(c.req.param("size"));

  if (isNaN(size) || size < 1 || size > 3000) {
    return handleError(c, "Size must be a number between 1 and 3000");
  }

  const images = await prisma.fishImage.findMany();
  if (images.length === 0) return handleError(c, "No images available", 404);

  const result = await getValidImage(images, size, size);
  if (!result) return handleError(c, "No valid images found", 404);

  const ip = c.req.header("x-forwarded-for") || "unknown";
  const ua = c.req.header("user-agent") || null;
  await logRequest(`/fish/:size`, size, size, result.image.id, hashIP(ip), ua);

  c.header("Content-Type", "image/jpeg");
  c.header("Cache-Control", "public, max-age=86400");
  c.header("X-Ikanhub-Image-Id", String(result.image.id));
  c.header("X-Ikanhub-Species", result.image.slug);
  return c.body(result.buffer);
});

export default fishRouter;
