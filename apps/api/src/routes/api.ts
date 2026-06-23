import { Hono } from "hono";
import {
  searchImages,
  getStats,
  getSpecies,
  getLocalities,
  getImagesByLocalitySlug,
  getImagesPaginated,
} from "../services/metadata.service.js";

const apiRouter = new Hono();

// GET /api/search?q=...
apiRouter.get("/search", async (c) => {
  const q = c.req.query("q");
  if (!q || q.trim() === "") {
    return c.json({ results: [], query: q });
  }

  const results = searchImages(q.trim());

  return c.json({
    query: q.trim(),
    count: results.length,
    results: results.map((img) => ({
      id: img.id,
      scientificName: img.scientificName,
      commonName: img.commonName || null,
      slug: img.slug,
      author: img.author || null,
      locality: img.locality || null,
      license: img.license || null,
      width: null,
      height: null,
      url: `/fish/id/${img.id}/400/300`,
      metadataUrl: `/fish/id/${img.id}.json`,
    })),
  });
});

// GET /api/stats
apiRouter.get("/stats", async (c) => {
  return c.json(getStats());
});

// GET /api/species - list all species
apiRouter.get("/species", async (c) => {
  const speciesList = getSpecies();

  return c.json({
    count: speciesList.length,
    species: speciesList.map((s) => ({
      slug: s.slug,
      scientificName: s.scientificName,
      commonName: s.commonName || null,
      imageCount: s.imageCount,
      url: `/fish/species/${s.slug}/400/300`,
    })),
  });
});

// GET /api/species/:slug
apiRouter.get("/species/:slug", async (c) => {
  const slug = c.req.param("slug");
  const { getImagesBySpeciesSlug } = await import("../services/metadata.service.js");

  const images = getImagesBySpeciesSlug(slug);
  if (images.length === 0) return c.json({ error: "Species not found" }, 404);

  const species = getSpecies().find((s) => s.slug === slug);

  return c.json({
    slug,
    scientificName: species?.scientificName || slug,
    commonName: species?.commonName || null,
    imageCount: images.length,
    images: images.map((img) => ({
      id: img.id,
      scientificName: img.scientificName,
      commonName: img.commonName || null,
      slug: img.slug,
      author: img.author || null,
      locality: img.locality || null,
      license: img.license || null,
      url: `/fish/id/${img.id}/400/300`,
      metadataUrl: `/fish/id/${img.id}.json`,
    })),
  });
});

// GET /api/localities
apiRouter.get("/localities", async (c) => {
  const localities = getLocalities();

  return c.json({
    count: localities.length,
    localities: localities.map((l) => ({
      slug: l.slug,
      name: l.name,
      imageCount: l.imageCount,
    })),
  });
});

// GET /api/localities/:slug
apiRouter.get("/localities/:slug", async (c) => {
  const slug = c.req.param("slug");
  const images = getImagesByLocalitySlug(slug);

  if (images.length === 0) return c.json({ error: "Locality not found" }, 404);

  return c.json({
    slug,
    imageCount: images.length,
    images: images.map((img) => ({
      id: img.id,
      scientificName: img.scientificName,
      commonName: img.commonName || null,
      slug: img.slug,
      author: img.author || null,
      locality: img.locality || null,
      license: img.license || null,
      url: `/fish/id/${img.id}/400/300`,
      metadataUrl: `/fish/id/${img.id}.json`,
    })),
  });
});

// GET /api/images - list images with pagination
apiRouter.get("/images", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");

  const result = getImagesPaginated(page, limit);

  return c.json({
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
    images: result.images.map((img) => ({
      id: img.id,
      scientificName: img.scientificName,
      commonName: img.commonName || null,
      slug: img.slug,
      author: img.author || null,
      locality: img.locality || null,
      license: img.license || null,
      width: null,
      height: null,
      url: `/fish/id/${img.id}/400/300`,
      metadataUrl: `/fish/id/${img.id}.json`,
    })),
  });
});

export default apiRouter;
