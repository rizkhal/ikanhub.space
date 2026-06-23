import { Hono } from "hono";
import {
  getAllImages,
  getRandomImage,
  getImageById,
  getImagesBySpeciesSlug,
  resolveImagePath,
  type FishImage,
} from "../services/metadata.service.js";
import { getResizedImage } from "../lib/image.js";
import { validateDimensions, handleError } from "../middleware/validation.js";

const fishRouter = new Hono();

// Helper: get a valid image buffer, skip if missing
async function getValidImage(images: FishImage[], width: number, height: number) {
  const shuffled = [...images].sort(() => Math.random() - 0.5);

  for (const img of shuffled) {
    try {
      const sourcePath = resolveImagePath(img);
      // Use the resolved absolute path directly
      const buffer = await getResizedImage(img.localPath, width, height, img.id);
      return { buffer, image: img };
    } catch {
      // Image file missing, try next
      continue;
    }
  }
  return null;
}

// Helper: format image response
function formatImageResponse(img: FishImage) {
  return {
    id: img.id,
    scientificName: img.scientificName,
    commonName: img.commonName || null,
    slug: img.slug,
    speciesId: img.speciesId || null,
    author: img.author || null,
    locality: img.locality || null,
    license: img.license || null,
    sourcePageUrl: img.sourcePageUrl || null,
    originalUrl: img.originalUrl || null,
    width: null,
    height: null,
    url: `/fish/id/${img.id}/800/600`,
    metadataUrl: `/fish/id/${img.id}.json`,
  };
}

// ==========================================
// SPECIFIC ROUTES FIRST (before generic params)
// ==========================================

// GET /fish/random.json
fishRouter.get("/random.json", async (c) => {
  const image = getRandomImage();
  if (!image) return handleError(c, "No images available", 404);

  return c.json(formatImageResponse(image));
});

// GET /fish/species/:slug/:width/:height
fishRouter.get("/species/:slug/:width/:height", async (c) => {
  const slug = c.req.param("slug");
  const width = parseInt(c.req.param("width"));
  const height = parseInt(c.req.param("height"));

  const error = validateDimensions(width, height);
  if (error) return handleError(c, error);

  const images = getImagesBySpeciesSlug(slug);
  if (images.length === 0) return handleError(c, "Species not found", 404);

  const result = await getValidImage(images, width, height);
  if (!result) return handleError(c, "No valid images found for this species", 404);

  c.header("Content-Type", "image/jpeg");
  c.header("Cache-Control", "public, max-age=86400");
  c.header("X-Ikanhub-Image-Id", String(result.image.id));
  c.header("X-Ikanhub-Species", result.image.slug);
  return c.body(result.buffer as unknown as Uint8Array<ArrayBuffer>);
});

// GET /fish/id/:id (supports /fish/id/:id.json and /fish/id/:id)
fishRouter.get("/id/:id", async (c) => {
  const rawId = c.req.param("id") || "";

  // Check for .json suffix
  if (rawId.endsWith(".json")) {
    const id = parseInt(rawId.replace(".json", ""));
    if (isNaN(id)) return handleError(c, "Invalid ID");

    const image = getImageById(id);
    if (!image) return handleError(c, "Image not found", 404);

    return c.json(formatImageResponse(image));
  }

  // If no .json suffix, return not found
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

  const image = getImageById(id);
  if (!image) return handleError(c, "Image not found", 404);

  try {
    const buffer = await getResizedImage(image.localPath, width, height, id);

    c.header("Content-Type", "image/jpeg");
    c.header("Cache-Control", "public, max-age=86400");
    c.header("X-Ikanhub-Image-Id", String(image.id));
    c.header("X-Ikanhub-Species", image.slug);
    return c.body(buffer as unknown as Uint8Array<ArrayBuffer>);
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

  const images = getAllImages();
  if (images.length === 0) return handleError(c, "No images available", 404);

  const result = await getValidImage(images, width, height);
  if (!result) return handleError(c, "No valid images found", 404);

  c.header("Content-Type", "image/jpeg");
  c.header("Cache-Control", "public, max-age=86400");
  c.header("X-Ikanhub-Image-Id", String(result.image.id));
  c.header("X-Ikanhub-Species", result.image.slug);
  return c.body(result.buffer as unknown as Uint8Array<ArrayBuffer>);
});

// GET /fish/:size
fishRouter.get("/:size", async (c) => {
  const size = parseInt(c.req.param("size"));

  if (isNaN(size) || size < 1 || size > 3000) {
    return handleError(c, "Size must be a number between 1 and 3000");
  }

  const images = getAllImages();
  if (images.length === 0) return handleError(c, "No images available", 404);

  const result = await getValidImage(images, size, size);
  if (!result) return handleError(c, "No valid images found", 404);

  c.header("Content-Type", "image/jpeg");
  c.header("Cache-Control", "public, max-age=86400");
  c.header("X-Ikanhub-Image-Id", String(result.image.id));
  c.header("X-Ikanhub-Species", result.image.slug);
  return c.body(result.buffer as unknown as Uint8Array<ArrayBuffer>);
});

export default fishRouter;
