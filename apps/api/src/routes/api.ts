import { Hono } from "hono";
import prisma from "../lib/prisma.js";

const apiRouter = new Hono();

// GET /api/search?q=...
apiRouter.get("/search", async (c) => {
  const q = c.req.query("q");
  if (!q || q.trim() === "") {
    return c.json({ results: [], query: q });
  }

  const searchTerm = q.trim();

  const results = await prisma.fishImage.findMany({
    where: {
      OR: [
        { scientificName: { contains: searchTerm, mode: "insensitive" } },
        { commonName: { contains: searchTerm, mode: "insensitive" } },
        { locality: { contains: searchTerm, mode: "insensitive" } },
        { author: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    take: 50,
    orderBy: { scientificName: "asc" },
  });

  return c.json({
    query: searchTerm,
    count: results.length,
    results: results.map((img) => ({
      id: img.id,
      scientificName: img.scientificName,
      commonName: img.commonName,
      slug: img.slug,
      author: img.author,
      locality: img.locality,
      license: img.license,
      width: img.width,
      height: img.height,
      url: `/fish/id/${img.id}/400/300`,
      metadataUrl: `/fish/id/${img.id}.json`,
    })),
  });
});

// GET /api/stats
apiRouter.get("/stats", async (c) => {
  const [totalImages, totalSpecies, totalSources] = await Promise.all([
    prisma.fishImage.count(),
    prisma.fishImage.findMany({
      select: { slug: true },
      distinct: ["slug"],
    }),
    prisma.fishImage.findMany({
      select: { sourcePageUrl: true },
      where: { sourcePageUrl: { not: null } },
      distinct: ["sourcePageUrl"],
    }),
  ]);

  return c.json({
    totalImages,
    totalSpecies: totalSpecies.length,
    totalSources: totalSources.length,
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
  });
});

// GET /api/species - list all species
apiRouter.get("/species", async (c) => {
  const species = await prisma.fishImage.groupBy({
    by: ["slug", "scientificName", "commonName"],
    _count: { id: true },
  });

  return c.json({
    count: species.length,
    species: species.map((s: any) => ({
      slug: s.slug,
      scientificName: s.scientificName,
      commonName: s.commonName,
      imageCount: s._count.id,
      url: `/fish/species/${s.slug}/400/300`,
    })),
  });
});

// GET /api/images - list images with pagination
apiRouter.get("/images", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const [images, total] = await Promise.all([
    prisma.fishImage.findMany({
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
    prisma.fishImage.count(),
  ]);

  return c.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    images: images.map((img) => ({
      id: img.id,
      scientificName: img.scientificName,
      commonName: img.commonName,
      slug: img.slug,
      author: img.author,
      locality: img.locality,
      license: img.license,
      width: img.width,
      height: img.height,
      url: `/fish/id/${img.id}/400/300`,
      metadataUrl: `/fish/id/${img.id}.json`,
    })),
  });
});

export default apiRouter;
